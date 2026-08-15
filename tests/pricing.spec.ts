import { describe, expect, it } from 'vitest'
import { costForBuckets, DEFAULT_COST_SETTINGS, ratesForModel } from '../src/pricing.js'

describe('cost calculator', () => {
  it('uses disjoint cache hit, miss/write, and output buckets', () => {
    const cost = costForBuckets({
      uncachedInputTokens: 1_000_000,
      cacheReadTokens: 1_000_000,
      cacheWriteTokens: 500_000,
      outputTokens: 1_000_000,
    }, ratesForModel('deepseek-v4-flash', DEFAULT_COST_SETTINGS))
    expect(cost).toBeCloseTo(3.52)
  })

  it('selects V4 Pro and falls back explicitly', () => {
    expect(ratesForModel('deepseek-v4-pro', DEFAULT_COST_SETTINGS).priceClass).toBe('pro')
    expect(ratesForModel('custom-model', DEFAULT_COST_SETTINGS).priceClass).toBe('fallback')
  })
})
