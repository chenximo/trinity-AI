# 更新 API 文档

## 固定顺序

```text
① 结构对标 OpenRouter
② diff 工程师 API对外接口支持参数.md
③ 写入 apps/trinity-docs/docs
④ 注册侧栏 + en 镜像 + build
```

## READ

- `Trinity对外文档站-基本规范.md` §1 §2 §7 §10
- `API对外接口支持参数.md` 对应章节
- 目标页 `apps/trinity-docs/docs/...`

## 页型

| 类型 | 路径示例 |
|------|----------|
| API 短页 | `api/chat-completions.md` |
| 高级参数 | `api/*-parameters.md` |
| 多模态指南 | `multimodal/*.md` |

## 收尾

- `npm run build:trinity-docs`
- 基本规范 §10 扫雷（禁止词）
