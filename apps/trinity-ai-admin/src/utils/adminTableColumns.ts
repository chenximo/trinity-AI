/**
 * 运营后台列表列宽档位（Element Plus `el-table-column` · **min-width**）。
 *
 * 约定（见 `docs/02-后台运营管理系统设计/运营后台-若依式列表规范.md`、`admin-ruoyi.css`）：
 * - 数据列统一 **`min-width`**，由表格按内容与剩余宽度自适应（勿写死 `width`）。
 * - 勿设 `table-layout: fixed`；勿对多列混用固定 `width`。
 * - **对齐**：数据列与操作列均左对齐；`el-table-column` 不写 `align`。
 * - 操作列 `fixed="right"` 可用固定 `width`（`ADMIN_TABLE_COL_OPS`）。
 */
export const ADMIN_TABLE_COL = {
  /** 状态、短枚举、绑定数 */
  xs: 80,
  /** 日期、短数字 */
  sm: 96,
  /** 短文案、策略版本 */
  md: 112,
  /** 时间、指纹 */
  lg: 128,
  /** 双行主从列（客户/项目、用户/Workspace、限额摘要） */
  xl: 144,
  /** 密钥名、主标题 */
  primary: 120,
} as const;

/** 长文本 / 说明列 */
export const ADMIN_TABLE_COL_MIN = {
  detail: 200,
} as const;

/** 操作列固定 width（右侧固定列） */
export const ADMIN_TABLE_COL_OPS = {
  sm: 120,
  md: 180,
  lg: 280,
} as const;
