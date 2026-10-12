export type CloudLedgerRow = {
  row_key: string;
  customer: string;
  customer_id: string | null;
  source_file: string;
  period: string;
  cloud: string;
  account: string;
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
  invoiceRecords: (month?: string) =>
    request<InvoiceRecord[]>(
      month ? `/api/invoices/records?month=${encodeURIComponent(month)}` : "/api/invoices/records",
    ),
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
