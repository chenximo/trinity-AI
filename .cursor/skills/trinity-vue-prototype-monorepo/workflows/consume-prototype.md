# 消费原型

## READ

- `双仓协作与原型交付.md`
- `如何消费原型.md`

## 步骤

1. 确认原型来源仓与分支
2. 按五件套对照 README / mocks / 路由
3. 集成到目标 `apps/*`；不污染 `packages/ui` 业务逻辑

## 双仓

交付工程师 push 原型 → 消费方 pull 并按模块 README 落地。
