---
title: 日常操作（refresh / gate / 巡检）
---

# 日常操作（refresh / gate / 巡检）

> **关联**：[总览](./) · [价目全流程](./workflow) · [模型原价折扣](./supplier-cost-discounts)

## 策略约定

- **对外真源**：`pricing/output/trinity-pricing-*.xlsx` 为商务/运营对外唯一真源；供应商分表须与控制台抓取全量一致（含同族多线路，如 TokenHub `deepseek-v4-pro` 与 `deepseek-v4-pro-202606`）。
- **供应商分表列**：`线上刊例` 来自 `GET /v1/prices`；**已接入**有刊例价，**未接入**为 `—`；`刊例vs供应商` 为同档毛利对照。
- **刊例对齐**：官方涨/跌时 **不自动改刊例**；系统 **先告警**，人工决策后跟价 / 战略价 / 登记例外。
- **巡检频率**：建议 **每周至少一次**（手动执行，无定时任务）。
- **钉钉**：`PRICING_ALERT_WEBHOOK_URL` 配置在仓库根 `.env`；若机器人要求关键词，填写 `PRICING_ALERT_DINGTALK_KEYWORD`。

---

## 每周巡检（推荐 · 一条命令）

在 **`trinity-AI` 仓库根目录**执行：

```bash
cd trinity-AI
npm run pricing:inspect
```

等价于依次执行：

1. `pricing:refresh` — 抓官方 + 渠道 + 重建 upstream + Excel  
2. `pricing:gen-official:image` / `gen-official:video` — 生图/生视频官方草案  
3. `pricing:validate:compare` — 刊例 L4 vs 官方 → `listing-compare.json`  
4. `pricing:gate --skip-fetch --no-fail-fast` — L1↔L2↔L3 校验（不重复抓官方）  
5. `pricing:alert --heartbeat` — 合并告警推钉钉（无待决策时发心跳）

### TokenHub 未登录 / 只想用缓存官方价

```bash
npm run pricing:inspect -- --skip-official-fetch
```

跳过官方抓取，用本地已有 `vendor-pricing.json` 重算下游；**生图/生视频 L4** 仍尝试对比（需已有草案 JSON）。

---

## 分步执行（与 inspect 相同逻辑）

适合排查某一步失败时单独重跑：

```bash
cd trinity-AI

# 1. 全量刷新
npm run pricing:refresh
# 或跳过官方抓取：
# npm run pricing:refresh -- --skip-official-fetch

# 2. 生图/生视频官方草案（inspect 会自动跑；分步时需手动）
npm run pricing:gen-official:image
npm run pricing:gen-official:video

# 3. 刊例 vs 官方（生文 + 生图 + 生视频）
npm run pricing:validate:compare

# 4. 进货链门禁（不重复抓官方）
npm run pricing:gate -- --skip-fetch --no-fail-fast

# 5. 推钉钉
npm run pricing:alert -- --heartbeat
```

---

## 钉钉测试

确认 webhook 能收到消息（不依赖真实告警）：

```bash
cd trinity-AI
npm run pricing:alert -- --test-ping
```

仅本地看告警 Markdown、不推钉钉：

```bash
npm run pricing:alert -- --dry-run
```

---

## 告警输出位置

| 文件 | 内容 |
|------|------|
| `pricing/output/validate/listing-compare.json` | 刊例 L4 校验（生文/图/视频） |
| `pricing/output/validate/pricing-alerts.json` | 合并告警（含 L1–L4） |
| `pricing/output/validate/pricing-alerts.md` | 同上 · Markdown |
| `pricing/output/trinity-pricing-text.xlsx` | 刊例对比主表 · 生文 |

钉钉 **仅推送 `blocking` 告警**；巡检完成且无待决策时，`--heartbeat` 会推一条「0 条待决策」。

---

## 收到告警后怎么办

1. 打开 Excel 或 `pricing-alerts.md` 看模型与档位  
2. **人工决策**（三选一）  
   - **跟价** → 走 [刊例发布](./listing-deploy) / [生视频 rollout](./video-rollout)  
   - **战略价 / 暂不跟** → 登记 `pricing/config/pricing-annotations.mjs`  
   - **官方锚有误** → 修 seed/scrape 后重跑 `pricing:refresh`  
3. 处理完后重跑 `npm run pricing:validate:compare` 与 `npm run pricing:alert` 确认清零  

---

## 其他常用命令

| 命令 | 何时跑 |
|------|--------|
| `npm run pricing:refresh` | 改价、加模型、加渠道后 |
| `npm run pricing:gate` | 发刊例前全量门禁（含重新抓官方） |
| `npm run pricing:gate -- --skip-fetch` | 刚跑过 refresh，只校验不重复抓取 |
| `npm run pricing:diff:official-image` | 单独看生图草案 vs 线上 diff |
| `npm run pricing:diff:official-video` | 单独看生视频草案 vs 线上 diff |
| `npm run pricing:clean` | 清理 backup / 重复刊例 |

---

## 环境变量（`.env`）

```bash
# 价目告警钉钉机器人（必填才可推钉钉）
PRICING_ALERT_WEBHOOK_URL=https://oapi.dingtalk.com/robot/send?access_token=...

# 若机器人开启「自定义关键词」，填此处（消息正文会自动带上）
PRICING_ALERT_DINGTALK_KEYWORD=价目
```

---

## Skill 工作流

| 场景 | 文档 |
|------|------|
| 加原厂模型 | Skill `add-official-model.md` |
| 新增模型 / 供应商 | [add-model-sop](./add-model-sop) · [add-supplier-sop](./add-supplier-sop) |
| 生视频刊例发布 | [video-rollout](./video-rollout) |
| 按模态对照 | [modality-index](./modality-index) |

对 AI 说「跑价目每周巡检」「跑 pricing inspect」时，总机应封发 **`trinity-official-pricing`**。
