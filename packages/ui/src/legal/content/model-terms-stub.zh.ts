import type { LegalBlock } from "../types";

/** 《模型使用条款》占位正文：约定输入/输出与上游模型责任 */
export const modelTermsStubBlocks: LegalBlock[] = [
  {
    kind: "p",
    text: "您通过 Trinity 向第三方人工智能模型服务商发送输入内容并获取输出内容时，除本《隐私政策》外，还须遵守本《模型使用条款》。",
  },
  {
    kind: "tbd",
    title: "文稿待补充",
    lines: [
      "输入/输出的权利归属与许可范围",
      "禁止用途与内容安全",
      "上游模型服务商条款的适用与免责",
      "是否将调用数据用于模型训练（须与隐私政策及后端一致）",
    ],
  },
];
