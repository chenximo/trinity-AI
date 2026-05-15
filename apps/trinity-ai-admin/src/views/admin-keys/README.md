# admin-keys（P7 · §4.8）

单入口 **`KeysPage.vue`**，侧栏子菜单：

| 子 path | 说明 |
|---------|------|
| `keys/list` | **API 列表**（默认）：检索、列表、行内详情、冻结/解冻/吊销 |
| `keys/audit` | 审计轨迹 |
| `keys/risk` | 风险标签（可选） |

旧 path `search` / `detail` / `freeze` 会 redirect 到 `list`。

- **`mock.ts`**：默认密钥行、审计种子、风险表。  
- **`keysInteractions.ts`**：`localStorage` 读写与 `document.body` 弹层锁。  
- **无后端**：状态与审计追加写本地；与租户 Account 控制台密钥能力文档分轨。
