import z from "@deepseek-ai/schemastery";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import { z as z$1 } from "zod";
//#region src/projection.ts
const zeroBuckets = () => ({
	uncachedInputTokens: 0,
	outputTokens: 0,
	cacheReadTokens: 0,
	cacheWriteTokens: 0
});
const bucketSchema = {
	uncachedInputTokens: z$1.number().int().nonnegative(),
	outputTokens: z$1.number().int().nonnegative(),
	cacheReadTokens: z$1.number().int().nonnegative(),
	cacheWriteTokens: z$1.number().int().nonnegative()
};
const modelSchema = z$1.object({
	provider: z$1.string(),
	model: z$1.string(),
	...bucketSchema
}).strict();
const daySchema = z$1.object({
	date: z$1.string(),
	firstAt: z$1.number().nonnegative(),
	lastAt: z$1.number().nonnegative(),
	models: z$1.array(modelSchema),
	...bucketSchema
}).strict();
const projectionSchema = z$1.object({
	...bucketSchema,
	firstAt: z$1.number().nonnegative().optional(),
	lastAt: z$1.number().nonnegative().optional(),
	models: z$1.array(modelSchema),
	days: z$1.array(daySchema)
}).strict();
const bucketsFrom = (usage) => ({
	uncachedInputTokens: usage.inputTokens,
	outputTokens: usage.outputTokens,
	cacheReadTokens: usage.cacheReadTokens ?? 0,
	cacheWriteTokens: usage.cacheWriteTokens ?? 0
});
const equalBuckets = (a, b) => a.uncachedInputTokens === b.uncachedInputTokens && a.outputTokens === b.outputTokens && a.cacheReadTokens === b.cacheReadTokens && a.cacheWriteTokens === b.cacheWriteTokens;
const addBuckets = (a, b, sign = 1) => ({
	uncachedInputTokens: a.uncachedInputTokens + sign * b.uncachedInputTokens,
	outputTokens: a.outputTokens + sign * b.outputTokens,
	cacheReadTokens: a.cacheReadTokens + sign * b.cacheReadTokens,
	cacheWriteTokens: a.cacheWriteTokens + sign * b.cacheWriteTokens
});
function updateModels(rows, sample, sign) {
	const index = rows.findIndex((row) => row.provider === sample.provider && row.model === sample.model);
	if (index < 0) {
		if (sign < 0) return [...rows];
		return [...rows, {
			...sample,
			...sample.buckets
		}];
	}
	const current = rows[index];
	if (current === void 0) return [...rows];
	const nextBuckets = addBuckets(current, sample.buckets, sign);
	const next = [...rows];
	next[index] = {
		provider: current.provider,
		model: current.model,
		...nextBuckets
	};
	return next;
}
function updateDays(rows, sample, sign) {
	const index = rows.findIndex((row) => row.date === sample.date);
	if (index < 0) {
		if (sign < 0) return [...rows];
		return [...rows, {
			date: sample.date,
			firstAt: sample.time,
			lastAt: sample.time,
			models: [{
				provider: sample.provider,
				model: sample.model,
				...sample.buckets
			}],
			...sample.buckets
		}].sort((a, b) => a.date.localeCompare(b.date));
	}
	const current = rows[index];
	if (current === void 0) return [...rows];
	const next = [...rows];
	next[index] = {
		date: current.date,
		firstAt: sign > 0 ? Math.min(current.firstAt, sample.time) : current.firstAt,
		lastAt: sign > 0 ? Math.max(current.lastAt, sample.time) : current.lastAt,
		models: updateModels(current.models, sample, sign),
		...addBuckets(current, sample.buckets, sign)
	};
	return next;
}
function usageOf(event) {
	if (event.type === "assistant/chunk" && event.data.chunk.type === "usage") return {
		turn: event.data.turn,
		step: event.data.step,
		usage: event.data.chunk.usage
	};
	if (event.type === "assistant/message" && event.data.usage !== void 0) return {
		turn: event.data.turn,
		step: event.data.step,
		usage: event.data.usage
	};
}
const isoDate = (time) => new Date(time).toISOString().slice(0, 10);
/** Replay-aware, model-aware token projection used by both plugin surfaces. */
const costUsageProjectionDefinition = {
	key: "costUsage",
	schema: projectionSchema,
	init: () => ({
		totals: zeroBuckets(),
		models: [],
		days: [],
		route: {
			provider: "unknown",
			model: "unknown"
		},
		last: null
	}),
	apply: (state, event) => {
		if (event.type === "request/context") {
			const route = {
				provider: event.data.provider,
				model: event.data.model
			};
			return route.provider === state.route.provider && route.model === state.route.model ? state : {
				...state,
				route
			};
		}
		const report = usageOf(event);
		if (report === void 0) return state;
		const buckets = bucketsFrom(report.usage);
		const previous = state.last !== null && state.last.turn === report.turn && state.last.step === report.step ? state.last : void 0;
		if (previous !== void 0 && equalBuckets(previous.buckets, buckets)) return state;
		const sample = {
			turn: report.turn,
			step: report.step,
			time: event.time,
			date: isoDate(event.time),
			provider: state.route.provider,
			model: state.route.model,
			buckets
		};
		let totals = state.totals;
		let models = state.models;
		let days = state.days;
		if (previous !== void 0) {
			totals = addBuckets(totals, previous.buckets, -1);
			models = updateModels(models, previous, -1);
			days = updateDays(days, previous, -1);
		}
		totals = addBuckets(totals, sample.buckets);
		models = updateModels(models, sample, 1);
		days = updateDays(days, sample, 1);
		return {
			...state,
			totals,
			models,
			days,
			last: sample,
			firstAt: state.firstAt === void 0 ? event.time : Math.min(state.firstAt, event.time),
			lastAt: Math.max(state.lastAt ?? event.time, event.time)
		};
	},
	view: (state) => ({
		...state.totals,
		...state.firstAt === void 0 ? {} : { firstAt: state.firstAt },
		...state.lastAt === void 0 ? {} : { lastAt: state.lastAt },
		models: state.models,
		days: state.days
	}),
	stateVersion: 1
};
//#endregion
//#region src/pricing.ts
/** Official DeepSeek CNY prices published for V4 on 2026-08-15. */
const DEFAULT_COST_SETTINGS = Object.freeze({
	flashCacheHit: .02,
	flashCacheMiss: 1,
	flashOutput: 2,
	proCacheHit: .025,
	proCacheMiss: 3,
	proOutput: 6,
	fallbackCacheHit: .02,
	fallbackCacheMiss: 1,
	fallbackOutput: 2
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
	if (normalized.includes("v4-flash") || normalized === "deepseek-chat" || normalized === "deepseek-reasoner") return {
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
//#region src/index.ts
const name = "dsh-show-me-how-much";
const COST_SETTINGS_NAMESPACE = "show-me-how-much";
const CostSettingsSchema = z.object({
	flashCacheHit: z.number(),
	flashCacheMiss: z.number(),
	flashOutput: z.number(),
	proCacheHit: z.number(),
	proCacheMiss: z.number(),
	proOutput: z.number(),
	fallbackCacheHit: z.number(),
	fallbackCacheMiss: z.number(),
	fallbackOutput: z.number()
});
/** Register the host-backed price table and replayable token projection. */
function apply(ctx) {
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.register(settingsNamespace(COST_SETTINGS_NAMESPACE), CostSettingsSchema, { base: DEFAULT_COST_SETTINGS });
	});
	ctx.inject(["sessionProjections"], (projectionCtx) => {
		projectionCtx.sessionProjections.register(costUsageProjectionDefinition);
	});
}
//#endregion
export { COST_SETTINGS_NAMESPACE, DEFAULT_COST_SETTINGS, apply, costForBuckets, costForModels, costUsageProjectionDefinition, name, ratesForModel };

//# sourceMappingURL=index.js.map