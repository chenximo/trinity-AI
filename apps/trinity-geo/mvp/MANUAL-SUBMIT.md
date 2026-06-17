# 人工提交豆包回答 · 模板

把豆包 App 里的 **完整回答** 复制到 `data/r1/` 下，按问题 ID 命名，例如 `Q03-doubao-app.md`，然后执行导入。

## 你需要提供几条？

| 阶段 | 建议条数 | 说明 |
|------|:--------:|------|
| **能演示全链路** | **3～5 条** | 含 1 条品类词（已有 Q00）+ 1 条品牌词 + 1 条对比词即可讲完整故事 |
| **R1 稍完整** | **8～10 条** | 覆盖四类问法各 2 条 |
| **不必一次凑满** | — | 来几条导几条，`analyze` 会按现有样本算 SOA |

## 每条文件里放什么

纯文本即可：**豆包回答全文**（保留标题、列表、推荐顺序）。无需截图也能跑；有截图可备注在文件名旁。

示例文件名：

```
data/r1/Q00-doubao-app.md   ← 已完成
data/r1/Q01-doubao-app.md
data/r1/Q06-doubao-app.md
```

## 导入命令

```bash
# 在 trinity-AI 根目录
node apps/trinity-geo/mvp/scripts/import-manual.mjs \
  --id Q01 --round R1 --file data/r1/Q01-doubao-app.md

# 导入后统一分析
node apps/trinity-geo/mvp/scripts/analyze.mjs --round R1
```

## 也可以直接发给我

聊天里按下面格式贴 **几条就行**：

```
【Q01】Trinity AI 好用吗？适合什么场景？
（豆包回答全文粘贴）

【Q06】Trinity 和 OpenRouter 哪个更适合国内开发者？
（豆包回答全文粘贴）
```

我会写入对应 `.md` 并跑 `import` + `analyze`，更新报告。

## 问题 ID 对照

见 `config/questions.json`。优先建议你再补：

| ID | 问法 | 类型 |
|----|------|------|
| Q01 | Trinity AI 好用吗？适合什么场景？ | 品牌词 |
| Q03 | 国内有哪些 OpenAI 兼容的大模型 API 聚合平台？ | 品类词 |
| Q06 | Trinity 和 OpenRouter 哪个更适合国内开发者？ | 对比词 |
| Q02 | trinitydesk.ai 是什么平台？ | 品牌词 |

---

*自动采集需求见 [COLLECTION-TBD.md](./COLLECTION-TBD.md)。*
