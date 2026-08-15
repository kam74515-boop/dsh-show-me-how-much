import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type { CostSettings } from '../types.js'
import { CostDock } from './CostDock.js'
import { CostSettingsSection } from './CostSettings.js'
import { ensureCss } from './styles.js'

export const name = 'dsh-show-me-how-much-client'
export const inject = ['slots', 'settingsScope']

export function apply(ctx: ClientContext): void {
  ensureCss()
  const scope = ctx.settingsScope.bind<CostSettings>({ namespace: 'show-me-how-much' }) as SettingsScope<CostSettings>
  const injected = () => ({ scope })

  ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
    name: 'conversation.composer.dock',
    id: 'show-me-how-much',
    order: 100,
    inject: injected,
  }, CostDock))

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'show-me-how-much',
    order: 35,
    label: '费用统计',
    inject: injected,
  }, CostSettingsSection))
}
