/**
 * AIGC 生图价目表（元/张 · 美元/张）
 * 来源：AIGC价格指南（商务版报价文档）.xlsx · AIGC生图片
 * 由 parse-aigc-image-excel 校验对齐；勿手改价格（改 Excel 后重导）
 */

/** @typedef {Record<string, string>} ResolutionBlock */

/**
 * @typedef {{
 *   vendorCode: string,
 *   vendorName: string,
 *   modelName: string,
 *   trinityId?: string,
 *   tiers: { attribute: string, domestic?: ResolutionBlock | null, international?: ResolutionBlock | null }[]
 * }} SheetModel
 */

export const SHEET_META = {
  source: 'AIGC价格指南（商务版报价文档）.xlsx',
  sheet: 'AIGC生图片',
  dataDate: '2026-06',
  modality: 'image',
};

/** @type {SheetModel[]} */
export const PRICING_SHEET_IMAGE = [
  {
    "vendorCode": "Hunyuan",
    "vendorName": "混元",
    "modelName": "3",
    "tiers": [
      {
        "attribute": "标准价",
        "domestic": {
          "1K": "0.2",
          "2K": "0.28",
          "4K": "0.36"
        },
        "international": null
      }
    ]
  },
  {
    "vendorCode": "SI",
    "vendorName": "Seedream",
    "modelName": "5.0-lite",
    "tiers": [
      {
        "attribute": "标准价",
        "domestic": {
          "1K": "0.22",
          "2K": "0.22",
          "4K": "0.22"
        },
        "international": {
          "1K": "0.0339",
          "2K": "0.0339",
          "4K": "0.0339"
        }
      }
    ]
  },
  {
    "vendorCode": "SI",
    "vendorName": "Seedream",
    "modelName": "4.5",
    "tiers": [
      {
        "attribute": "标准价",
        "domestic": {
          "1K": "0.25",
          "2K": "0.25",
          "4K": "0.25"
        },
        "international": {
          "1K": "0.0385",
          "2K": "0.0385",
          "4K": "0.0385"
        }
      }
    ]
  },
  {
    "vendorCode": "SI",
    "vendorName": "Seedream",
    "modelName": "4.0",
    "tiers": [
      {
        "attribute": "标准价",
        "domestic": {
          "1K": "0.2",
          "2K": "0.2",
          "4K": "0.2"
        },
        "international": {
          "1K": "0.0308",
          "2K": "0.0308",
          "4K": "0.0308"
        }
      }
    ]
  },
  {
    "vendorCode": "MJ",
    "vendorName": "Midjourney",
    "modelName": "v7",
    "tiers": [
      {
        "attribute": "标准价",
        "domestic": {
          "1K": "0.3",
          "2K": "0.38",
          "4K": "0.46"
        },
        "international": {
          "1K": "0.039",
          "2K": "0.051",
          "4K": "0.063"
        }
      }
    ]
  },
  {
    "vendorCode": "JI",
    "vendorName": "即梦",
    "modelName": "4.0",
    "tiers": [
      {
        "attribute": "标准价",
        "domestic": {
          "1K": "0.22",
          "2K": "0.22",
          "4K": "0.22"
        },
        "international": {
          "1K": "0.0339",
          "2K": "0.0339",
          "4K": "0.0339"
        }
      }
    ]
  },
  {
    "vendorCode": "Qwen",
    "vendorName": "通义",
    "modelName": "0925",
    "tiers": [
      {
        "attribute": "标准价",
        "domestic": {
          "1K": "0.3",
          "2K": "0.38",
          "4K": "0.46"
        },
        "international": {
          "1K": "0.0461538461538462",
          "2K": "0.0584615384615385",
          "4K": "0.0707692307692308"
        }
      }
    ]
  },
  {
    "vendorCode": "OO",
    "vendorName": "OpenAI",
    "modelName": "image-2",
    "tiers": [
      {
        "attribute": "输入图片/张",
        "domestic": {
          "1K以下": "0.1"
        },
        "international": {
          "1K以下": "0.0154"
        }
      },
      {
        "attribute": "low",
        "domestic": {
          "1K": "0.045",
          "2K": "0.09",
          "4K": "0.15"
        },
        "international": {
          "1K": "0.006",
          "2K": "0.012",
          "4K": "0.02"
        }
      },
      {
        "attribute": "medium",
        "domestic": {
          "1K": "0.398",
          "2K": "0.803",
          "4K": "1.335"
        },
        "international": {
          "1K": "0.053",
          "2K": "0.107",
          "4K": "0.178"
        }
      },
      {
        "attribute": "high",
        "domestic": {
          "1K": "1.583",
          "2K": "3.21",
          "4K": "5.34"
        },
        "international": {
          "1K": "0.211",
          "2K": "0.428",
          "4K": "0.712"
        }
      },
      {
        "attribute": "low",
        "domestic": {
          "1K": "0.3",
          "2K": "0.338",
          "4K": "0.398"
        },
        "international": {
          "1K": "0.04",
          "2K": "0.045",
          "4K": "0.053"
        }
      },
      {
        "attribute": "medium",
        "domestic": {
          "1K": "0.638",
          "2K": "1.05",
          "4K": "1.583"
        },
        "international": {
          "1K": "0.085",
          "2K": "0.14",
          "4K": "0.211"
        }
      },
      {
        "attribute": "high",
        "domestic": {
          "1K": "1.838",
          "2K": "3.45",
          "4K": "5.588"
        },
        "international": {
          "1K": "0.245",
          "2K": "0.46",
          "4K": "0.745"
        }
      }
    ]
  },
  {
    "vendorCode": "GG",
    "vendorName": "Gemini",
    "modelName": "3.1",
    "tiers": [
      {
        "attribute": "标准价",
        "domestic": {
          "1K以下": "0.333",
          "1K": "0.5",
          "2K": "0.75",
          "4K": "1.12"
        },
        "international": {
          "1K以下": "0.045",
          "1K": "0.067",
          "2K": "0.101",
          "4K": "0.151"
        }
      }
    ]
  },
  {
    "vendorCode": "GG",
    "vendorName": "Gemini",
    "modelName": "3",
    "tiers": [
      {
        "attribute": "标准价",
        "domestic": {
          "1K": "1",
          "2K": "1",
          "4K": "1.8"
        },
        "international": {
          "1K": "0.135",
          "2K": "0.135",
          "4K": "0.24"
        }
      }
    ]
  },
  {
    "vendorCode": "GG",
    "vendorName": "Gemini",
    "modelName": "2.5（超分暂时按1K收）",
    "tiers": [
      {
        "attribute": "是",
        "domestic": {
          "1K": "0.3",
          "2K": "0.38",
          "4K": "0.46"
        },
        "international": {
          "1K": "0.039",
          "2K": "0.051",
          "4K": "0.063"
        }
      }
    ]
  },
  {
    "vendorCode": "Vidu",
    "vendorName": "Vidu",
    "modelName": "q2",
    "tiers": [
      {
        "attribute": "文生图",
        "domestic": {
          "1K": "0.1875",
          "2K": "0.25",
          "4K": "0.3125"
        },
        "international": {
          "1K": "0.0288461538461539",
          "2K": "0.0384615384615385",
          "4K": "0.0480769230769231"
        }
      },
      {
        "attribute": "参考生图1-3张",
        "domestic": {
          "1K": "0.25",
          "2K": "0.375",
          "4K": "0.5"
        },
        "international": {
          "1K": "0.0384615384615385",
          "2K": "0.0576923076923077",
          "4K": "0.0769230769230769"
        }
      },
      {
        "attribute": "参考生图4-7张",
        "domestic": {
          "1K": "0.3125",
          "2K": "0.625",
          "4K": "0.9375"
        },
        "international": {
          "1K": "0.0480769230769231",
          "2K": "0.0961538461538462",
          "4K": "0.144230769230769"
        }
      }
    ]
  },
  {
    "vendorCode": "Kling",
    "vendorName": "可灵",
    "modelName": "3",
    "tiers": [
      {
        "attribute": "标准价",
        "domestic": {
          "1K": "0.2",
          "2K": "0.2",
          "4K": "0.4"
        },
        "international": {
          "1K": "0.028",
          "2K": "0.028",
          "4K": "0.056"
        }
      }
    ]
  },
  {
    "vendorCode": "Kling",
    "vendorName": "可灵",
    "modelName": "3.0-omni",
    "tiers": [
      {
        "attribute": "标准价",
        "domestic": {
          "1K": "0.2",
          "2K": "0.2",
          "4K": "0.4"
        },
        "international": {
          "1K": "0.028",
          "2K": "0.028",
          "4K": "0.056"
        }
      }
    ]
  },
  {
    "vendorCode": "Kling",
    "vendorName": "可灵",
    "modelName": "O1",
    "tiers": [
      {
        "attribute": "标准价",
        "domestic": {
          "1K": "0.2",
          "2K": "0.2",
          "4K": "0.4"
        },
        "international": {
          "1K": "0.028",
          "2K": "0.028",
          "4K": "0.056"
        }
      }
    ]
  },
  {
    "vendorCode": "Kling",
    "vendorName": "可灵",
    "modelName": "2.1",
    "tiers": [
      {
        "attribute": "文生图",
        "domestic": {
          "1K": "0.1",
          "2K": "0.1",
          "4K": "0.26"
        },
        "international": {
          "1K": "0.014",
          "2K": "0.014",
          "4K": "0.037"
        }
      },
      {
        "attribute": "单图生图",
        "domestic": {
          "1K": "0.2",
          "2K": "0.2",
          "4K": "0.4"
        },
        "international": {
          "1K": "0.028",
          "2K": "0.028",
          "4K": "0.056"
        }
      },
      {
        "attribute": "多图参考生图",
        "domestic": {
          "1K": "0.4",
          "2K": "0.48",
          "4K": "0.56"
        },
        "international": {
          "1K": "0.056",
          "2K": "0.068",
          "4K": "0.079"
        }
      }
    ]
  },
  {
    "vendorCode": "Kling",
    "vendorName": "可灵",
    "modelName": "expand（new）",
    "tiers": [
      {
        "attribute": "扩图",
        "domestic": {
          "1K以下": "0.2"
        },
        "international": {
          "1K以下": "0.028"
        }
      }
    ]
  }
];
