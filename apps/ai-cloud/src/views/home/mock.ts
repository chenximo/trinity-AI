/** 官网「申请咨询与折扣」：热线与需求规模选项（与控制台 MOCK_CONTACT_ADVISOR 对齐） */
export const HOME_CONSULT_HOTLINE = "400-888-0626";
export const HOME_CONSULT_HOTLINE_TEL = "4008880626";
export const HOME_CONSULT_EMAIL = "starsea@trinitydesk.com";
export const HOME_CONSULT_HOURS = "工作日 9:00–18:00（GMT+8）";

export const HOME_CONSULT_SCALE_OPTIONS = [
  { value: "startup", label: "初创团队（1–20 人）" },
  { value: "growth", label: "成长期企业（21–100 人）" },
  { value: "enterprise", label: "大型企业（100 人以上）" },
] as const;

export type HomeConsultScale = (typeof HOME_CONSULT_SCALE_OPTIONS)[number]["value"];

export interface HomeConsultLead {
  email: string;
  phone: string;
  scale: HomeConsultScale;
  submittedAt: string;
  source: "aic-home";
}
