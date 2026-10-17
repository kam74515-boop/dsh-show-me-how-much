import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { useEffect, useSyncExternalStore } from 'react'
import type { SessionListState, ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type { CostSettings } from '../types.js'
import { CostDock } from './CostDock.js'
import { CostSettingsSection } from './CostSettings.js'
import { ensureCss } from './styles.js'

export const name = 'dsh-show-me-how-much-client'
export const inject = ['slots', 'configForms', 'sessions']

export function apply(ctx: Context): void {
  ensureCss()
  const scope = ctx.configForms.get<CostSettings>('show-me-how-much')
  const sessions = ctx.sessions as unknown as ISessions
  const useSessions: SnapshotSelectorHook<SessionListState> = selector => {
    const state = useSyncExternalStore(
      listener => sessions.list.subscribe(listener),
      () => sessions.list.getSnapshot(),
    )
    useEffect(() => {
      void Promise.allSettled(state.ids.map(id => sessions.refreshProjections(id)))
    }, [state.ids])
    return selector(state)
  }
  const injected = () => ({ scope, useSessions })

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
