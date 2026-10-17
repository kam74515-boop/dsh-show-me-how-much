import { z } from 'zod'
import type { TokenUsage } from '@deepseek-ai/dsh-llm'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
import type {
  CostDayUsage, CostModelUsage, CostTokenBuckets, CostUsageProjection,
} from './types.js'

interface Route {
  provider: string
  model: string
}

interface UsageSample extends Route {
  turn: number
  step: number
  time: number
  date: string
  buckets: CostTokenBuckets
}

export interface CostUsageState {
  totals: CostTokenBuckets
  models: CostModelUsage[]
  days: CostDayUsage[]
  route: Route
  last: null
  firstAt?: number | undefined
  lastAt?: number | undefined
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionStateMap {
    costUsage: CostUsageState
  }
}

const zeroBuckets = (): CostTokenBuckets => ({
  uncachedInputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
})

const bucketSchema = {
  uncachedInputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  cacheReadTokens: z.number().int().nonnegative(),
  cacheWriteTokens: z.number().int().nonnegative(),
}

const modelSchema = z.object({
  provider: z.string(),
  model: z.string(),
  ...bucketSchema,
}).strict()

const daySchema = z.object({
  date: z.string(),
  firstAt: z.number().nonnegative(),
  lastAt: z.number().nonnegative(),
  models: z.array(modelSchema),
  ...bucketSchema,
}).strict()

const projectionSchema: z.ZodType<CostUsageProjection> = z.object({
  ...bucketSchema,
  firstAt: z.number().nonnegative().optional(),
  lastAt: z.number().nonnegative().optional(),
  models: z.array(modelSchema),
  days: z.array(daySchema),
}).strict() as z.ZodType<CostUsageProjection>

const bucketsFrom = (usage: TokenUsage): CostTokenBuckets => ({
  uncachedInputTokens: usage.inputTokens,
  outputTokens: usage.outputTokens,
  cacheReadTokens: usage.cacheReadTokens ?? 0,
  cacheWriteTokens: usage.cacheWriteTokens ?? 0,
})

const addBuckets = (a: CostTokenBuckets, b: CostTokenBuckets, sign = 1): CostTokenBuckets => ({
  uncachedInputTokens: a.uncachedInputTokens + sign * b.uncachedInputTokens,
  outputTokens: a.outputTokens + sign * b.outputTokens,
  cacheReadTokens: a.cacheReadTokens + sign * b.cacheReadTokens,
  cacheWriteTokens: a.cacheWriteTokens + sign * b.cacheWriteTokens,
})

function updateModels(
  rows: readonly CostModelUsage[],
  sample: Route & { buckets: CostTokenBuckets },
  sign: 1 | -1,
): CostModelUsage[] {
  const index = rows.findIndex(row => row.provider === sample.provider && row.model === sample.model)
  if (index < 0) {
    if (sign < 0) return [...rows]
    return [...rows, { provider: sample.provider, model: sample.model, ...sample.buckets }]
  }
  const current = rows[index]
  if (current === undefined) return [...rows]
  const nextBuckets = addBuckets(current, sample.buckets, sign)
  const next = [...rows]
  next[index] = { provider: current.provider, model: current.model, ...nextBuckets }
  return next
}

function updateDays(rows: readonly CostDayUsage[], sample: UsageSample, sign: 1 | -1): CostDayUsage[] {
  const index = rows.findIndex(row => row.date === sample.date)
  if (index < 0) {
    if (sign < 0) return [...rows]
    return [...rows, {
      date: sample.date,
      firstAt: sample.time,
      lastAt: sample.time,
      models: [{ provider: sample.provider, model: sample.model, ...sample.buckets }],
      ...sample.buckets,
    }].sort((a, b) => a.date.localeCompare(b.date))
  }
  const current = rows[index]
  if (current === undefined) return [...rows]
  const next = [...rows]
  next[index] = {
    date: current.date,
    firstAt: sign > 0 ? Math.min(current.firstAt, sample.time) : current.firstAt,
    lastAt: sign > 0 ? Math.max(current.lastAt, sample.time) : current.lastAt,
    models: updateModels(current.models, sample, sign),
    ...addBuckets(current, sample.buckets, sign),
  }
  return next
}

function usageOf(event: SessionEvent): { turn: number; step: number; usage: TokenUsage } | undefined {
  if (event.type !== 'assistant/message' && event.type !== 'assistant/attempt') return undefined
  let usage = event.type === 'assistant/message' ? event.data.usage : undefined
  if (usage === undefined) {
    for (const record of event.data.stream) {
      if (record.type === 'chunk' && record.chunk.type === 'usage') usage = record.chunk.usage
    }
  }
  if (usage !== undefined) return { turn: event.data.turn, step: event.data.step, usage }
  return undefined
}

const isoDate = (time: number): string => new Date(time).toISOString().slice(0, 10)

/** Replay-aware, model-aware token projection used by both plugin surfaces. */
export const costUsageProjectionDefinition = {
  key: 'costUsage',
  stateSchema: z.object({
    totals: z.object(bucketSchema),
    models: z.array(modelSchema),
    days: z.array(daySchema),
    route: z.object({ provider: z.string(), model: z.string() }),
    last: z.null(),
    firstAt: z.number().optional(),
    lastAt: z.number().optional(),
  }),
  init: (): CostUsageState => ({
    totals: zeroBuckets(),
    models: [],
    days: [],
    route: { provider: 'unknown', model: 'unknown' },
    last: null,
  }),
  apply: (state: CostUsageState, event: SessionEvent): CostUsageState => {
    if (event.type === 'request/context') {
      const route = { provider: event.data.provider, model: event.data.model }
      return route.provider === state.route.provider && route.model === state.route.model
        ? state
        : { ...state, route }
    }

    const report = usageOf(event)
    if (report === undefined) return state
    const buckets = bucketsFrom(report.usage)
    const sample: UsageSample = {
      turn: report.turn,
      step: report.step,
      time: event.time,
      date: isoDate(event.time),
      provider: state.route.provider,
      model: state.route.model,
      buckets,
    }
    let totals = state.totals
    let models = state.models
    let days = state.days
    totals = addBuckets(totals, sample.buckets)
    models = updateModels(models, sample, 1)
    days = updateDays(days, sample, 1)
    return {
      ...state,
      totals,
      models,
      days,
      last: null,
      firstAt: state.firstAt === undefined ? event.time : Math.min(state.firstAt, event.time),
      lastAt: Math.max(state.lastAt ?? event.time, event.time),
    }
  },
  wire: {
    viewSchema: projectionSchema,
    view: (state: CostUsageState): CostUsageProjection => ({
      ...state.totals,
      ...state.firstAt === undefined ? {} : { firstAt: state.firstAt },
      ...state.lastAt === undefined ? {} : { lastAt: state.lastAt },
      models: state.models,
      days: state.days,
    }),
  },
  stateVersion: 2,
} satisfies ProjectionDefinition<'costUsage', CostUsageState>
