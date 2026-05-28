import {
  HOME_CONSULT_EMAIL,
  HOME_CONSULT_SCALE_OPTIONS,
  type HomeConsultLead,
  type HomeConsultScale,
} from "./mock";

const STORAGE_KEY = "trinity-aic-consult-leads";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ConsultLeadDelivery = "email" | "mailto";

export function normalizeConsultPhone(phone: string): string {
  return phone.replace(/[\s\-()（）]/g, "");
}

/** 大陆手机 / 固话 / 400 热线 */
export function isValidConsultPhone(phone: string): boolean {
  const n = normalizeConsultPhone(phone);
  if (/^1\d{10}$/.test(n)) return true;
  if (/^0\d{9,11}$/.test(n)) return true;
  if (/^400\d{7}$/.test(n)) return true;
  return false;
}

function scaleLabel(scale: HomeConsultScale): string {
  return HOME_CONSULT_SCALE_OPTIONS.find((o) => o.value === scale)?.label ?? scale;
}

export function validateConsultForm(input: {
  email: string;
  phone: string;
  scale: string;
}): { ok: true; data: { email: string; phone: string; scale: HomeConsultScale } } | { ok: false; message: string } {
  const email = input.email.trim();
  const phone = input.phone.trim();
  const scale = input.scale.trim() as HomeConsultScale;

  if (!email) return { ok: false, message: "请填写企业邮箱。" };
  if (!EMAIL_RE.test(email)) return { ok: false, message: "邮箱格式不正确，请检查后重试。" };
  if (!phone) return { ok: false, message: "请填写联系电话。" };
  if (!isValidConsultPhone(phone)) {
    return { ok: false, message: "请输入有效的手机号或固话（如 13800138000、021-88886666）。" };
  }
  if (!["startup", "growth", "enterprise"].includes(scale)) {
    return { ok: false, message: "请选择需求规模。" };
  }

  return { ok: true, data: { email, phone, scale } };
}

function readStoredLeads(): HomeConsultLead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as HomeConsultLead[]) : [];
  } catch {
    return [];
  }
}

function buildConsultMailtoUrl(data: Pick<HomeConsultLead, "email" | "phone" | "scale">): string {
  const subject = encodeURIComponent("【Trinity AI 云】咨询与折扣申请");
  const body = encodeURIComponent(
    [
      "以下为官网「申请咨询与折扣」表单提交：",
      "",
      `企业邮箱：${data.email}`,
      `联系电话：${data.phone}`,
      `需求规模：${scaleLabel(data.scale)}`,
      `提交时间：${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`,
      "",
      "请商务同事跟进联系。",
    ].join("\n"),
  );
  return `mailto:${HOME_CONSULT_EMAIL}?subject=${subject}&body=${body}`;
}

/** 通过 FormSubmit 将申请发送至商务邮箱（静态站无后端时的默认方案） */
async function sendConsultLeadViaFormSubmit(
  data: Pick<HomeConsultLead, "email" | "phone" | "scale">,
): Promise<void> {
  const endpoint =
    import.meta.env.VITE_AIC_CONSULT_MAIL_ENDPOINT ??
    `https://formsubmit.co/ajax/${encodeURIComponent(HOME_CONSULT_EMAIL)}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: "【Trinity AI 云】咨询与折扣申请",
      _template: "table",
      _captcha: "false",
      _replyto: data.email,
      企业邮箱: data.email,
      联系电话: data.phone,
      需求规模: scaleLabel(data.scale),
      来源: "Trinity AI 云官网 #consult",
    }),
  });

  if (!res.ok) {
    throw new Error(`consult mail http ${res.status}`);
  }

  const payload = (await res.json().catch(() => null)) as { success?: string } | null;
  if (payload && "success" in payload && !payload.success) {
    throw new Error("consult mail rejected");
  }
}

function openConsultMailtoDraft(data: Pick<HomeConsultLead, "email" | "phone" | "scale">): void {
  window.location.href = buildConsultMailtoUrl(data);
}

async function deliverConsultLead(
  data: Pick<HomeConsultLead, "email" | "phone" | "scale">,
): Promise<ConsultLeadDelivery> {
  try {
    await sendConsultLeadViaFormSubmit(data);
    return "email";
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[ai-cloud] FormSubmit failed, fallback to mailto", err);
    }
    openConsultMailtoDraft(data);
    return "mailto";
  }
}

export async function submitHomeConsultLead(
  data: Pick<HomeConsultLead, "email" | "phone" | "scale">,
): Promise<HomeConsultLead & { delivery: ConsultLeadDelivery }> {
  const delivery = await deliverConsultLead(data);

  const lead: HomeConsultLead = {
    ...data,
    phone: normalizeConsultPhone(data.phone),
    submittedAt: new Date().toISOString(),
    source: "aic-home",
  };

  const leads = readStoredLeads();
  leads.push(lead);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));

  if (import.meta.env.DEV) {
    console.info("[ai-cloud] consult lead", { delivery, lead });
  }

  return { ...lead, delivery };
}
