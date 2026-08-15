/** Disjoint token buckets reported by a provider through DeepSeek Harness. */
export interface CostTokenBuckets {
  uncachedInputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
}

/** Token usage attributed to one provider/model route. */
export interface CostModelUsage extends CostTokenBuckets {
  provider: string
  model: string
}

/** One UTC calendar day's usage, including its model split. */
export interface CostDayUsage extends CostTokenBuckets {
  date: string
  firstAt: number
  lastAt: number
  models: CostModelUsage[]
}

/** Whole-log usage projection consumed by the cost UI. */
export interface CostUsageProjection extends CostTokenBuckets {
  firstAt?: number
  lastAt?: number
  models: CostModelUsage[]
  days: CostDayUsage[]
}

/** Host-backed pricing preferences, denominated per one million tokens. */
export interface CostSettings {
  flashCacheHit: number
  flashCacheMiss: number
  flashOutput: number
  proCacheHit: number
  proCacheMiss: number
  proOutput: number
  fallbackCacheHit: number
  fallbackCacheMiss: number
  fallbackOutput: number
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    costUsage: CostUsageProjection
  }
}
