# Show Me How Much

DeepSeek Harness Web 费用与 Token 统计插件。

- 会话底栏最右侧实时显示估算费用和总 Token。
- 「设置 → 费用统计」提供日期、时间、缓存命中率、按日趋势和模型明细。
- 自动区分 DeepSeek Flash（含 V4.1 和旧 V4 Flash 别名）、V4 Pro，并支持自定义回退价格。
- 使用 Harness 持久化 Projection；重新打开历史会话仍可重放统计。
- 流式 usage 与最终 message 采用替换语义，不会重复累计。

## 安装

直接从 GitHub 安装：

```sh
dsh plugin --profile web add github:kam74515-boop/dsh-show-me-how-much#v0.1.1
```

然后重启 Harness Web：

```sh
dsh web
```

本地开发安装：

```sh
git clone https://github.com/kam74515-boop/dsh-show-me-how-much.git
cd dsh-show-me-how-much
npm install
npm run check
dsh plugin --profile web add .
```

## 费用计算

费用公式：

```text
(缓存命中输入 × 命中价 + (未命中输入 + 缓存写入) × 未命中价 + 输出 × 输出价) / 1,000,000
```

价格来自 [DeepSeek 人民币官方价格表](https://api-docs.deepseek.com/zh-cn/quick_start/pricing/)（2026-10-17 核验），单位为人民币 / 百万 Token：

| 模型 | 时段 | 缓存命中输入 | 未命中输入 | 输出 |
| --- | --- | ---: | ---: | ---: |
| DeepSeek Flash | 闲时 | ¥0.02 | ¥1 | ¥4 |
| DeepSeek Flash | 高峰 | ¥0.04 | ¥2 | ¥8 |
| DeepSeek V4 Pro | 闲时 | ¥0.15 | ¥4.5 | ¥13.5 |
| DeepSeek V4 Pro | 高峰 | ¥0.30 | ¥9 | ¥27 |

### 定价使用策略

- 北京时间周一至周五（不含中国法定节假日）09:00–12:00、14:00–18:00 为高峰，其余时间为闲时。
- 新安装默认采用高峰价。设置页可一键应用高峰价或闲时价，也可手动调整。预设只修改 Flash / Pro；其他模型回退价单独维护，初始采用 Flash 高峰价，不代表第三方模型官方报价。
- 插件按当前所选价格重算全部统计与历史会话，**不自动按调用时刻拆分峰谷，也不还原历史价格**。跨时段统计只能作为估算，不应作为结算依据。
- 升级保留已有价格覆盖；已有用户请在设置页选择新预设，或恢复默认高峰价（同时重置回退价）。
- `deepseek-flash`、`deepseek-v4.1-flash` 版本名、`deepseek-v4-flash` 和 `deepseek-v4-flash-vision-exp` 均使用 Flash 价格。保留 `deepseek-chat` / `deepseek-reasoner` 的历史 Flash 映射；未识别模型使用回退价。
- 只统计模型 Token 费用，不统计 Search/Fetch 按次费用。官方 Search、Fetch 均为 ¥5 / 1,000 次成功请求；Harness 等服务端调用将于北京时间 2026-11-01 00:00 起计费。

Harness 的 `uncachedInputTokens`、`cacheReadTokens`、`cacheWriteTokens` 和 `outputTokens` 是互斥桶。缓存写入 Token（如果 provider 报告）按未命中输入计价，reasoning Token 已包含在输出中。

## 说明

金额是基于 provider 返回用量与当前价格表的估算值，不等同于 DeepSeek 开放平台账单。赠送余额、折扣、价格调整和第三方 provider 可能造成差异。

项目针对 DeepSeek Harness `0.1.0-rc.6` 开发，Harness 仍处于 Developer Preview，后续版本可能需要同步插件 API。

## 许可证

[MIT](LICENSE)
