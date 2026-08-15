export const CSS_ID = 'dsh-show-me-how-much/client.css'

export const css = `
.smhm_dock{position:absolute;right:max(calc((100% - var(--dsh-chat-content-width))/2 + var(--dsh-composer-side-clearance) + 16px),calc(var(--dsh-composer-side-clearance) + 16px));bottom:8px;z-index:2;box-sizing:border-box;height:20px;display:inline-flex;align-items:center;gap:5px;padding-left:14px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-state-business-primary);font-size:12px;line-height:20px;font-variant-numeric:tabular-nums;white-space:nowrap}
.smhm_dockIcon{width:13px;height:13px;display:block;flex:none}
.smhm_dockMoney{font-weight:600}
.smhm_dockTokens{color:var(--dsw-alias-label-tertiary)}
.smhm_section{max-width:760px;color:var(--dsw-alias-label-primary);display:flex;flex-direction:column;gap:18px}
.smhm_head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.smhm_title{margin:0;font-size:18px;line-height:26px;font-weight:600}
.smhm_intro{max-width:620px;margin:4px 0 0;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.smhm_pill{display:inline-flex;align-items:center;gap:5px;flex:none;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;padding:4px 9px;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px}
.smhm_icon{width:15px;height:15px;display:block;flex:none}
.smhm_range{display:flex;align-items:center;gap:6px}
.smhm_rangeButton,.smhm_reset{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:999px;padding:5px 11px;font:inherit;font-size:12px;line-height:18px;cursor:pointer}
.smhm_rangeButton:hover,.smhm_reset:hover{background:var(--dsw-alias-interactive-bg-hover)}
.smhm_rangeButton[data-active=true]{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-state-business-primary)}
.smhm_cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.smhm_card{min-width:0;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:12px 13px;background:var(--dsw-alias-bg-layer-3)}
.smhm_cardLabel{display:flex;align-items:center;gap:5px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}
.smhm_cardValue{display:block;margin-top:6px;overflow:hidden;color:var(--dsw-alias-label-primary);font-size:18px;line-height:24px;font-weight:600;font-variant-numeric:tabular-nums;text-overflow:ellipsis;white-space:nowrap}
.smhm_cardHint{display:block;margin-top:2px;color:var(--dsw-alias-label-caption);font-size:10px;line-height:16px}
.smhm_module{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:14px 16px;background:var(--dsw-alias-bg-layer-3)}
.smhm_moduleHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}
.smhm_moduleTitle{display:flex;align-items:center;gap:7px;margin:0;font-size:14px;line-height:22px;font-weight:600}
.smhm_moduleMeta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}
.smhm_chart{height:146px;display:flex;align-items:stretch;justify-content:flex-end;gap:7px;padding-top:4px}
.smhm_barCol{min-width:18px;max-width:42px;flex:1;display:flex;flex-direction:column;align-items:center;gap:6px}
.smhm_barTrack{width:100%;flex:1;display:flex;align-items:flex-end;border-radius:6px;background:var(--dsw-alias-bg-module-platform);overflow:hidden}
.smhm_bar{width:100%;min-height:2px;border-radius:6px 6px 0 0;background:var(--dsw-alias-state-business-primary)}
.smhm_barLabel{max-width:100%;overflow:hidden;color:var(--dsw-alias-label-caption);font-size:10px;line-height:14px;text-overflow:ellipsis;white-space:nowrap}
.smhm_empty{height:100px;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);font-size:13px}
.smhm_table{width:100%;border-collapse:collapse;font-size:12px;line-height:18px}
.smhm_table th{text-align:right;padding:0 8px 8px;color:var(--dsw-alias-label-caption);font-weight:500;white-space:nowrap}
.smhm_table th:first-child,.smhm_table td:first-child{text-align:left;padding-left:0}
.smhm_table th:last-child,.smhm_table td:last-child{padding-right:0}
.smhm_table td{text-align:right;padding:8px;border-top:1px solid var(--dsw-alias-border-l2);font-variant-numeric:tabular-nums;white-space:nowrap}
.smhm_model{display:block;color:var(--dsw-alias-label-primary);font-weight:500}
.smhm_provider{display:block;color:var(--dsw-alias-label-caption);font-size:10px}
.smhm_price{color:var(--dsw-alias-state-business-primary);font-weight:600}
.smhm_formula{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.smhm_formulaItem{border-radius:10px;padding:10px 12px;background:var(--dsw-alias-bg-module-platform)}
.smhm_formulaName{display:block;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:17px}
.smhm_formulaValue{display:block;margin-top:3px;font-size:13px;line-height:20px;font-weight:600;font-variant-numeric:tabular-nums}
.smhm_settingsGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.smhm_priceGroup{display:flex;flex-direction:column;gap:8px}
.smhm_priceTitle{margin:0;font-size:13px;line-height:20px;font-weight:600}
.smhm_field{display:flex;flex-direction:column;gap:4px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}
.smhm_inputWrap{display:flex;align-items:center;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-specific-input-major);overflow:hidden}
.smhm_input{box-sizing:border-box;width:100%;min-width:0;height:32px;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);padding:0 8px;font:inherit;font-size:12px;font-variant-numeric:tabular-nums}
.smhm_unit{flex:none;padding-right:8px;color:var(--dsw-alias-label-caption);font-size:10px}
.smhm_settingsFoot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;color:var(--dsw-alias-label-caption);font-size:11px;line-height:17px}
.smhm_warning{margin:0;border-left:2px solid var(--dsw-alias-state-warn-label);padding-left:10px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px}
@media(max-width:760px){.smhm_cards{grid-template-columns:repeat(2,minmax(0,1fr))}.smhm_settingsGrid{grid-template-columns:1fr}.smhm_formula{grid-template-columns:1fr}.smhm_table th:nth-child(3),.smhm_table td:nth-child(3),.smhm_table th:nth-child(4),.smhm_table td:nth-child(4){display:none}}
`

export function ensureCss(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(CSS_ID)}]`) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-show-me-how-much'
  tag.dataset.pluginCss = CSS_ID
  tag.textContent = css
  document.head.appendChild(tag)
}
