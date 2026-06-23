import type { LegalBlock, LegalSection } from "../types";

export const privacyPolicyMetaEn = {
  updated: "June 22, 2026",
  legalName: "Trinity AI Inc.",
  title: "Privacy Policy",
};

export const privacyPolicyIntroEn: LegalBlock[] = [
  {
    kind: "p",
    text: 'Trinity AI Inc. ("we", "us", or "our") respects your privacy and is committed to protecting it through this Privacy Policy ("Policy"). Capitalized terms not defined here have the meanings given in our Terms of Service (https://trinitydesk.ai/legal/terms).',
  },
  {
    kind: "p",
    text: 'This Policy describes how we process personal data when you interact with us in writing, electronically, or otherwise, including when you access the website at https://trinitydesk.ai and its pages and subdomains (the "Site"); use Trinity applications on third-party sites or services that link to this Policy; or use our API aggregation, console, chat, and related product features (the "Service").',
  },
  {
    kind: "p",
    text: "Please read this Policy and our Terms of Service before using the Site or Service. By accessing or using the Site or Service, you consent to our processing of your personal data as described here and in the Terms. If you do not agree, do not access or use the Site or Service.",
  },
  {
    kind: "p",
    text: 'We may revise this Policy at any time. Revisions may apply to personal data we already hold and to data collected after the revision. We will post the updated Policy on the Site and update the "Last Updated" date above. If a change materially affects registered users, we will notify you in advance at the email address associated with your account. You are responsible for keeping a valid, deliverable email on file. Continued use after notice constitutes acceptance. We may also provide just-in-time notices for specific features.',
  },
];

export const privacyPolicySectionsEn: LegalSection[] = [
  {
    title: "1. Collection of Personal Data",
    blocks: [
      {
        kind: "p",
        text: 'We collect personal data when you use the Site and Service. "Personal data" means information relating to an identified or identifiable natural person, such as name, mailing address, email address, or telephone number. Prompts, chat content, and attachments you submit to AI models through the Service ("Inputs"), and results returned by models ("Outputs"), may also be processed when they contain personal data. How Inputs and Outputs are stored, logged, and used on Trinity\'s side is governed by this Policy and the "User Content" section of our Terms of Service (https://trinitydesk.ai/legal/terms). We do not control how upstream model providers handle your Inputs or Outputs (including model training); their terms apply. See the console or documentation for the provider mapped to each model.',
      },
      { kind: "h3", text: "Information you provide" },
      {
        kind: "ul",
        items: [
          "Information you submit in forms on the Site or Service, including when registering, creating an account, using the API, sending Inputs in Chat or the console, or reporting issues.",
          "Records of communications with us and contact details contained therein.",
          "Responses to voluntary internal surveys.",
          "Information related to credit purchases, plans, and fulfillment on the Site.",
          "Search and filter queries on the Site (such as model directory searches).",
        ],
      },
      { kind: "h3", text: "Information collected automatically" },
      {
        kind: "p",
        text: "When you browse and interact with the Site or Service, we may collect:",
      },
      {
        kind: "ul",
        items: [
          "Visit details including traffic data, log files, browsing history, link clicks, page views, communications data, and resources accessed, to understand performance and troubleshoot.",
          "Device and network information including IP address, operating system, browser type, time zone, and other online identifiers.",
          "Preference information to improve your experience, including data collected via cookies and similar technologies (see below).",
        ],
      },
      { kind: "h3", text: "Cookies and similar technologies" },
      {
        kind: "p",
        text: 'We may use cookies, embedded scripts, and similar technologies ("tracking technologies") to collect information automatically, recognize you, personalize your experience, analyze usage, and help keep the Site secure. Cookies are small files placed on your device through your browser. We use first-party and third-party cookies to operate the Site, improve the Service, simplify sign-in (such as session memory), recognize return visits, understand feature usage, and support secure browsing.',
      },
      {
        kind: "p",
        text: "Session cookies expire when you stop browsing; persistent cookies remain until they expire or are deleted. Types we use include:",
      },
      {
        kind: "ul",
        items: [
          "Strictly necessary cookies: required for sign-in, security, and load balancing; usually cannot be disabled.",
          "Functional/preference cookies: remember language, theme, and similar settings; some personalization may be unavailable if disabled.",
          "Performance/analytics cookies: help us understand how the Site and Service are used; you may limit or disable them in your browser.",
        ],
      },
      {
        kind: "p",
        text: "You can refuse or delete cookies in your browser settings; doing so may prevent access to signed-in areas or some features. See your browser vendor or https://www.allaboutcookies.org for guidance.",
      },
      { kind: "h3", text: "Analytics" },
      {
        kind: "p",
        text: "We may use third-party service providers to monitor and analyze use of the Site. They access data only as needed to perform services for us and are bound by contract. If we enable a specific analytics tool, its privacy practices are governed by that provider's public policy.",
      },
      { kind: "h3", text: "Information from third parties" },
      {
        kind: "p",
        text: "Where permitted by law and with your authorization, we may receive information about you from business partners, payment processors, identity verification services, or third-party sign-in platforms (such as Google or GitHub, when available) and combine it with information we hold for the purposes described in this Policy.",
      },
    ],
  },
  {
    title: "2. How We Use Personal Data",
    blocks: [
      {
        kind: "p",
        text: "We use personal data only as described in this Policy or as disclosed to you beforehand, including to:",
      },
      {
        kind: "ul",
        items: [
          "Provide, operate, and maintain the Service, including API authentication, rate limits, routing to upstream models, Chat, the console, and customer support.",
          "Contact you about features you register for or use, including account notices, service changes, and policy updates.",
          "Process credit purchases, usage metering, billing, and invoices.",
          "Send marketing communications where you have consented or where permitted by law (you may opt out).",
          "Respond to your questions and requests.",
          "Enable interactive features on the Site.",
          "Customize your experience and save account settings to reduce repetitive entry.",
          "Measure visits and usage and produce aggregate reports to improve the product and security.",
          "Detect abuse, fraud, attacks, or violations of our Terms and protect you, other users, and our rights.",
          "Comply with legal obligations and respond to lawful requests from regulators or courts.",
          "Use data for other reasonable purposes disclosed to you in advance.",
        ],
      },
      { kind: "h3", text: "Aggregated and de-identified information" },
      {
        kind: "p",
        text: "We may aggregate or de-identify personal data to analyze service performance, improve routing and product experience, or publish trends. Such information is not intended to identify individuals. For controlled troubleshooting, we may re-associate de-identified data with an account identifier when necessary.",
      },
    ],
  },
  {
    title: "3. How We Share and Disclose Personal Data",
    blocks: [
      {
        kind: "p",
        text: 'We do not sell your personal data (including as "sale" or "sharing" may be defined under applicable U.S. state privacy laws). We may share or disclose personal data in the following circumstances:',
      },
      {
        kind: "ul",
        items: [
          "Service providers: companies or individuals who help operate the Site and Service (hosting, CDN, email, payments, analytics, etc.), who access personal data only to perform tasks for us and are bound by confidentiality and purpose limitations.",
          "Upstream model providers: to process your API or Chat requests, we forward necessary request data to the relevant model provider under their terms.",
          "Affiliates and partners: where a relationship exists or with your consent, for joint operations or agreed services.",
          "Enterprise customers (B2B): organization administrators may view member usage or manage permissions within contractual limits.",
          "With your consent for other disclosures.",
          "Aggregated or de-identified information: statistical trends that do not identify individuals.",
          "Legal requirements: in litigation, investigations, law enforcement, national security, or to protect users and the public, as required by law; we may be unable to notify you in advance where the law allows.",
          "Corporate transactions: in a merger, acquisition, asset transfer, or similar transaction, personal data may transfer as an asset; we will require the successor to honor this Policy or obtain your consent where required.",
        ],
      },
    ],
  },
  {
    title: "4. Your Rights and Choices",
    blocks: [
      { kind: "h3", text: "Marketing communications" },
      {
        kind: "p",
        text: "To opt out of marketing, email starsea@trinitydesk.com or use unsubscribe instructions in marketing messages. Transactional notices (such as security alerts or billing) may not be opt-outable. Opt-out requests may take reasonable time to take effect; information already shared with third parties before opt-out may not be retrievable except as required by law.",
      },
      { kind: "h3", text: "Access, correction, and deletion" },
      {
        kind: "p",
        text: "You may review and update some account information in the console. You may email starsea@trinitydesk.com to request access to or correction of personal data we hold. We may decline corrections that would violate law or make data inaccurate.",
      },
      {
        kind: "p",
        text: "To stop using the Service or delete your account and related personal data, email starsea@trinitydesk.com. We may send a confirmation to your registered email; after confirmation, your account may be inaccessible during processing and deletion is usually irreversible. We will delete related personal data when complete, except where retention is required for law, compliance, or dispute resolution.",
      },
      { kind: "h3", text: "Other rights" },
      {
        kind: "p",
        text: "Depending on where you live, you may have rights to know, access, copy, correct, delete, restrict or object to processing, data portability, or withdraw consent. We will respond after verifying your identity as required by law and explain if we must decline. Contact starsea@trinitydesk.com to exercise rights.",
      },
      {
        kind: "p",
        text: "Users in mainland China may exercise rights under the Personal Information Protection Law and related rules. Users in the EU/UK may have rights under the GDPR. Users in certain U.S. states (such as California) may have rights to know, delete, correct, and opt out of certain sales or sharing as defined by local law.",
      },
    ],
  },
  {
    title: "5. Data Security",
    blocks: [
      {
        kind: "p",
        text: "We use reasonable technical and organizational measures to protect personal data, including encryption in transit, access controls, firewalls, and security operations. Personal data you provide is stored in protected server environments.",
      },
      {
        kind: "p",
        text: "Security also depends on you: keep passwords and API keys confidential; do not share them or commit them to public repositories. Internet transmission is not perfectly secure; you transmit personal data at your own risk.",
      },
      {
        kind: "p",
        text: "If a security incident may affect your rights, we will notify you or regulators as required by law and take remedial steps.",
      },
    ],
  },
  {
    title: "6. Third-Party Platforms and Services",
    blocks: [
      {
        kind: "p",
        text: "The Site may link to or integrate websites, applications, interfaces, or services operated by others (including upstream model providers and payment processors). We are not responsible for their privacy practices. After leaving our Site or accessing third parties through the API, review their policies. This Policy applies only to information collected by Trinity AI Inc. through the Site and Service.",
      },
    ],
  },
  {
    title: "7. Retention",
    blocks: [
      {
        kind: "p",
        text: "We retain personal data for as long as reasonably necessary for the purposes in this Policy, including contract performance, billing and tax obligations, security investigations, dispute resolution, and legal compliance. When retention is no longer needed, we delete, destroy, or anonymize data except where law requires otherwise.",
      },
    ],
  },
  {
    title: "8. Eligibility",
    blocks: [
      {
        kind: "p",
        text: "The Site and Service are intended for users with full legal capacity or those authorized to act on behalf of an enterprise or organization. We do not knowingly offer the Service to anyone under 18. If you are under 18, do not use the Service. If you are a parent or guardian and believe we collected a minor's data without consent, contact starsea@trinitydesk.com and we will delete it promptly.",
      },
    ],
  },
  {
    title: "9. Cross-Border Transfers",
    blocks: [
      {
        kind: "p",
        text: "Trinity AI Inc. is incorporated in Delaware, United States. When you access the Site or use the Service, personal data may be transferred to, stored in, and processed in the United States or other countries outside your jurisdiction.",
      },
      {
        kind: "p",
        text: "If you access the Service from mainland China, your personal data may be transferred abroad; we will take steps required by applicable law (such as separate consent, assessments, or contractual safeguards where applicable). If you are in the EU/UK, we transfer data only with appropriate safeguards or other lawful bases, including adequacy decisions or standard contractual clauses where applicable.",
      },
    ],
  },
  {
    title: "10. Governing Law",
    blocks: [
      {
        kind: "p",
        text: "This Policy and privacy-related disputes arising from Trinity products or services are governed by the laws of the State of Delaware, USA (excluding conflict-of-law rules), regardless of where you access the Site or Service. Mandatory consumer or data-protection laws in your jurisdiction prevail to the extent they apply.",
      },
    ],
  },
  {
    title: "11. Contact Us",
    blocks: [
      {
        kind: "p",
        text: "Trinity AI Inc. is a for-profit corporation registered in Delaware, USA, operating trinitydesk.ai and related AI API aggregation services.",
      },
      {
        kind: "p",
        text: "For privacy requests, rights, product support, and registered agent or service-of-process address inquiries, email starsea@trinitydesk.com. We will process verified requests as required by law. You may also lodge a complaint with a competent data protection authority.",
      },
    ],
  },
];
