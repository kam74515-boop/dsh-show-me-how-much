# Show Me How Much

DeepSeek Harness Web 费用与 Token 统计插件。

- 会话底栏最右侧实时显示估算费用和总 Token。
- 「设置 → 费用统计」提供日期、时间、缓存命中率、按日趋势和模型明细。
- 自动区分 DeepSeek V4 Flash、V4 Pro，并支持自定义回退价格。
- 使用 Harness 持久化 Projection；重新打开历史会话仍可重放统计。
- 流式 usage 与最终 message 采用替换语义，不会重复累计。

## 安装

直接从 GitHub 安装：

```sh
dsh plugin --profile web add github:kam74515-boop/dsh-show-me-how-much#v0.1.0
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

默认价格来自 [DeepSeek V4 人民币官方价格表](https://api-docs.deepseek.com/zh-cn/quick_start/pricing)（2026-08-15），可以在设置页调整：

| 模型 | 缓存命中输入 | 未命中输入 | 输出 |
| --- | ---: | ---: | ---: |
| DeepSeek V4 Flash | ¥0.02/M | ¥1/M | ¥2/M |
| DeepSeek V4 Pro | ¥0.025/M | ¥3/M | ¥6/M |

Harness 的 `uncachedInputTokens`、`cacheReadTokens`、`cacheWriteTokens` 和 `outputTokens` 是互斥桶。缓存写入 Token（如果 provider 报告）按未命中输入计价，reasoning Token 已包含在输出中。

## 说明

金额是基于 provider 返回用量与当前价格表的估算值，不等同于 DeepSeek 开放平台账单。赠送余额、折扣、价格调整和第三方 provider 可能造成差异。

项目针对 DeepSeek Harness `0.1.0-rc.6` 开发，Harness 仍处于 Developer Preview，后续版本可能需要同步插件 API。

## 许可证

[MIT](LICENSE)
