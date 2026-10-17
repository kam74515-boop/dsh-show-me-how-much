import type { ConfigForm as SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import { useMemo, useState } from 'react'
import type {
  SessionListState,
} from '@deepseek-ai/dsh-api-session-controller/client'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-ui-slots'
import { costForModels, DEFAULT_COST_SETTINGS, OFF_PEAK_COST_SETTINGS } from '../pricing.js'
import type {
  CostDayUsage, CostModelUsage, CostSettings, CostTokenBuckets, CostUsageProjection,
} from '../types.js'
import { formatDate, formatMoney, formatTime, formatTokens, totalInput, totalTokens } from './format.js'
import { CacheIcon, ChartIcon, ClockIcon, CoinIcon, TokenIcon } from './icons.js'
import { useCostSettings } from './settings-hook.js'

type Range = 7 | 30 | 'all'

export interface CostSettingsProps {
  scope: SettingsScope<CostSettings>
  useSessions: SnapshotSelectorHook<SessionListState>
}

const zero = (): CostTokenBuckets => ({
  uncachedInputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
})

const add = (a: CostTokenBuckets, b: CostTokenBuckets): CostTokenBuckets => ({
  uncachedInputTokens: a.uncachedInputTokens + b.uncachedInputTokens,
  outputTokens: a.outputTokens + b.outputTokens,
  cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
  cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens,
})

function mergeModels(target: Map<string, CostModelUsage>, rows: readonly CostModelUsage[]): void {
  for (const row of rows) {
    const key = `${row.provider}\u0000${row.model}`
    const current = target.get(key)
    target.set(key, current === undefined ? { ...row } : {
      provider: row.provider,
      model: row.model,
      ...add(current, row),
    })
  }
}

interface Totals extends CostTokenBuckets {
  models: CostModelUsage[]
  days: Array<CostDayUsage & { cost: number }>
  sessionCount: number
  firstAt?: number
  lastAt?: number
}

function aggregate(projections: readonly CostUsageProjection[], range: Range, settings: CostSettings): Totals {
  const cutoff = range === 'all' ? -Infinity : Date.now() - (range - 1) * 86_400_000
  let buckets = zero()
  let sessionCount = 0
  let firstAt: number | undefined
  let lastAt: number | undefined
  const models = new Map<string, CostModelUsage>()
  const days = new Map<string, CostDayUsage>()
  for (const projection of projections) {
    let included = false
    for (const day of projection.days) {
      if (day.lastAt < cutoff) continue
      included = true
      buckets = add(buckets, day)
      mergeModels(models, day.models)
      firstAt = firstAt === undefined ? day.firstAt : Math.min(firstAt, day.firstAt)
      lastAt = lastAt === undefined ? day.lastAt : Math.max(lastAt, day.lastAt)
      const existing = days.get(day.date)
      if (existing === undefined) {
        days.set(day.date, { ...day, models: day.models.map(row => ({ ...row })) })
      } else {
        const dayModels = new Map<string, CostModelUsage>()
        mergeModels(dayModels, existing.models)
        mergeModels(dayModels, day.models)
        days.set(day.date, {
          date: day.date,
          firstAt: Math.min(existing.firstAt, day.firstAt),
          lastAt: Math.max(existing.lastAt, day.lastAt),
          models: [...dayModels.values()],
          ...add(existing, day),
        })
      }
    }
    if (included) sessionCount += 1
  }
  return {
    ...buckets,
    models: [...models.values()].sort((a, b) => totalTokens(b) - totalTokens(a)),
    days: [...days.values()].sort((a, b) => a.date.localeCompare(b.date)).map(day => ({
      ...day,
      cost: costForModels(day.models, settings),
    })),
    sessionCount,
    ...firstAt === undefined ? {} : { firstAt },
    ...lastAt === undefined ? {} : { lastAt },
  }
}

const rangeLabel = (range: Range): string => range === 'all' ? '全部' : `${range} 天`

function StatCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return <div className="smhm_card"><span className="smhm_cardLabel">{icon}{label}</span><strong className="smhm_cardValue" title={value}>{value}</strong><span className="smhm_cardHint">{hint}</span></div>
}

function PriceField({ label, field, value, scope }: {
  label: string
  field: keyof CostSettings
  value: number
  scope: SettingsScope<CostSettings>
}) {
  return <label className="smhm_field">{label}<span className="smhm_inputWrap"><input key={`${field}-${value}`} className="smhm_input" type="number" min="0" step="0.001" defaultValue={value} onBlur={event => {
    const next = Number(event.currentTarget.value)
    if (Number.isFinite(next) && next >= 0) void scope.set(field, next)
    else event.currentTarget.value = String(value)
  }} /><span className="smhm_unit">¥/M</span></span></label>
}

function PriceGroup({ title, prefix, settings, scope }: {
  title: string
  prefix: 'flash' | 'pro' | 'fallback'
  settings: CostSettings
  scope: SettingsScope<CostSettings>
}) {
  const hit = `${prefix}CacheHit` as keyof CostSettings
  const miss = `${prefix}CacheMiss` as keyof CostSettings
  const output = `${prefix}Output` as keyof CostSettings
  return <div className="smhm_priceGroup"><h4 className="smhm_priceTitle">{title}</h4><PriceField label="缓存命中输入" field={hit} value={settings[hit]} scope={scope}/><PriceField label="未命中输入" field={miss} value={settings[miss]} scope={scope}/><PriceField label="输出" field={output} value={settings[output]} scope={scope}/></div>
}

export function CostSettingsSection({ scope, useSessions }: CostSettingsProps) {
  const { settings, snapshot } = useCostSettings(scope)
  const [range, setRange] = useState<Range>(30)
  const projections = useSessions(state => state.ids.map(id => state.byId[id]?.projectionValues?.costUsage).filter((value): value is CostUsageProjection => value !== undefined))
  const totals = useMemo(() => aggregate(projections, range, settings), [projections, range, settings])
  const amount = costForModels(totals.models, settings)
  const input = totalInput(totals)
  const hitPercent = input === 0 ? 0 : totals.cacheReadTokens / input * 100
  const visibleDays = totals.days.slice(-14)
  const maxCost = Math.max(...visibleDays.map(day => day.cost), 0)
  const applyPreset = (preset: Readonly<CostSettings>): void => {
    for (const field of ['flashCacheHit', 'flashCacheMiss', 'flashOutput', 'proCacheHit', 'proCacheMiss', 'proOutput'] as const) {
      void scope.set(field, preset[field])
    }
  }
  const reset = (): void => {
    for (const field of Object.keys(settings) as Array<keyof CostSettings>) void scope.unset(field)
  }

  return <section className="smhm_section">
    <div className="smhm_head"><div><h2 className="smhm_title">费用与 Token</h2><p className="smhm_intro">按 Harness 持久化的 provider 用量统计缓存命中、未命中、输出 Token，并依据模型价格估算费用。</p></div><span className="smhm_pill"><ClockIcon/>{totals.lastAt === undefined ? '暂无记录' : `更新于 ${formatTime(totals.lastAt)}`}</span></div>
    <div className="smhm_range" aria-label="统计范围">{([7, 30, 'all'] as const).map(value => <button key={value} type="button" className="smhm_rangeButton" data-active={range === value ? 'true' : undefined} onClick={() => { setRange(value) }}>{rangeLabel(value)}</button>)}</div>
    <div className="smhm_cards">
      <StatCard icon={<CoinIcon/>} label="估算费用" value={formatMoney(amount)} hint="人民币 · 非平台账单"/>
      <StatCard icon={<TokenIcon/>} label="总 Token" value={formatTokens(totalTokens(totals))} hint={`输入 ${formatTokens(input)} · 输出 ${formatTokens(totals.outputTokens)}`}/>
      <StatCard icon={<CacheIcon/>} label="缓存命中率" value={`${hitPercent.toFixed(1)}%`} hint={`命中 ${formatTokens(totals.cacheReadTokens)} tok`}/>
      <StatCard icon={<ClockIcon/>} label="会话 / 时间" value={`${totals.sessionCount} 个`} hint={totals.firstAt === undefined ? '暂无用量' : `${formatTime(totals.firstAt)} → ${formatTime(totals.lastAt ?? totals.firstAt)}`}/>
    </div>
    <div className="smhm_module"><div className="smhm_moduleHead"><h3 className="smhm_moduleTitle"><ChartIcon/>按日费用</h3><span className="smhm_moduleMeta">最近 {visibleDays.length} 个有用量日期 · UTC</span></div>{visibleDays.length === 0 ? <div className="smhm_empty">发送消息后，这里会出现费用趋势。</div> : <div className="smhm_chart">{visibleDays.map(day => <div className="smhm_barCol" key={day.date} title={`${day.date}\n${formatMoney(day.cost)}\n${formatTokens(totalTokens(day))} tok`}><div className="smhm_barTrack"><div className="smhm_bar" style={{ height: `${maxCost === 0 ? 2 : Math.max(3, day.cost / maxCost * 100)}%` }}/></div><span className="smhm_barLabel">{formatDate(day.date)}</span></div>)}</div>}</div>
    <div className="smhm_module"><div className="smhm_moduleHead"><h3 className="smhm_moduleTitle"><TokenIcon/>模型明细</h3><span className="smhm_moduleMeta">{totals.models.length} 条路由</span></div>{totals.models.length === 0 ? <div className="smhm_empty">暂无模型用量。</div> : <table className="smhm_table"><thead><tr><th>模型</th><th>缓存命中</th><th>未命中</th><th>输出</th><th>费用</th></tr></thead><tbody>{totals.models.map(row => <tr key={`${row.provider}/${row.model}`}><td><span className="smhm_model">{row.model}</span><span className="smhm_provider">{row.provider}</span></td><td>{formatTokens(row.cacheReadTokens)}</td><td>{formatTokens(row.uncachedInputTokens + row.cacheWriteTokens)}</td><td>{formatTokens(row.outputTokens)}</td><td className="smhm_price">{formatMoney(costForModels([row], settings), true)}</td></tr>)}</tbody></table>}</div>
    <div className="smhm_module"><div className="smhm_moduleHead"><h3 className="smhm_moduleTitle"><CoinIcon/>计算拆分</h3><span className="smhm_moduleMeta">Token × 单价 / 1,000,000</span></div><div className="smhm_formula"><div className="smhm_formulaItem"><span className="smhm_formulaName">缓存命中输入</span><strong className="smhm_formulaValue">{formatTokens(totals.cacheReadTokens)} tok</strong></div><div className="smhm_formulaItem"><span className="smhm_formulaName">缓存未命中输入</span><strong className="smhm_formulaValue">{formatTokens(totals.uncachedInputTokens + totals.cacheWriteTokens)} tok</strong></div><div className="smhm_formulaItem"><span className="smhm_formulaName">模型输出</span><strong className="smhm_formulaValue">{formatTokens(totals.outputTokens)} tok</strong></div></div></div>
    <div className="smhm_module"><div className="smhm_moduleHead"><h3 className="smhm_moduleTitle">价格表</h3><span className="smhm_moduleMeta">每百万 Token · 人民币 · 2026-10-17 核验</span></div><div className="smhm_settingsGrid"><PriceGroup title="DeepSeek Flash（含 V4.1）" prefix="flash" settings={settings} scope={scope}/><PriceGroup title="DeepSeek V4 Pro" prefix="pro" settings={settings} scope={scope}/><PriceGroup title="其他模型（回退）" prefix="fallback" settings={settings} scope={scope}/></div><div className="smhm_settingsFoot"><span>{snapshot.writable ? '离开输入框后自动保存到 Harness 设置。' : '当前连接只读，价格设置不会持久化。'}</span><button type="button" className="smhm_reset" disabled={!snapshot.writable} onClick={() => { applyPreset(OFF_PEAK_COST_SETTINGS) }}>使用闲时价</button><button type="button" className="smhm_reset" disabled={!snapshot.writable} onClick={() => { applyPreset(DEFAULT_COST_SETTINGS) }}>使用高峰价</button><button type="button" className="smhm_reset" disabled={!snapshot.writable} onClick={reset}>恢复默认高峰价（含回退）</button></div></div>
    <p className="smhm_warning">北京时间周一至周五（中国法定节假日除外）09:00–12:00、14:00–18:00 为高峰，其余为闲时。插件不自动分时计费：所选价格会重算全部历史用量，混合时段请以平台账单为准。已有自定义价格会保留，请按需选择预设。Search/Fetch 按次费用未计入（官方将于北京时间 2026-11-01 起对 Harness 等服务端调用收费）。这是根据 provider 返回 Token 与当前价格表计算的估算值，不等同于 DeepSeek 开放平台账单；价格调整、赠送余额、折扣和非 DeepSeek 路由可能造成差异。缓存写入 Token（若 provider 报告）按未命中输入计价。</p>
  </section>
}
