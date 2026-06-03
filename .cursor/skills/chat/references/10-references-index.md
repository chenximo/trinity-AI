# 10 - References 自我导航索引

> dispatcher 不确定要读哪个 reference 时，先 `read_file` 本文件作为目录。

## 10.1 索引表

| 文件 | 何时读 | 主要内容 |
|---|---|---|
| `01-detect-project.md` | Step 1 探测开始 | 集成信号（`tuikit-atomicx-vue3`）/ platform / 风格 / state.json 探测细则 |
| `02-path-a-script.md` | 判断为路径 A | A.1 → A.5 完整脚本（项目概况反馈 / 凭据 / 基础功能 / 跑通 / 引导菜单） |
| `02-path-a-scaffold-template.md` | A.3.0.0 空目录建项目时 | 脚手架命令 / 依赖安装 / alias 配置代码块（由 A.3.0.0 按需读取） |
| `03-path-b-script.md` | 判断为路径 B | B.1 → B.5 完整脚本（项目概况反馈 / 听需求 / 命中 / 写代码 / 自检）|
| `04-path-c-script.md` | 判断为路径 C | C.1 → C.4 完整脚本（维护模式：减法/追问/排查/样式调整，不加载 slice）|
| `04-uikit-redirect.md` | 用户主动问 UIKit 边界 | 占位 + 统一回答模板 |
| `05-slice-loading.md` | 命中 slice / 多候选 / 兜底 | 命中流程 + 排序 + 未命中处理 |
| `06-hard-rules.md` | 写代码 / 自检前 | SDK API / UI 底线 / 增量安全的全量规则 + 反例 |
| `07-ide-paths.md` | install / 路径疑问 | 4 IDE 路径表 / 安装命令 / 报错对照 |
| `08-state-config.md` | 读写 state / config | 两份 JSON 的字段说明 + 入库策略 |
| `09-troubleshoot.md` | 用户报错 / 卡住 | 错误码 / 症状对照 / 求助话术模板 |
| `10-references-index.md` | 不确定读哪个 | 本文件 |
| `11-what-to-do-next-template.md` | A.4 / B.5 收尾写集成指引 | WHAT-TO-DO-NEXT.md 模板 + 占位符 + 拼装规则 |
| `12-page-composition.md` | A.3 各轮写完后组合父组件 | Full Chat / Direct Chat 胶水层约束（状态中转 / 接线 / `:key` 规则）|

## 10.2 决策树（dispatcher 自我导航）

```
当前在做什么？
├─ 刚开始一段会话 → read 01
├─ 探测结束，要分流 → read 02 或 03 或 04（按 Step 2 分流条件）
├─ 路径 A / A.3.0.0 空目录建项目 → read 02-path-a-scaffold-template
├─ 用户主动问 UIKit / 闭源 UIKit → read 05（uikit-redirect）
├─ 要在 slice 库里找匹配 → read 06（slice-loading）
├─ 准备写代码 / 自检 → read 07（hard-rules）
├─ 用户问 install / IDE 命令 → read 08（ide-paths）
├─ 要写 / 读 state.json / config.json → read 09（state-config）
├─ 用户报错 / 卡住 → read 10（troubleshoot）
├─ A.4 / B.5 收尾要写集成指引 → read 12（what-to-do-next-template）
├─ A.3 写完要组合父组件胶水层 → read 13（page-composition）
└─ 我也不知道 → 现在你已经在这里了
```

## 10.3 缓存策略建议

LLM 在一次会话中多次需要的：

- `06-hard-rules.md` —— 几乎每次写代码都要查，**首次加载后保留在上下文**
- `08-state-config.md` —— 写 state 时反复查 schema，**首次加载后保留**

只在特定分支用一次的：

- `02-path-a-script.md` / `03-path-b-script.md` —— 用完就放，下次会话再加载
- `04-uikit-redirect.md` —— 用户主动问 UIKit 边界才加载，否则不读
