# 更新周进展

## READ

`apps/trinity-product/docs/产品手册更新规范.md`（符号、锁节点、周会顺序 §四 §七）

## 改什么

| 文件 | 何时改 |
|------|--------|
| `roadmap.yml`（叶子） | 有子能力交付、符号变更 |
| `week-progress.yml`（产品总览） | 周会：plan、acceptance、focus |
| 子总览表 | 与 roadmap 子清单对齐 |

**不每周改** 叶子 roadmap 每一行；周会主战场是 `week-progress.yml`。

## 顺序（周会）

见更新规范 §七：

1. 叶子 `roadmap.yml`（有交付）
2. `week-progress.yml`
3. 子总览表对齐

## focus 叶子

`weekProgressFocusLeaves.ts` 注册可点叶子；细则写在 `plan` / `acceptance`。

## 禁止

- 维护 `docs/05-产品与PRD/roadmap/`
- 在 week-progress 里写验收 JSON 或用例细节（链 api-test）
