/** 报表中心 · 假数据（对齐详细设计 §4.10） */

export const REPORT_PANEL_ORDER = ["preset", "olap", "export", "subscribe"] as const;
export type ReportPanelId = (typeof REPORT_PANEL_ORDER)[number];

export const REPORT_PRESET_ROWS = [
  { id: "rpt-usage", name: "用量与消耗", period: "近 7 日", owner: "财务组", updatedAt: "2026-05-18 09:00" },
  { id: "rpt-rev", name: "收入试算", period: "本月", owner: "运营组", updatedAt: "2026-05-17 16:20" },
];

export const REPORT_EXPORT_ROWS = [
  { id: "exp-001", name: "用量明细导出", applicant: "zhang.san", status: "已完成", createdAt: "2026-05-18 08:10" },
  { id: "exp-002", name: "客户 Acme 包", applicant: "li.si", status: "处理中", createdAt: "2026-05-17 14:00" },
];
