import { describe, expect, it } from 'vitest'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { costUsageProjectionDefinition as definition } from '../src/projection.js'

const event = (type: string, seq: number, time: number, data: unknown): SessionEvent => ({
  type, seq, time, data,
} as SessionEvent)

describe('cost usage projection', () => {
  it('attributes usage to model/day and replaces a chunk sample with the final sample', () => {
    let state = definition.init()
    state = definition.apply(state, event('request/context', 0, Date.UTC(2026, 7, 15), {
      provider: 'deepseek', model: 'deepseek-v4-flash', contextWindow: 1_000_000,
    }))
    state = definition.apply(state, event('assistant/chunk', 1, Date.UTC(2026, 7, 15, 1), {
      turn: 1, step: 1, chunk: { type: 'usage', usage: {
        inputTokens: 100, outputTokens: 20, cacheReadTokens: 900,
      } },
    }))
    state = definition.apply(state, event('assistant/message', 2, Date.UTC(2026, 7, 15, 1, 1), {
      turn: 1, step: 1, message: { role: 'assistant', content: [] }, usage: {
        inputTokens: 120, outputTokens: 25, cacheReadTokens: 980,
      },
    }))
    const view = definition.view(state)
    expect(view).toMatchObject({ uncachedInputTokens: 120, outputTokens: 25, cacheReadTokens: 980 })
    expect(view.models).toHaveLength(1)
    expect(view.models[0]).toMatchObject({ provider: 'deepseek', model: 'deepseek-v4-flash' })
    expect(view.days[0]?.date).toBe('2026-08-15')
  })
})
