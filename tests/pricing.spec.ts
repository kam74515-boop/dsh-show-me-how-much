import { describe, expect, it } from 'vitest'
import { costForBuckets, DEFAULT_COST_SETTINGS, OFF_PEAK_COST_SETTINGS, ratesForModel } from '../src/pricing.js'

describe('cost calculator', () => {
  it('uses disjoint cache hit, miss/write, and output buckets', () => {
    const cost = costForBuckets({
      uncachedInputTokens: 1_000_000,
      cacheReadTokens: 1_000_000,
      cacheWriteTokens: 500_000,
      outputTokens: 1_000_000,
    }, ratesForModel('deepseek-v4-flash', DEFAULT_COST_SETTINGS))
    expect(cost).toBeCloseTo(11.04)
  })

  it('selects V4 Pro and falls back explicitly', () => {
    expect(ratesForModel('deepseek-v4-pro', DEFAULT_COST_SETTINGS).priceClass).toBe('pro')
    expect(ratesForModel('custom-model', DEFAULT_COST_SETTINGS).priceClass).toBe('fallback')
  })
})

describe('official pricing presets', () => {
  it.each(['deepseek-flash', 'deepseek-v4-flash', 'deepseek-v4-flash-vision-exp', 'DeepSeek-V4.1-Flash-1017'])(
    'recognizes Flash model %s', model => {
      expect(ratesForModel(model, DEFAULT_COST_SETTINGS)).toEqual({ cacheHit: 0.04, cacheMiss: 2, output: 8, priceClass: 'flash' })
    },
  )

  it('offers half-price off-peak rates for both official model classes', () => {
    for (const model of ['deepseek-flash', 'deepseek-v4-pro']) {
      const peak = ratesForModel(model, DEFAULT_COST_SETTINGS)
      const offPeak = ratesForModel(model, OFF_PEAK_COST_SETTINGS)
      for (const field of ['cacheHit', 'cacheMiss', 'output'] as const) {
        expect(offPeak[field]).toBe(peak[field] / 2)
      }
    }
    expect(ratesForModel('deepseek-v4-pro', OFF_PEAK_COST_SETTINGS)).toEqual({ cacheHit: 0.15, cacheMiss: 4.5, output: 13.5, priceClass: 'pro' })
  })
})
