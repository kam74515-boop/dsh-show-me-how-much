import z from "@deepseek-ai/schemastery";
import { z as z$1 } from "zod";
import { Context } from "@deepseek-ai/cordis";
import { SessionEvent } from "@deepseek-ai/dsh-session";
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
interface CostUsageState {
  totals: CostTokenBuckets;
  models: CostModelUsage[];
  days: CostDayUsage[];
  route: Route;
  last: null;
  firstAt?: number | undefined;
  lastAt?: number | undefined;
}
declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionStateMap {
    costUsage: CostUsageState;
  }
}
/** Replay-aware, model-aware token projection used by both plugin surfaces. */
declare const costUsageProjectionDefinition: {
  key: "costUsage";
  stateSchema: z$1.ZodObject<{
    totals: z$1.ZodObject<{
      uncachedInputTokens: z$1.ZodNumber;
      outputTokens: z$1.ZodNumber;
      cacheReadTokens: z$1.ZodNumber;
      cacheWriteTokens: z$1.ZodNumber;
    }, z$1.core.$strip>;
    models: z$1.ZodArray<z$1.ZodObject<{
      uncachedInputTokens: z$1.ZodNumber;
      outputTokens: z$1.ZodNumber;
      cacheReadTokens: z$1.ZodNumber;
      cacheWriteTokens: z$1.ZodNumber;
      provider: z$1.ZodString;
      model: z$1.ZodString;
    }, z$1.core.$strict>>;
    days: z$1.ZodArray<z$1.ZodObject<{
      uncachedInputTokens: z$1.ZodNumber;
      outputTokens: z$1.ZodNumber;
      cacheReadTokens: z$1.ZodNumber;
      cacheWriteTokens: z$1.ZodNumber;
      date: z$1.ZodString;
      firstAt: z$1.ZodNumber;
      lastAt: z$1.ZodNumber;
      models: z$1.ZodArray<z$1.ZodObject<{
        uncachedInputTokens: z$1.ZodNumber;
        outputTokens: z$1.ZodNumber;
        cacheReadTokens: z$1.ZodNumber;
        cacheWriteTokens: z$1.ZodNumber;
        provider: z$1.ZodString;
        model: z$1.ZodString;
      }, z$1.core.$strict>>;
    }, z$1.core.$strict>>;
    route: z$1.ZodObject<{
      provider: z$1.ZodString;
      model: z$1.ZodString;
    }, z$1.core.$strip>;
    last: z$1.ZodNull;
    firstAt: z$1.ZodOptional<z$1.ZodNumber>;
    lastAt: z$1.ZodOptional<z$1.ZodNumber>;
  }, z$1.core.$strip>;
  init: () => CostUsageState;
  apply: (state: CostUsageState, event: SessionEvent) => CostUsageState;
  wire: {
    viewSchema: z$1.ZodType<CostUsageProjection, unknown, z$1.core.$ZodTypeInternals<CostUsageProjection, unknown>>;
    view: (state: CostUsageState) => CostUsageProjection;
  };
  stateVersion: number;
};
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
declare const Config: z<Schemastery.ObjectS<NoInfer<{
  flashCacheHit: z<number, number, "volatile-defined">;
  flashCacheMiss: z<number, number, "volatile-defined">;
  flashOutput: z<number, number, "volatile-defined">;
  proCacheHit: z<number, number, "volatile-defined">;
  proCacheMiss: z<number, number, "volatile-defined">;
  proOutput: z<number, number, "volatile-defined">;
  fallbackCacheHit: z<number, number, "volatile-defined">;
  fallbackCacheMiss: z<number, number, "volatile-defined">;
  fallbackOutput: z<number, number, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
  flashCacheHit: z<number, number, "volatile-defined">;
  flashCacheMiss: z<number, number, "volatile-defined">;
  flashOutput: z<number, number, "volatile-defined">;
  proCacheHit: z<number, number, "volatile-defined">;
  proCacheMiss: z<number, number, "volatile-defined">;
  proOutput: z<number, number, "volatile-defined">;
  fallbackCacheHit: z<number, number, "volatile-defined">;
  fallbackCacheMiss: z<number, number, "volatile-defined">;
  fallbackOutput: z<number, number, "volatile-defined">;
}>>, "plain">;
/** Register the host-backed price table and replayable token projection. */
declare function apply(ctx: Context): void;
//#endregion
export { COST_SETTINGS_NAMESPACE, Config, type CostDayUsage, type CostModelUsage, type CostSettings, type CostTokenBuckets, type CostUsageProjection, DEFAULT_COST_SETTINGS, OFF_PEAK_COST_SETTINGS, apply, costForBuckets, costForModels, costUsageProjectionDefinition, name, ratesForModel };
//# sourceMappingURL=index.d.ts.map