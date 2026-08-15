import { useSyncExternalStore } from 'react'
import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
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
