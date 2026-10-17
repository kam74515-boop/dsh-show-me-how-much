import { Context } from "@deepseek-ai/cordis";
import { ProjectionDefinition } from "@deepseek-ai/dsh-session-projection";
//#region src/types.d.ts
/** Disjoint token buckets reported by a provider through DeepSeek Harness. */
interface CostTokenBuckets {
  uncachedInputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}
/** Token usage attributed to one provider/model route. */
interface CostModelUsage extends CostTokenBuckets {
  provider: string;
  model: string;
}
/** One UTC calendar day's usage, including its model split. */
interface CostDayUsage extends CostTokenBuckets {
  date: string;
  firstAt: number;
  lastAt: number;
  models: CostModelUsage[];
}
/** Whole-log usage projection consumed by the cost UI. */
interface CostUsageProjection extends CostTokenBuckets {
  firstAt?: number;
  lastAt?: number;
  models: CostModelUsage[];
  days: CostDayUsage[];
}
/** Host-backed pricing preferences, denominated per one million tokens. */
interface CostSettings {
  flashCacheHit: number;
  flashCacheMiss: number;
  flashOutput: number;
  proCacheHit: number;
  proCacheMiss: number;
  proOutput: number;
  fallbackCacheHit: number;
  fallbackCacheMiss: number;
  fallbackOutput: number;
}
declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    costUsage: CostUsageProjection;
  }
}
//#endregion
//#region src/projection.d.ts
interface Route {
  provider: string;
  model: string;
}
interface UsageSample extends Route {
  turn: number;
  step: number;
  time: number;
  date: string;
  buckets: CostTokenBuckets;
}
interface CostUsageState {
  totals: CostTokenBuckets;
  models: CostModelUsage[];
  days: CostDayUsage[];
  route: Route;
  last: UsageSample | null;
  firstAt?: number;
  lastAt?: number;
}
/** Replay-aware, model-aware token projection used by both plugin surfaces. */
declare const costUsageProjectionDefinition: ProjectionDefinition<'costUsage', CostUsageState>;
//#endregion
//#region src/pricing.d.ts
/** Official CNY peak prices verified on 2026-10-17; applied to all selected usage. */
declare const DEFAULT_COST_SETTINGS: Readonly<CostSettings>;
/** Off-peak preset. Fallback rates remain user-controlled, not official model prices. */
declare const OFF_PEAK_COST_SETTINGS: Readonly<CostSettings>;
interface CostRates {
  cacheHit: number;
  cacheMiss: number;
  output: number;
  priceClass: 'flash' | 'pro' | 'fallback';
}
/** Select a price class from the provider-owned model id. */
declare function ratesForModel(model: string, settings: CostSettings): CostRates;
/** Estimate one bucket group; cache writes use the cache-miss input rate. */
declare function costForBuckets(buckets: CostTokenBuckets, rates: CostRates): number;
/** Estimate a collection whose rows preserve their model identity. */
declare function costForModels(models: readonly CostModelUsage[], settings: CostSettings): number;
//#endregion
//#region src/index.d.ts
declare const name = "dsh-show-me-how-much";
declare const COST_SETTINGS_NAMESPACE = "show-me-how-much";
/** Register the host-backed price table and replayable token projection. */
declare function apply(ctx: Context): void;
//#endregion
export { COST_SETTINGS_NAMESPACE, type CostDayUsage, type CostModelUsage, type CostSettings, type CostTokenBuckets, type CostUsageProjection, DEFAULT_COST_SETTINGS, OFF_PEAK_COST_SETTINGS, apply, costForBuckets, costForModels, costUsageProjectionDefinition, name, ratesForModel };
//# sourceMappingURL=index.d.ts.map