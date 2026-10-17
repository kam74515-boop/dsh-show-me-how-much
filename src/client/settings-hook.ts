import { useSyncExternalStore } from 'react'
import type { ConfigForm as SettingsScope, ConfigFormSnapshot as SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import { DEFAULT_COST_SETTINGS } from '../pricing.js'
import type { CostSettings } from '../types.js'

export function useCostSettings(scope: SettingsScope<CostSettings>): {
  settings: CostSettings
  snapshot: SettingsScopeSnapshot<CostSettings>
} {
  const snapshot = useSyncExternalStore(
    listener => scope.subscribe(listener),
    () => scope.getSnapshot(),
    () => scope.getSnapshot(),
  )
  return { settings: snapshot.value ?? DEFAULT_COST_SETTINGS, snapshot }
}
