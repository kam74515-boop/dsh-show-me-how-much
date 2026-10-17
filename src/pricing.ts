import type { CostModelUsage, CostSettings, CostTokenBuckets } from './types.js'

/** Official CNY peak prices verified on 2026-10-17; applied to all selected usage. */
export const DEFAULT_COST_SETTINGS: Readonly<CostSettings> = Object.freeze({
  flashCacheHit: 0.04,
  flashCacheMiss: 2,
  flashOutput: 8,
  proCacheHit: 0.30,
  proCacheMiss: 9,
  proOutput: 27,
  fallbackCacheHit: 0.04,
  fallbackCacheMiss: 2,
  fallbackOutput: 8,
})

/** Off-peak preset. Fallback rates remain user-controlled, not official model prices. */
export const OFF_PEAK_COST_SETTINGS: Readonly<CostSettings> = Object.freeze({
  ...DEFAULT_COST_SETTINGS,
  flashCacheHit: 0.02,
  flashCacheMiss: 1,
  flashOutput: 4,
  proCacheHit: 0.15,
  proCacheMiss: 4.5,
  proOutput: 13.5,
})

export interface CostRates {
  cacheHit: number
  cacheMiss: number
  output: number
  priceClass: 'flash' | 'pro' | 'fallback'
}

/** Select a price class from the provider-owned model id. */
export function ratesForModel(model: string, settings: CostSettings): CostRates {
  const normalized = model.toLowerCase()
  if (normalized.includes('v4-pro')) {
    return {
      cacheHit: settings.proCacheHit,
      cacheMiss: settings.proCacheMiss,
      output: settings.proOutput,
      priceClass: 'pro',
    }
  }
  if (
    normalized === 'deepseek-flash'
    || normalized.includes('v4.1-flash')
    || normalized.includes('v4-flash')
    || normalized === 'deepseek-chat'
    || normalized === 'deepseek-reasoner'
  ) {
    return {
      cacheHit: settings.flashCacheHit,
      cacheMiss: settings.flashCacheMiss,
      output: settings.flashOutput,
      priceClass: 'flash',
    }
  }
  return {
    cacheHit: settings.fallbackCacheHit,
    cacheMiss: settings.fallbackCacheMiss,
    output: settings.fallbackOutput,
    priceClass: 'fallback',
  }
}

/** Estimate one bucket group; cache writes use the cache-miss input rate. */
export function costForBuckets(buckets: CostTokenBuckets, rates: CostRates): number {
  const inputMiss = buckets.uncachedInputTokens + buckets.cacheWriteTokens
  return (
    buckets.cacheReadTokens * rates.cacheHit
    + inputMiss * rates.cacheMiss
    + buckets.outputTokens * rates.output
  ) / 1_000_000
}

/** Estimate a collection whose rows preserve their model identity. */
export function costForModels(models: readonly CostModelUsage[], settings: CostSettings): number {
  return models.reduce(
    (total, row) => total + costForBuckets(row, ratesForModel(row.model, settings)),
    0,
  )
}
