import type { LegalBlock } from "../types";

/** 《服务条款》占位正文，定稿后替换或迁至独立 content 文件 */
export const termsStubBlocks: LegalBlock[] = [
  {
    kind: "p",
    text: "欢迎使用 Trinity（trinitydesk.ai）提供的产品与服务。本《服务条款》规范您访问与使用本平台的行为。",
  },
  {
    kind: "tbd",
    title: "文稿待补充",
    lines: [
      "账户注册与使用规则",
      "API 调用、额度与计费",
      "acceptable use 与违规处理",
      "知识产权与免责声明",
      "终止服务与争议解决",
    ],
  },
];
