export interface BrandConfig {
  brand_id: string;
  primary_name: string;
  product_url: string;
  doc_url: string;
  tagline: string;
  aliases: string[];
  competitors: { id: string; names: string[] }[];
}

export interface Question {
  id: string;
  type: string;
  text: string;
  note?: string;
}

export interface Record {
  question_id: string;
  question_type: string;
  question_text: string;
  platform: string;
  collection_channel: string;
  model: string;
  round: string;
  collected_at: string;
  answer_full: string;
  brand_id: string;
  source_note?: string;
}

export interface Annotation extends Record {
  brand_mentioned: "Y" | "N";
  brand_hits: string[];
  mention_position: string;
  in_answer_body: "Y" | "N";
  competitor_mentioned: string;
  competitors_detail: { id: string; names: string[] }[];
  sentiment: string;
}

export interface Diagnosis {
  question_id: string;
  question_text: string;
  question_type: string;
  platform: string;
  collection_channel: string;
  diagnosis_ids: string[];
  priority: string;
  evidence: string;
  brand_mentioned: string;
  in_answer_body: string;
  competitors: string[];
}

export interface Action {
  action_id: string;
  diagnosis_id: string;
  title: string;
  detail: string;
  status: "待办" | "进行中" | "已完成";
  linked_questions: string[];
}

export interface AnalysisResult {
  annotations: Annotation[];
  diagnoses: Diagnosis[];
  actions: Action[];
  soa: number;
  inBodyCount: number;
  total: number;
  byType: Record<string, { total: number; in: number }>;
}

export type DemoStep =
  | "dashboard"
  | "strategy"
  | "collect"
  | "measure"
  | "diagnose"
  | "optimize"
  | "verify";
