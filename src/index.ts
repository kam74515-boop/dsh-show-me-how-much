import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-session-projection'
import { costUsageProjectionDefinition } from './projection.js'
import { DEFAULT_COST_SETTINGS } from './pricing.js'

export const name = 'dsh-show-me-how-much'
export const COST_SETTINGS_NAMESPACE = 'show-me-how-much'

export const Config = z.object({
  flashCacheHit: z.number().min(0).default(DEFAULT_COST_SETTINGS.flashCacheHit).volatile(),
  flashCacheMiss: z.number().min(0).default(DEFAULT_COST_SETTINGS.flashCacheMiss).volatile(),
  flashOutput: z.number().min(0).default(DEFAULT_COST_SETTINGS.flashOutput).volatile(),
  proCacheHit: z.number().min(0).default(DEFAULT_COST_SETTINGS.proCacheHit).volatile(),
  proCacheMiss: z.number().min(0).default(DEFAULT_COST_SETTINGS.proCacheMiss).volatile(),
  proOutput: z.number().min(0).default(DEFAULT_COST_SETTINGS.proOutput).volatile(),
  fallbackCacheHit: z.number().min(0).default(DEFAULT_COST_SETTINGS.fallbackCacheHit).volatile(),
  fallbackCacheMiss: z.number().min(0).default(DEFAULT_COST_SETTINGS.fallbackCacheMiss).volatile(),
  fallbackOutput: z.number().min(0).default(DEFAULT_COST_SETTINGS.fallbackOutput).volatile(),
})

/** Register the host-backed price table and replayable token projection. */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], settingsCtx => {
    settingsCtx.effect(() => settingsCtx.settings.configure({ auto: false }, ctx.fiber))
  })
  ctx.inject(['sessionProjections'], projectionCtx => {
    projectionCtx.sessionProjections.register(costUsageProjectionDefinition)
  })
}

export { costUsageProjectionDefinition } from './projection.js'
export { costForBuckets, costForModels, ratesForModel, DEFAULT_COST_SETTINGS, OFF_PEAK_COST_SETTINGS } from './pricing.js'
export type * from './types.js'
