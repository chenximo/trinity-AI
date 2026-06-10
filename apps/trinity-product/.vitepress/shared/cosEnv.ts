export type CosUploadConfig = {
  secretId: string;
  secretKey: string;
  bucket: string;
  region: string;
  prefix: string;
  publicBase: string | null;
  source: "product" | "docs";
};

function readCosVars(prefix: "TRINITY_PRODUCT_COS" | "TRINITY_DOCS_COS"): {
  secretId: string;
  secretKey: string;
  bucket: string;
  region: string;
  publicBase: string | null;
} | null {
  const secretId = process.env[`${prefix}_SECRET_ID`]?.trim();
  const secretKey = process.env[`${prefix}_SECRET_KEY`]?.trim();
  const bucket = process.env[`${prefix}_BUCKET`]?.trim();
  const region = process.env[`${prefix}_REGION`]?.trim();
  if (!secretId || !secretKey || !bucket || !region) return null;
  const publicBase = process.env[`${prefix}_PUBLIC_BASE`]?.trim() || null;
  return { secretId, secretKey, bucket, region, publicBase };
}

export function getCosUploadConfig(): CosUploadConfig | null {
  const product = readCosVars("TRINITY_PRODUCT_COS");
  if (product) {
    const prefixRaw =
      process.env.TRINITY_PRODUCT_COS_PREFIX?.trim() || "trinity-product-ling/images/";
    const prefix = prefixRaw.endsWith("/") ? prefixRaw : `${prefixRaw}/`;
    return { ...product, prefix, source: "product" };
  }

  const docs = readCosVars("TRINITY_DOCS_COS");
  if (docs) {
    const prefixRaw =
      process.env.TRINITY_PRODUCT_COS_PREFIX?.trim() || "trinity-product-ling/images/";
    const prefix = prefixRaw.endsWith("/") ? prefixRaw : `${prefixRaw}/`;
    return { ...docs, prefix, source: "docs" };
  }

  return null;
}

export function isCosUploadConfigured(): boolean {
  return getCosUploadConfig() !== null;
}
