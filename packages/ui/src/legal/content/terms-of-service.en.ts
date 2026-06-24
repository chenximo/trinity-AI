import type { LegalBlock } from "../types";

export const termsOfServiceMetaEn = {
  updated: "June 22, 2026",
  legalName: "Trinity AI Inc.",
  title: "Terms of Service",
};

export const termsOfServiceBlocksEn: LegalBlock[] = [
  {
    kind: "p",
    text: 'Welcome to the products and services provided by Trinity (https://trinitydesk.ai). Trinity AI Inc. ("we", "us", or "our") and you ("you") enter into the following terms regarding your access to and use of this platform and related API, console, chat, and other features (collectively, the "Service"). By using the Service, you agree to these Terms of Service and our Privacy Policy (https://trinitydesk.ai/legal/privacy).',
  },
  { kind: "h3", text: "1. Accounts and Service" },
  {
    kind: "p",
    text: "You must provide accurate registration information and safeguard your account credentials, password, and API keys. You are responsible for all activity under your account and keys. We may suspend or terminate the Service for maintenance, security, or policy violations.",
  },
  { kind: "h3", text: "2. User Content (Inputs and Outputs)" },
  {
    kind: "p",
    text: 'Prompts, conversations, attachments you submit through the Service, and model-generated results are referred to as "Input Content" and "Output Content" (collectively, "User Content").',
  },
  {
    kind: "ul",
    items: [
      "To provide routing, authentication, rate limiting, billing, troubleshooting, and to perform under these Terms and our Privacy Policy, we may process, cache, or retain User Content and request metadata (such as model identifiers, usage, timestamps, and Request-Id) as necessary.",
      "Except as required for Service operations above, we do not use your Input Content to train Trinity-owned models by default.",
      "Your requests are forwarded to the applicable upstream model providers; rights and restrictions on Output Content are governed by those providers' terms. We are not responsible for how upstream providers store, use, or train on User Content.",
      "If we offer optional features such as conversation history or debug logs, they will be described in product settings or separate notices; when disabled, we do not retain full conversation content through those features.",
      "You must ensure User Content is lawful, non-infringing, and free of prohibited material; you bear full responsibility for User Content.",
    ],
  },
  { kind: "h3", text: "3. Acceptable Use" },
  {
    kind: "p",
    text: "You may not use the Service for unlawful, fraudulent, abusive, or system-attacking activity, to circumvent regional or model restrictions, or to infringe others' rights. We may restrict or disable accounts for violations.",
  },
  { kind: "h3", text: "4. Billing and Quotas" },
  {
    kind: "p",
    text: "The Service is billed according to published pricing and console usage. Purchased credits or plans are subject to their stated terms; non-payment or abuse may limit access.",
  },
  { kind: "h3", text: "5. Intellectual Property and Disclaimers" },
  {
    kind: "p",
    text: 'We or our licensors own intellectual property in the Service and related software and documentation. The Service is provided "as is"; model outputs may be incorrect or incomplete, and you must evaluate and use them at your own risk. To the maximum extent permitted by law, we are not liable for indirect damages or model output content.',
  },
  { kind: "h3", text: "6. Termination and Governing Law" },
  {
    kind: "p",
    text: "You may stop using the Service at any time; we may terminate or modify the Service after notice. These Terms are governed by the laws of the State of Delaware, USA (excluding conflict-of-law rules). Disputes shall be resolved in courts of competent jurisdiction in Delaware, except where mandatory consumer protection rules require otherwise.",
  },
  {
    kind: "p",
    text: "Contact us: starsea@trinitydesk.com (privacy, support, and general inquiries).",
  },
];
