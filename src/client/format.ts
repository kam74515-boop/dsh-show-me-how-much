import type { CostTokenBuckets } from '../types.js'

export const totalInput = (usage: CostTokenBuckets): number =>
  usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens

export const totalTokens = (usage: CostTokenBuckets): number => totalInput(usage) + usage.outputTokens

export function formatTokens(value: number): string {
  if (value < 1_000) return String(Math.round(value))
  if (value < 1_000_000) return `${strip(value / 1_000)}K`
  if (value < 1_000_000_000) return `${strip(value / 1_000_000)}M`
  return `${strip(value / 1_000_000_000)}B`
}

const strip = (value: number): string => value >= 100
  ? String(Math.round(value))
  : (Math.round(value * 10) / 10).toFixed(value < 10 ? 1 : 0)

export const formatMoney = (value: number, compact = false): string => {
  const digits = compact ? (value < 0.01 ? 4 : value < 1 ? 3 : 2) : (value < 0.01 ? 6 : 4)
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: digits })}`
}

export const formatTime = (value: number): string => new Intl.DateTimeFormat('zh-CN', {
  month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).format(value)

export const formatDate = (date: string): string => {
  const [, month = '', day = ''] = date.split('-')
  return `${month}/${day}`
}
