export type CloudLedgerRow = {
  row_key: string;
  customer: string;
  customer_id: string | null;
  source_file: string;
  period: string;
  cloud: string;
  account: string;
  currency: string;
  consume: number | null;
  fee_ratio: string | null;
  fee_amount: number | null;
  settle_total: number | null;
  remark: string | null;
  fee_paid_excel: string | null;
  fee_paid: string | null;
  fee_paid_source: "excel" | "override" | "empty";
  invoice_status: "unbilled" | "invoicing" | "invoiced" | string;
  invoice_status_label: string;
  invoice_ids: number[];
  invoice_linked_amount: number | null;
  /** done | open | none */
  consume_invoice_status?: "done" | "open" | "none" | string;
  fee_invoice_status?: "done" | "open" | "none" | string;
};

export type CloudLedgerScanOut = {
  settlement_dir: string;
  files: string[];
  rows: CloudLedgerRow[];
  row_count: number;
};

export type HealthOut = {
  ok: boolean;
  service: string;
  repo_root: string;
  settlement_dir: string;
  recon_dir: string;
};

export type ReconIndexOut = {
  recon_dir: string;
  items: { kind: string; name: string; path: string; children: string[] }[];
  meta: { exists?: boolean };
};

export type ReconReportSummary = {
  upstream_usd?: number | null;
  platform_usd?: number | null;
  diff_usd?: number | null;
  diff_pct_of_platform?: number | null;
  top_models?: { model?: string; diff_usd?: number | null; share_pct?: number | null }[];
};

export type ReconReportListItem = {
  id: string;
  supplier: string;
  period: string;
  path: string;
  headline: string;
  has_overview: boolean;
  has_daily: boolean;
  has_md: boolean;
  overview_file?: string | null;
  daily_file?: string | null;
  md_file?: string | null;
  summary: ReconReportSummary;
  status: string;
  status_label: string;
};

export type ReconReportListOut = {
  recon_dir: string;
  upstream_dir: string;
  reports: ReconReportListItem[];
  meta: { count?: number; exists?: boolean };
};

export type ReconModelRow = {
  model: string;
  upstream_names: string;
  side: string;
  upstream_usd: number | null;
  platform_usd: number | null;
  diff_usd: number | null;
  share_pct: number | null;
  align_dates: string;
  small_gap_dates: string;
  big_gap_dates: string;
  calendar: string;
  conclusion: string;
};

export type ReconDailyPoint = {
  date: string;
  upstream_usd: number;
  platform_usd: number;
  diff_usd: number;
};

export type ReconUpstreamUsagePoint = {
  date: string;
  calls: number;
  input_tokens: number;
  output_tokens: number;
  cache_tokens: number;
  tokens_total: number;
  tokens_m: number;
  cny: number;
  eff_cny_per_m: number | null;
};

export type ReconDailySeries = {
  dates: string[];
  totals: ReconDailyPoint[];
  models: string[];
  by_model: Record<string, ReconDailyPoint[]>;
  upstream_usage: Record<string, ReconUpstreamUsagePoint[]>;
  platform_has_tokens: boolean;
  usage_note: string;
};

export type ReconReportDetailOut = {
  id: string;
  supplier: string;
  period: string;
  path: string;
  status: string;
  status_label: string;
  summary: ReconReportSummary;
  models: ReconModelRow[];
  md_text: string;
  files: string[];
  overview_file?: string | null;
  daily_file?: string | null;
  md_file?: string | null;
  daily_series: ReconDailySeries;
  calendar_legend: string;
  note: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    try {
      const j = JSON.parse(text) as { detail?: string };
      throw new Error(j.detail || text || `${res.status} ${res.statusText}`);
    } catch (e) {
      if (e instanceof Error && e.message !== text) throw e;
      throw new Error(text || `${res.status} ${res.statusText}`);
    }
  }
  return res.json() as Promise<T>;
}

export type Customer = { id: string; name: string; purpose_name: string };
export type Payee = {
  cloud: string;
  label: string;
  full_name: string;
  account: string;
  bank: string;
  ready: boolean;
};
export type PaymentPreview = {
  payer_name: string;
  department: string;
  applicant: string;
  apply_date_label: string;
  payee_name: string;
  payee_account: string;
  payee_bank: string;
  amount: number;
  amount_upper: string;
  purpose: string;
};
export type Payment = {
  id: number;
  customer_id: string;
  customer_name: string;
  cloud: string;
  cloud_label: string;
  amount: number;
  amount_upper: string;
  purpose: string;
  apply_date: string;
  period_year: number;
  period_month: number;
  status: string;
  export_path: string | null;
  month_key: string;
};
export type PaymentIssueOut = {
  payment: Payment;
  download_url: string;
  preview: PaymentPreview;
};

export const api = {
  health: () => request<HealthOut>("/api/health"),
  cloudLedger: () => request<CloudLedgerScanOut>("/api/cloud/ledger"),
  setFeePaid: (row_key: string, fee_paid: string, note?: string) =>
    request<{ row_key: string; fee_paid: string | null }>("/api/cloud/ledger/fee-paid", {
      method: "PUT",
      body: JSON.stringify({ row_key, fee_paid, note }),
    }),
  setLedgerInvoiceStatus: (row_key: string, status: "unbilled" | "invoiced", note?: string) =>
    request<{ row_key: string; status: string; status_label: string }>(
      "/api/cloud/ledger/invoice-status",
      {
        method: "PUT",
        body: JSON.stringify({ row_key, status, note }),
      },
    ),
  reconIndex: () => request<ReconIndexOut>("/api/recon/index"),
  reconReports: () => request<ReconReportListOut>("/api/recon/reports"),
  reconReport: (supplier: string, period: string) =>
    request<ReconReportDetailOut>(
      `/api/recon/reports/${encodeURIComponent(supplier)}/${encodeURIComponent(period)}`,
    ),
  paymentCustomers: () => request<Customer[]>("/api/payments/meta/customers"),
  createCustomer: (body: { name: string; purpose_name?: string; id?: string }) =>
    request<Customer>("/api/payments/meta/customers", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  paymentPayees: () => request<Payee[]>("/api/payments/meta/payees"),
  paymentList: (month?: string) =>
    request<Payment[]>(month ? `/api/payments?month=${encodeURIComponent(month)}` : "/api/payments"),
  issuePayment: (body: {
    customer_id: string;
    cloud: string;
    amount: number;
    apply_date?: string;
    period_year?: number;
    period_month?: number;
    purpose?: string;
  }) =>
    request<PaymentIssueOut>("/api/payments/issue", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deletePayment: (id: number) =>
    request<{ ok: boolean; id: number }>(`/api/payments/${id}`, { method: "DELETE" }),
  deletePaymentsMonth: (month: string) =>
    request<{ ok: boolean; month: string; deleted: number }>(
      `/api/payments?month=${encodeURIComponent(month)}`,
      { method: "DELETE" },
    ),

  invoiceQuota: (month?: string) =>
    request<InvoiceQuota>(
      month ? `/api/invoices/quota?month=${encodeURIComponent(month)}` : "/api/invoices/quota",
    ),
  invoiceProfiles: (customer_id?: string) =>
    request<InvoiceProfile[]>(
      customer_id
        ? `/api/invoices/profiles?customer_id=${encodeURIComponent(customer_id)}`
        : "/api/invoices/profiles",
    ),
  createInvoiceProfile: (body: InvoiceProfileIn) =>
    request<InvoiceProfile>("/api/invoices/profiles", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateInvoiceProfile: (id: number, body: InvoiceProfileIn) =>
    request<InvoiceProfile>(`/api/invoices/profiles/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteInvoiceProfile: (id: number) =>
    request<{ ok: boolean }>(`/api/invoices/profiles/${id}`, { method: "DELETE" }),
  invoiceRecords: (month?: string, status: string = "all") => {
    const q = new URLSearchParams();
    if (month) q.set("month", month);
    if (status) q.set("status", status);
    const qs = q.toString();
    return request<InvoiceRecord[]>(qs ? `/api/invoices/records?${qs}` : "/api/invoices/records");
  },
  invoiceReconcile: () =>
    request<InvoiceReconcileOut>("/api/invoices/reconcile", { method: "POST" }),
  createInvoiceRecord: (body: InvoiceRecordIn) =>
    request<InvoiceRecord>("/api/invoices/records", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  createInvoiceFromSettlement: (body: {
    row_keys: string[];
    amount?: number;
    apply_date?: string;
    remark?: string;
  }) =>
    request<InvoiceRecord>("/api/invoices/from-settlement", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  patchInvoiceRecordStatus: (id: number, status: string) =>
    request<InvoiceRecord>(`/api/invoices/records/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteInvoiceRecord: (id: number) =>
    request<{ ok: boolean }>(`/api/invoices/records/${id}`, { method: "DELETE" }),
  deleteInvoiceRecordsMonth: (month: string) =>
    request<{ ok: boolean; deleted: number }>(
      `/api/invoices/records?month=${encodeURIComponent(month)}`,
      { method: "DELETE" },
    ),

  trinityBillTos: () => request<BillToProfile[]>("/api/receipts/trinity/bill-tos"),
  trinityInvoiceList: (month?: string) =>
    request<TrinityInvoice[]>(
      month ? `/api/receipts/trinity?month=${encodeURIComponent(month)}` : "/api/receipts/trinity",
    ),
  issueTrinityInvoice: (body: {
    bill_to_id: string;
    amount_usd: number;
    period_label: string;
    description?: string;
    campaign?: string;
    invoice_date?: string;
    invoice_no?: string;
  }) =>
    request<TrinityIssueOut>("/api/receipts/trinity/issue", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteTrinityInvoice: (id: number) =>
    request<{ ok: boolean }>(`/api/receipts/trinity/${id}`, { method: "DELETE" }),
  deleteTrinityInvoicesMonth: (month: string) =>
    request<{ ok: boolean; deleted: number }>(
      `/api/receipts/trinity?month=${encodeURIComponent(month)}`,
      { method: "DELETE" },
    ),

  contractTemplates: () => request<ContractTemplate[]>("/api/contracts/templates"),
  contractFeed: (limit = 50) =>
    request<ContractFeedItem[]>(`/api/contracts/feed?limit=${limit}`),
  createContractFeed: (body: { title: string; body?: string; kind?: string }) =>
    request<ContractFeedItem>("/api/contracts/feed", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteContractFeed: (id: number) =>
    request<{ ok: boolean; id: number; title: string }>(`/api/contracts/feed/${id}`, {
      method: "DELETE",
    }),
  contractCompanyFiles: () =>
    request<{ key: string; name: string; size: number; url: string; last_modified: string }[]>(
      "/api/contracts/company-files",
    ),
  /** 上传合同到 COS（公司归档 / 客户 / 样板）；客户可 create_record 自动建草稿 */
  uploadContractCos: async (
    file: File,
    opts?: {
      scope?: "company" | "customer" | "templates";
      customer_id?: string;
      create_record?: boolean;
    },
  ) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("scope", opts?.scope || "company");
    if (opts?.customer_id) fd.append("customer_id", opts.customer_id);
    if (opts?.create_record) fd.append("create_record", "1");
    const res = await fetch("/api/contracts/upload-cos", { method: "POST", body: fd });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.json() as Promise<{
      ok: boolean;
      filename: string;
      size: number;
      cos_key: string;
      cos_url: string;
      local_path: string;
      contract_id?: number;
    }>;
  },
  contractList: (params?: { customer_id?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.customer_id) q.set("customer_id", params.customer_id);
    if (params?.status) q.set("status", params.status);
    const qs = q.toString();
    return request<Contract[]>(qs ? `/api/contracts?${qs}` : "/api/contracts");
  },
  createContract: (body: ContractIn) =>
    request<Contract>("/api/contracts", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateContract: (id: number, body: Partial<ContractIn>) =>
    request<Contract>(`/api/contracts/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  patchContractStatus: (id: number, status: string) =>
    request<Contract>(`/api/contracts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  copyContractTemplate: (id: number) =>
    request<Contract>(`/api/contracts/${id}/copy-template`, { method: "POST" }),
  syncContractCos: (id: number) =>
    request<Contract>(`/api/contracts/${id}/sync-cos`, { method: "POST" }),
  deleteContract: (id: number) =>
    request<{ ok: boolean; id: number }>(`/api/contracts/${id}`, { method: "DELETE" }),

  financeLedger: (month: string) =>
    request<FinanceLedgerOut>(`/api/finance/ledger?month=${encodeURIComponent(month)}`),
  saveFinanceLedger: (body: { month_key: string; lines: FinanceLedgerLineIn[] }) =>
    request<FinanceLedgerOut>("/api/finance/ledger", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  financeLedgerExportUrl: (month: string) =>
    `/api/finance/ledger/export?month=${encodeURIComponent(month)}`,
};

export type FinanceConsumeDetail = {
  name: string;
  amount: number;
};

export type FinanceLedgerLine = {
  book: string;
  party_key: string;
  party_name: string;
  opening: number | null;
  recharge: number | null;
  consume: number | null;
  fee: number | null;
  balance: number | null;
  remark: string;
  consume_source?: string;
  fee_source?: string;
  recharge_source?: string;
  opening_source?: string;
  /** 支出按云：各客户公司消耗拆分 */
  consume_detail?: FinanceConsumeDetail[];
  sort_order?: number;
};

export type FinanceLedgerLineIn = {
  book: string;
  party_key: string;
  party_name: string;
  opening: number | null;
  recharge: number | null;
  consume: number | null;
  fee: number | null;
  remark?: string;
  sort_order?: number;
};

export type FinanceLedgerTotal = {
  opening: number | null;
  recharge: number | null;
  consume: number | null;
  fee: number | null;
  balance: number | null;
};

export type FinanceLedgerOut = {
  month_key: string;
  sources?: Record<string, string>;
  income_cny: FinanceLedgerLine[];
  income_cny_total: FinanceLedgerTotal;
  income_usd: FinanceLedgerLine[];
  income_usd_total: FinanceLedgerTotal;
  expense_cny: FinanceLedgerLine[];
  expense_cny_total: FinanceLedgerTotal;
  expense_usd: FinanceLedgerLine[];
  expense_usd_total: FinanceLedgerTotal;
  footnotes: FinanceLedgerLine[];
};

export type ContractTemplate = {
  key: string;
  name: string;
  filename: string;
  path: string;
  suffix: string;
  size: number;
  note: string;
  kind?: string;
  pending_latest?: boolean;
  download_url: string | null;
};

export type ContractFeedItem = {
  id: number;
  kind: string;
  kind_label: string;
  title: string;
  body: string;
  ref_key: string;
  created_at: string | null;
};

export type ContractIn = {
  customer_id: string;
  title: string;
  contract_no?: string;
  party_a?: string;
  party_b?: string;
  template_key?: string;
  status?: string;
  signed_date?: string;
  effective_start?: string;
  effective_end?: string;
  invoice_title?: string;
  file_path?: string;
  note?: string;
  copy_template?: boolean;
};

export type Contract = {
  id: number;
  customer_id: string;
  customer_name: string;
  title: string;
  contract_no: string;
  party_a: string;
  party_b: string;
  template_key: string;
  status: string;
  status_label: string;
  signed_date: string | null;
  effective_start: string | null;
  effective_end: string | null;
  invoice_title: string;
  file_path: string | null;
  file_exists: boolean;
  cos_key?: string;
  cos_url?: string | null;
  note: string;
  created_at: string | null;
  updated_at: string | null;
  download_url: string | null;
};

export type InvoiceProfileIn = {
  customer_id: string;
  title: string;
  tax_no?: string;
  address_phone?: string;
  bank_account?: string;
  default_invoice_type?: string;
  remark?: string;
  is_default?: boolean;
};

export type InvoiceProfile = InvoiceProfileIn & {
  id: number;
  customer_name: string;
  tax_no: string;
  address_phone: string;
  bank_account: string;
  default_invoice_type: string;
  remark: string;
  is_default: boolean;
};

export type InvoiceRecordIn = {
  customer_id: string;
  profile_id?: number;
  buyer_name?: string;
  tax_no?: string;
  address_phone?: string;
  bank_account?: string;
  invoice_type?: string;
  amount: number;
  amount_ex_tax?: number;
  tax_amount?: number;
  invoice_no?: string;
  payment_received?: string;
  remark?: string;
  apply_date?: string;
  status?: string;
  source_row_keys?: string[];
  skip_quota?: boolean;
};

export type InvoiceRecord = {
  id: number;
  customer_id: string;
  customer_name: string;
  profile_id: number | null;
  buyer_name: string;
  tax_no: string;
  address_phone: string;
  bank_account: string;
  invoice_type: string;
  amount: number;
  amount_ex_tax: number | null;
  tax_amount: number | null;
  invoice_no: string;
  seller_name: string;
  payment_received: string;
  remark: string;
  apply_date: string;
  status: string;
  copy_text: string;
  source_row_keys: string[];
  month_key: string;
  ledger_link?: "linked" | "orphan" | "none";
};

export type InvoiceReconcileOut = {
  ok: boolean;
  by_company: {
    customer: string;
    settle: number;
    linked: number;
    gap: number;
    invoiced_rows: number;
    fee_only_rows: number;
    invoicing_rows: number;
    unbilled_rows: number;
  }[];
  orphan_invoices: {
    id: number;
    customer_id: string;
    buyer_name: string;
    apply_date: string;
    amount: number;
    invoice_no: string;
  }[];
  summary: {
    ledger_cny_rows: number;
    invoice_count: number;
    linked_invoices: number;
    orphan_invoices: number;
    invoiced_ledger_rows: number;
    fee_only_ledger_rows: number;
    unbilled_ledger_rows: number;
  };
};

export type InvoiceQuota = {
  month: string;
  quota: number;
  used_total: number;
  used_invoiced: number;
  used_pending: number;
  remaining: number;
  record_count: number;
};

export type BillToProfile = {
  id: string;
  label: string;
  bill_to: string;
  address: string;
  default_description: string;
  remark: string;
};

export type TrinityInvoice = {
  id: number;
  bill_to_id: string;
  invoice_no: string;
  invoice_date: string;
  bill_to: string;
  address: string;
  description: string;
  campaign: string;
  period_label: string;
  amount_usd: number;
  status: string;
  export_path: string | null;
  download_url: string | null;
  month_key: string;
};

export type TrinityPreview = {
  invoice_no: string;
  invoice_date: string;
  bill_to: string;
  address: string;
  description: string;
  campaign: string;
  period_label: string;
  amount_usd: number;
  beneficiary: string;
};

export type TrinityIssueOut = {
  invoice: TrinityInvoice;
  download_url: string;
  preview: TrinityPreview;
};
