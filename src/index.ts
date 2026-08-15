import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-session-projection'
import { costUsageProjectionDefinition } from './projection.js'
import { DEFAULT_COST_SETTINGS } from './pricing.js'
import type { CostSettings } from './types.js'

export const name = 'dsh-show-me-how-much'
export const COST_SETTINGS_NAMESPACE = 'show-me-how-much'

const CostSettingsSchema: z<CostSettings> = z.object({
  flashCacheHit: z.number(),
  flashCacheMiss: z.number(),
  flashOutput: z.number(),
  proCacheHit: z.number(),
  proCacheMiss: z.number(),
  proOutput: z.number(),
  fallbackCacheHit: z.number(),
  fallbackCacheMiss: z.number(),
  fallbackOutput: z.number(),
})

/** Register the host-backed price table and replayable token projection. */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], settingsCtx => {
    settingsCtx.settings.register(
      settingsNamespace(COST_SETTINGS_NAMESPACE),
      CostSettingsSchema,
      { base: DEFAULT_COST_SETTINGS },
    )
  })
  ctx.inject(['sessionProjections'], projectionCtx => {
    projectionCtx.sessionProjections.register(costUsageProjectionDefinition)
  })
}

export { costUsageProjectionDefinition } from './projection.js'
export { costForBuckets, costForModels, ratesForModel, DEFAULT_COST_SETTINGS } from './pricing.js'
export type * from './types.js'
