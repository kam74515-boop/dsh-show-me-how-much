import { describe, expect, it } from 'vitest'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { costUsageProjectionDefinition as definition } from '../src/projection.js'

const event = (type: string, seq: number, time: number, data: unknown): SessionEvent => ({
  type, seq, time, data,
} as SessionEvent)

describe('cost usage projection', () => {
  it('counts settled attempts and messages without dropping retry usage', () => {
    let state = definition.init()
    state = definition.apply(state, event('request/context', 0, Date.UTC(2026, 7, 15), {
      provider: 'deepseek', model: 'deepseek-v4-flash', contextWindow: 1_000_000,
    }))
    state = definition.apply(state, event('assistant/attempt', 1, Date.UTC(2026, 7, 15, 1), {
      turn: 1, step: 1, stream: [{ type: 'chunk', time: 0, chunk: { type: 'usage', usage: {
        inputTokens: 100, outputTokens: 20, cacheReadTokens: 900,
      } } }],
    }))
    state = definition.apply(state, event('assistant/message', 2, Date.UTC(2026, 7, 15, 1, 1), {
      turn: 1, step: 1, message: { role: 'assistant', content: [] }, stream: [], usage: {
        inputTokens: 120, outputTokens: 25, cacheReadTokens: 980,
      },
    }))
    const view = definition.wire.view(state)
    expect(view).toMatchObject({ uncachedInputTokens: 220, outputTokens: 45, cacheReadTokens: 1880 })
    expect(view.models).toHaveLength(1)
    expect(view.models[0]).toMatchObject({ provider: 'deepseek', model: 'deepseek-v4-flash' })
    expect(view.days[0]?.date).toBe('2026-08-15')
  })
  it('prefers message usage over stream samples and validates persisted state', () => {
    const state = definition.apply(definition.init(), event('assistant/message', 0, Date.UTC(2026, 9, 17), {
      turn: 1, step: 1, message: { role: 'assistant', content: [] },
      stream: [{ type: 'chunk', time: 0, chunk: { type: 'usage', usage: { inputTokens: 10, outputTokens: 2 } } }],
      usage: { inputTokens: 20, outputTokens: 4 },
    }))
    expect(definition.wire.view(state)).toMatchObject({ uncachedInputTokens: 20, outputTokens: 4 })
    expect(definition.stateSchema.safeParse(state).success).toBe(true)
    expect(definition.stateSchema.safeParse({ ...state, totals: { ...state.totals, outputTokens: -1 } }).success).toBe(false)
  })

})
