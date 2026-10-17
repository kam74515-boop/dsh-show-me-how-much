import type { ConfigForm as SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import { memo } from 'react'
import type { UseProjection } from '@deepseek-ai/dsh-api-session-controller/client'
import { costForModels } from '../pricing.js'
import type { CostSettings } from '../types.js'
import { formatMoney, formatTokens, totalTokens } from './format.js'
import { CoinIcon } from './icons.js'
import { useCostSettings } from './settings-hook.js'

export interface CostDockProps {
  useProjection: UseProjection
  scope: SettingsScope<CostSettings>
}

export const CostDock = memo(function CostDock({ useProjection, scope }: CostDockProps) {
  const usage = useProjection('costUsage')
  const { settings } = useCostSettings(scope)
  if (usage === undefined || totalTokens(usage) === 0) return null
  const cost = costForModels(usage.models, settings)
  const hitInput = usage.cacheReadTokens
  const missInput = usage.uncachedInputTokens + usage.cacheWriteTokens
  const title = [
    `估算费用 ${formatMoney(cost)}`,
    `缓存命中 ${formatTokens(hitInput)} tok`,
    `缓存未命中 ${formatTokens(missInput)} tok`,
    `输出 ${formatTokens(usage.outputTokens)} tok`,
    '点击左下角设置 → 费用统计可查看明细和调整单价',
  ].join('\n')
  return (
    <span className="smhm_dock" title={title} aria-label={title}>
      <CoinIcon className="smhm_dockIcon" />
      <span className="smhm_dockMoney">{formatMoney(cost, true)}</span>
      <span className="smhm_dockTokens">· {formatTokens(totalTokens(usage))} tok</span>
    </span>
  )
})
