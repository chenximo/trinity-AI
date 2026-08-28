# 商务价格 · 本地生成 + Cursor 人审上传（主路径）

> **状态**：已拍 · 2026-08-13  
> **替代**：商务价格「Admin 一键 Job 出真表」作为近期主路径（该能力后置为 P3）  
> **四件事总览 + 派活**：[`定价运营-四件事与AI派活.md`](./定价运营-四件事与AI派活.md)  
> **关联**：需求清单 §5 S-01～S-05 · `pricing/scripts/`

---

## 0. 一句话

**真表在本地脚本生成；人在 Cursor 确认后由 Agent 调 API 上传；Admin 商务页是仓库（看/下），不是真表计算器。**

```text
现网线路 export（Admin JWT）
  → 本地 rebuild L3b + build L3a
  → 人审 Excel（HITL）
  → 人说「可以上传了」
  → Cursor Agent PUT …/commercial/artifacts
  → 后台可下载 / 归档（不写 /v1/prices）
```

---

## 1. 产物对照（勿混）

| 文件 | 角色 | 上传 kind | 建议 modality |
|------|------|-----------|----------------|
| `pricing/output/商务洽谈折扣总表.xlsx` | L3b 对内总册 | `l3b-draft` | `all` |
| `pricing/output/Trinity模型报价表（内部）.xlsx` | L3a 对内完整版 | `l3a-draft` | `internal` |
| `pricing/output/Trinity模型报价表.xlsx` | L3a 外发·仅折扣 | `l3a-draft` | `external` |

**上传 ≠ 写线上刊例。** 写 `/v1/prices` 仍走价审确认闸。

---

## 2. 本地生成（命令）

```bash
cd trinity-AI
# 鉴权：TRINITY_ADMIN_TOKEN 或 TRINITY_ADMIN_USER + TRINITY_ADMIN_PASSWORD
export TRINITY_ADMIN_API_BASE=https://trinityadm.trinitydesk.ai/api

python3 pricing/scripts/rebuild_workbook_from_live_api.py   # 默认强制重拉线路 → L3b
python3 pricing/scripts/build_outward_quote_standard.py     # L3a 内部 + 外发仅折扣
```

脚本说明：

- `fetch_live_supply_routes.py`：HTTP 优先 curl（避开 urllib IncompleteRead）  
- `rebuild_workbook_from_live_api.py`：默认重拉；`--skip-fetch` 才用缓存  

---

## 3. HITL（人机）

| 步骤 | 谁 | 做什么 |
|------|----|--------|
| 出表 | 人 / Agent | 跑上节命令 |
| **人审** | **人** | 打开 xlsx 核对折扣与覆盖 |
| **下令** | **人** | 在 Cursor 说「可以上传到后台了」 |
| 上传 | Agent | 登录 Admin → `PUT …/commercial/artifacts` |
| 抽查 | 人 | 后台下载或 Agent 回报 artifact id |

**相对最早设计**：HITL 工位从「Admin 页点导入」换到「Cursor 口头确认」；闸门仍是人，不是取消人审。

---

## 3.1 `Trinity模型报价表_hehe.xlsx` 维护约定

当本次工作包含 **上架新模型** 时，除标准外发表 `Trinity模型报价表.xlsx` 外，还要同步维护：

- `pricing/output/Trinity模型报价表_hehe.xlsx`

规则如下：

1. 先拉最新价格并确认 `Trinity模型报价表.xlsx` 无误。
2. 再对比 `Trinity模型报价表_hehe.xlsx` 与最新版标准报价表。
3. `hehe` **原有模型保持不变**，不要批量覆盖历史折扣。
4. 只把 **缺失的新模型** 补进 `hehe`。
5. 每次新补充的模型行都要 **加颜色标记**，便于人工复核。
6. 在对话汇总里同步列出 **本次新增模型清单**。

当前默认标记方式：

- 新增模型整行使用 **浅黄色**（约 `#FFF2CC`）。

---

## 4. Admin 页角色（近期）

| 做 | 不做 |
|----|------|
| 展示服务端 latest（L3b 整册 / L3a 对内·外发双槽） | 把「导出线路 snapshot」当真表来源 |
| 下载已上传 xlsx；导入按文件名落 `all` / `internal` / `external` | 一键 Job 跑 Python 出真 L3a/L3b（**后置**） |
| 有真表即可归档 | 静默写 `/v1/prices` |

页上「导出线路 snapshot」仅辅助；文案标明**非真报价**。

---

## 5. 与 S-* 编号关系

| 编号 | 近期 | 说明 |
|------|------|------|
| **S-01** | 本地已用 `model-supply-routes/export` | Admin snapshot JSON 给 Job 用 → 随 S-02 后置 |
| **S-02** | **P3 后置** | 控制台一键出真表不做近期主路径 |
| **S-03** | 矩阵可继续在脚本/页编辑 | 改矩阵后须重跑本地生成 |
| **S-04** | 可选 | 归档已上传 artifacts |
| **S-05** | **P2 必做** | 上传 + 列表 + 下载（手传 / Cursor 上传共用） |
