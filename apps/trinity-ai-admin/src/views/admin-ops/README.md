# admin-ops · 监控与运维（P1）

## 1. 一句话

实时大盘、错误/延迟、供应商健康、告警规则、维护窗口的 **Tab + 表格 mock**，对齐 **`docs/AI-API聚合平台-后台管理系统-详细设计-v1.md` §4.2**。

## 2. 路由

| path（独立 app） | name |
|------------------|------|
| `/ops` | `tai-admin-ops` |

门户内：**`/trinity-ai-admin/ops`**。

## 3. 五件套

| 文件 | 职责 |
|------|------|
| `OpsPage.vue` | 整页 + `TTabSwitch1Underline` + 各 Tab 分区（HTML 注释） |
| `ops.css` | 本页布局与表格 |
| `opsInteractions.ts` | 当前 Tab 读写 `sessionStorage` |
| `mock.ts` | KPI、表行、维护列表等假数据 |
| `README.md` | 本说明 |

## 4. 接 API 后

替换 `mock.ts`；图表接真实时序接口；Tab 状态可改服务端偏好。
