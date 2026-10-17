window.__ModuleLoader__.load({
	id: "dsh-show-me-how-much",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/pricing.ts
		/** Official CNY peak prices verified on 2026-10-17; applied to all selected usage. */
		const DEFAULT_COST_SETTINGS = Object.freeze({
			flashCacheHit: .04,
			flashCacheMiss: 2,
			flashOutput: 8,
			proCacheHit: .3,
			proCacheMiss: 9,
			proOutput: 27,
			fallbackCacheHit: .04,
			fallbackCacheMiss: 2,
			fallbackOutput: 8
		});
		/** Off-peak preset. Fallback rates remain user-controlled, not official model prices. */
		const OFF_PEAK_COST_SETTINGS = Object.freeze({
			...DEFAULT_COST_SETTINGS,
			flashCacheHit: .02,
			flashCacheMiss: 1,
			flashOutput: 4,
			proCacheHit: .15,
			proCacheMiss: 4.5,
			proOutput: 13.5
		});
		/** Select a price class from the provider-owned model id. */
		function ratesForModel(model, settings) {
			const normalized = model.toLowerCase();
			if (normalized.includes("v4-pro")) return {
				cacheHit: settings.proCacheHit,
				cacheMiss: settings.proCacheMiss,
				output: settings.proOutput,
				priceClass: "pro"
			};
			if (normalized === "deepseek-flash" || normalized.includes("v4.1-flash") || normalized.includes("v4-flash") || normalized === "deepseek-chat" || normalized === "deepseek-reasoner") return {
				cacheHit: settings.flashCacheHit,
				cacheMiss: settings.flashCacheMiss,
				output: settings.flashOutput,
				priceClass: "flash"
			};
			return {
				cacheHit: settings.fallbackCacheHit,
				cacheMiss: settings.fallbackCacheMiss,
				output: settings.fallbackOutput,
				priceClass: "fallback"
			};
		}
		/** Estimate one bucket group; cache writes use the cache-miss input rate. */
		function costForBuckets(buckets, rates) {
			const inputMiss = buckets.uncachedInputTokens + buckets.cacheWriteTokens;
			return (buckets.cacheReadTokens * rates.cacheHit + inputMiss * rates.cacheMiss + buckets.outputTokens * rates.output) / 1e6;
		}
		/** Estimate a collection whose rows preserve their model identity. */
		function costForModels(models, settings) {
			return models.reduce((total, row) => total + costForBuckets(row, ratesForModel(row.model, settings)), 0);
		}
		//#endregion
		//#region src/client/format.ts
		const totalInput = (usage) => usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
		const totalTokens = (usage) => totalInput(usage) + usage.outputTokens;
		function formatTokens(value) {
			if (value < 1e3) return String(Math.round(value));
			if (value < 1e6) return `${strip(value / 1e3)}K`;
			if (value < 1e9) return `${strip(value / 1e6)}M`;
			return `${strip(value / 1e9)}B`;
		}
		const strip = (value) => value >= 100 ? String(Math.round(value)) : (Math.round(value * 10) / 10).toFixed(value < 10 ? 1 : 0);
		const formatMoney = (value, compact = false) => {
			const digits = compact ? value < .01 ? 4 : value < 1 ? 3 : 2 : value < .01 ? 6 : 4;
			return `¥${value.toLocaleString("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: digits
			})}`;
		};
		const formatTime = (value) => new Intl.DateTimeFormat("zh-CN", {
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false
		}).format(value);
		const formatDate = (date) => {
			const [, month = "", day = ""] = date.split("-");
			return `${month}/${day}`;
		};
		//#endregion
		//#region src/client/icons.tsx
		function CoinIcon({ className = "smhm_icon" }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className,
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "8",
					cy: "8",
					r: "6",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.4"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M5.7 5.3h4.6M8 5.3v5.4M6.2 7.8h3.6",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.25",
					strokeLinecap: "round"
				})]
			});
		}
		function TokenIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className: "smhm_icon",
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M8 1.8l5.4 3.1v6.2L8 14.2l-5.4-3.1V4.9L8 1.8z",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.3"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "8",
					cy: "8",
					r: "2",
					fill: "currentColor"
				})]
			});
		}
		function CacheIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: "smhm_icon",
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M12.4 5.2A5 5 0 103 10.3M12.4 5.2V2.5m0 2.7H9.7",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.35",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function ClockIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className: "smhm_icon",
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "8",
					cy: "8",
					r: "5.8",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.3"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M8 4.6V8l2.4 1.5",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.3",
					strokeLinecap: "round"
				})]
			});
		}
		function ChartIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: "smhm_icon",
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M2.5 13.2h11M4 11V8m4 3V4m4 7V6",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.4",
					strokeLinecap: "round"
				})
			});
		}
		//#endregion
		//#region src/client/settings-hook.ts
		function useCostSettings(scope) {
			const snapshot = (0, react.useSyncExternalStore)((listener) => scope.subscribe(listener), () => scope.getSnapshot(), () => scope.getSnapshot());
			return {
				settings: snapshot.value ?? DEFAULT_COST_SETTINGS,
				snapshot
			};
		}
		//#endregion
		//#region src/client/CostDock.tsx
		const CostDock = (0, react.memo)(function CostDock({ useProjection, scope }) {
			const usage = useProjection("costUsage");
			const { settings } = useCostSettings(scope);
			if (usage === void 0 || totalTokens(usage) === 0) return null;
			const cost = costForModels(usage.models, settings);
			const hitInput = usage.cacheReadTokens;
			const missInput = usage.uncachedInputTokens + usage.cacheWriteTokens;
			const title = [
				`估算费用 ${formatMoney(cost)}`,
				`缓存命中 ${formatTokens(hitInput)} tok`,
				`缓存未命中 ${formatTokens(missInput)} tok`,
				`输出 ${formatTokens(usage.outputTokens)} tok`,
				"点击左下角设置 → 费用统计可查看明细和调整单价"
			].join("\n");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "smhm_dock",
				title,
				"aria-label": title,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CoinIcon, { className: "smhm_dockIcon" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "smhm_dockMoney",
						children: formatMoney(cost, true)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "smhm_dockTokens",
						children: [
							"· ",
							formatTokens(totalTokens(usage)),
							" tok"
						]
					})
				]
			});
		});
		//#endregion
		//#region src/client/CostSettings.tsx
		const zero = () => ({
			uncachedInputTokens: 0,
			outputTokens: 0,
			cacheReadTokens: 0,
			cacheWriteTokens: 0
		});
		const add = (a, b) => ({
			uncachedInputTokens: a.uncachedInputTokens + b.uncachedInputTokens,
			outputTokens: a.outputTokens + b.outputTokens,
			cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
			cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens
		});
		function mergeModels(target, rows) {
			for (const row of rows) {
				const key = `${row.provider}\u0000${row.model}`;
				const current = target.get(key);
				target.set(key, current === void 0 ? { ...row } : {
					provider: row.provider,
					model: row.model,
					...add(current, row)
				});
			}
		}
		function aggregate(projections, range, settings) {
			const cutoff = range === "all" ? -Infinity : Date.now() - (range - 1) * 864e5;
			let buckets = zero();
			let sessionCount = 0;
			let firstAt;
			let lastAt;
			const models = /* @__PURE__ */ new Map();
			const days = /* @__PURE__ */ new Map();
			for (const projection of projections) {
				let included = false;
				for (const day of projection.days) {
					if (day.lastAt < cutoff) continue;
					included = true;
					buckets = add(buckets, day);
					mergeModels(models, day.models);
					firstAt = firstAt === void 0 ? day.firstAt : Math.min(firstAt, day.firstAt);
					lastAt = lastAt === void 0 ? day.lastAt : Math.max(lastAt, day.lastAt);
					const existing = days.get(day.date);
					if (existing === void 0) days.set(day.date, {
						...day,
						models: day.models.map((row) => ({ ...row }))
					});
					else {
						const dayModels = /* @__PURE__ */ new Map();
						mergeModels(dayModels, existing.models);
						mergeModels(dayModels, day.models);
						days.set(day.date, {
							date: day.date,
							firstAt: Math.min(existing.firstAt, day.firstAt),
							lastAt: Math.max(existing.lastAt, day.lastAt),
							models: [...dayModels.values()],
							...add(existing, day)
						});
					}
				}
				if (included) sessionCount += 1;
			}
			return {
				...buckets,
				models: [...models.values()].sort((a, b) => totalTokens(b) - totalTokens(a)),
				days: [...days.values()].sort((a, b) => a.date.localeCompare(b.date)).map((day) => ({
					...day,
					cost: costForModels(day.models, settings)
				})),
				sessionCount,
				...firstAt === void 0 ? {} : { firstAt },
				...lastAt === void 0 ? {} : { lastAt }
			};
		}
		const rangeLabel = (range) => range === "all" ? "全部" : `${range} 天`;
		function StatCard({ icon, label, value, hint }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "smhm_card",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "smhm_cardLabel",
						children: [icon, label]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
						className: "smhm_cardValue",
						title: value,
						children: value
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "smhm_cardHint",
						children: hint
					})
				]
			});
		}
		function PriceField({ label, field, value, scope }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: "smhm_field",
				children: [label, /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "smhm_inputWrap",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: "smhm_input",
						type: "number",
						min: "0",
						step: "0.001",
						defaultValue: value,
						onBlur: (event) => {
							const next = Number(event.currentTarget.value);
							if (Number.isFinite(next) && next >= 0) scope.set(field, next);
							else event.currentTarget.value = String(value);
						}
					}, `${field}-${value}`), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "smhm_unit",
						children: "¥/M"
					})]
				})]
			});
		}
		function PriceGroup({ title, prefix, settings, scope }) {
			const hit = `${prefix}CacheHit`;
			const miss = `${prefix}CacheMiss`;
			const output = `${prefix}Output`;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "smhm_priceGroup",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
						className: "smhm_priceTitle",
						children: title
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceField, {
						label: "缓存命中输入",
						field: hit,
						value: settings[hit],
						scope
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceField, {
						label: "未命中输入",
						field: miss,
						value: settings[miss],
						scope
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceField, {
						label: "输出",
						field: output,
						value: settings[output],
						scope
					})
				]
			});
		}
		function CostSettingsSection({ scope, useSessions }) {
			const { settings, snapshot } = useCostSettings(scope);
			const [range, setRange] = (0, react.useState)(30);
			const projections = useSessions((state) => state.ids.map((id) => state.byId[id]?.projectionValues?.costUsage).filter((value) => value !== void 0));
			const totals = (0, react.useMemo)(() => aggregate(projections, range, settings), [
				projections,
				range,
				settings
			]);
			const amount = costForModels(totals.models, settings);
			const input = totalInput(totals);
			const hitPercent = input === 0 ? 0 : totals.cacheReadTokens / input * 100;
			const visibleDays = totals.days.slice(-14);
			const maxCost = Math.max(...visibleDays.map((day) => day.cost), 0);
			const applyPreset = (preset) => {
				for (const field of [
					"flashCacheHit",
					"flashCacheMiss",
					"flashOutput",
					"proCacheHit",
					"proCacheMiss",
					"proOutput"
				]) scope.set(field, preset[field]);
			};
			const reset = () => {
				for (const field of Object.keys(settings)) scope.unset(field);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "smhm_section",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "smhm_head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
							className: "smhm_title",
							children: "费用与 Token"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "smhm_intro",
							children: "按 Harness 持久化的 provider 用量统计缓存命中、未命中、输出 Token，并依据模型价格估算费用。"
						})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "smhm_pill",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ClockIcon, {}), totals.lastAt === void 0 ? "暂无记录" : `更新于 ${formatTime(totals.lastAt)}`]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "smhm_range",
						"aria-label": "统计范围",
						children: [
							7,
							30,
							"all"
						].map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "smhm_rangeButton",
							"data-active": range === value ? "true" : void 0,
							onClick: () => {
								setRange(value);
							},
							children: rangeLabel(value)
						}, value))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "smhm_cards",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CoinIcon, {}),
								label: "估算费用",
								value: formatMoney(amount),
								hint: "人民币 · 非平台账单"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TokenIcon, {}),
								label: "总 Token",
								value: formatTokens(totalTokens(totals)),
								hint: `输入 ${formatTokens(input)} · 输出 ${formatTokens(totals.outputTokens)}`
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CacheIcon, {}),
								label: "缓存命中率",
								value: `${hitPercent.toFixed(1)}%`,
								hint: `命中 ${formatTokens(totals.cacheReadTokens)} tok`
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ClockIcon, {}),
								label: "会话 / 时间",
								value: `${totals.sessionCount} 个`,
								hint: totals.firstAt === void 0 ? "暂无用量" : `${formatTime(totals.firstAt)} → ${formatTime(totals.lastAt ?? totals.firstAt)}`
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "smhm_module",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "smhm_moduleHead",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h3", {
								className: "smhm_moduleTitle",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChartIcon, {}), "按日费用"]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "smhm_moduleMeta",
								children: [
									"最近 ",
									visibleDays.length,
									" 个有用量日期 · UTC"
								]
							})]
						}), visibleDays.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "smhm_empty",
							children: "发送消息后，这里会出现费用趋势。"
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "smhm_chart",
							children: visibleDays.map((day) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "smhm_barCol",
								title: `${day.date}\n${formatMoney(day.cost)}\n${formatTokens(totalTokens(day))} tok`,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "smhm_barTrack",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "smhm_bar",
										style: { height: `${maxCost === 0 ? 2 : Math.max(3, day.cost / maxCost * 100)}%` }
									})
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "smhm_barLabel",
									children: formatDate(day.date)
								})]
							}, day.date))
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "smhm_module",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "smhm_moduleHead",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h3", {
								className: "smhm_moduleTitle",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TokenIcon, {}), "模型明细"]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "smhm_moduleMeta",
								children: [totals.models.length, " 条路由"]
							})]
						}), totals.models.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "smhm_empty",
							children: "暂无模型用量。"
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
							className: "smhm_table",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "模型" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "缓存命中" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "未命中" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "输出" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "费用" })
							] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: totals.models.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "smhm_model",
									children: row.model
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "smhm_provider",
									children: row.provider
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: formatTokens(row.cacheReadTokens) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: formatTokens(row.uncachedInputTokens + row.cacheWriteTokens) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: formatTokens(row.outputTokens) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
									className: "smhm_price",
									children: formatMoney(costForModels([row], settings), true)
								})
							] }, `${row.provider}/${row.model}`)) })]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "smhm_module",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "smhm_moduleHead",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h3", {
								className: "smhm_moduleTitle",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CoinIcon, {}), "计算拆分"]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "smhm_moduleMeta",
								children: "Token × 单价 / 1,000,000"
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "smhm_formula",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "smhm_formulaItem",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "smhm_formulaName",
										children: "缓存命中输入"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", {
										className: "smhm_formulaValue",
										children: [formatTokens(totals.cacheReadTokens), " tok"]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "smhm_formulaItem",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "smhm_formulaName",
										children: "缓存未命中输入"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", {
										className: "smhm_formulaValue",
										children: [formatTokens(totals.uncachedInputTokens + totals.cacheWriteTokens), " tok"]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "smhm_formulaItem",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "smhm_formulaName",
										children: "模型输出"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", {
										className: "smhm_formulaValue",
										children: [formatTokens(totals.outputTokens), " tok"]
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "smhm_module",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "smhm_moduleHead",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
									className: "smhm_moduleTitle",
									children: "价格表"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "smhm_moduleMeta",
									children: "每百万 Token · 人民币 · 2026-10-17 核验"
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "smhm_settingsGrid",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceGroup, {
										title: "DeepSeek Flash（含 V4.1）",
										prefix: "flash",
										settings,
										scope
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceGroup, {
										title: "DeepSeek V4 Pro",
										prefix: "pro",
										settings,
										scope
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceGroup, {
										title: "其他模型（回退）",
										prefix: "fallback",
										settings,
										scope
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "smhm_settingsFoot",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: snapshot.writable ? "离开输入框后自动保存到 Harness 设置。" : "当前连接只读，价格设置不会持久化。" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "smhm_reset",
										disabled: !snapshot.writable,
										onClick: () => {
											applyPreset(OFF_PEAK_COST_SETTINGS);
										},
										children: "使用闲时价"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "smhm_reset",
										disabled: !snapshot.writable,
										onClick: () => {
											applyPreset(DEFAULT_COST_SETTINGS);
										},
										children: "使用高峰价"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "smhm_reset",
										disabled: !snapshot.writable,
										onClick: reset,
										children: "恢复默认高峰价（含回退）"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "smhm_warning",
						children: "北京时间周一至周五（中国法定节假日除外）09:00–12:00、14:00–18:00 为高峰，其余为闲时。插件不自动分时计费：所选价格会重算全部历史用量，混合时段请以平台账单为准。已有自定义价格会保留，请按需选择预设。Search/Fetch 按次费用未计入（官方将于北京时间 2026-11-01 起对 Harness 等服务端调用收费）。这是根据 provider 返回 Token 与当前价格表计算的估算值，不等同于 DeepSeek 开放平台账单；价格调整、赠送余额、折扣和非 DeepSeek 路由可能造成差异。缓存写入 Token（若 provider 报告）按未命中输入计价。"
					})
				]
			});
		}
		//#endregion
		//#region src/client/styles.ts
		const CSS_ID = "dsh-show-me-how-much/client.css";
		const css = `
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
`;
		function ensureCss() {
			if (typeof document === "undefined") return;
			if (document.querySelector(`style[data-plugin-css=${JSON.stringify("dsh-show-me-how-much/client.css")}]`) !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-show-me-how-much";
			tag.dataset.pluginCss = CSS_ID;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region src/client/index.tsx
		const name = "dsh-show-me-how-much-client";
		const inject = ["slots", "settingsScope"];
		function apply(ctx) {
			ensureCss();
			const scope = ctx.settingsScope.bind({ namespace: "show-me-how-much" });
			const injected = () => ({ scope });
			ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
				name: "conversation.composer.dock",
				id: "show-me-how-much",
				order: 100,
				inject: injected
			}, CostDock));
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "show-me-how-much",
				order: 35,
				label: "费用统计",
				inject: injected
			}, CostSettingsSection));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map