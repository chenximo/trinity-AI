export type CosUploadConfig = {
  secretId: string;
  secretKey: string;
  bucket: string;
  region: string;
  prefix: string;
  publicBase: string | null;
};

export function getCosUploadConfig(): CosUploadConfig | null {
  const secretId = process.env.TRINITY_DOCS_COS_SECRET_ID?.trim();
  const secretKey = process.env.TRINITY_DOCS_COS_SECRET_KEY?.trim();
  const bucket = process.env.TRINITY_DOCS_COS_BUCKET?.trim();
  const region = process.env.TRINITY_DOCS_COS_REGION?.trim();
  if (!secretId || !secretKey || !bucket || !region) return null;

  const prefixRaw = process.env.TRINITY_DOCS_COS_PREFIX?.trim() || "trinity-docs/images/";
  const prefix = prefixRaw.endsWith("/") ? prefixRaw : `${prefixRaw}/`;
  const publicBase = process.env.TRINITY_DOCS_COS_PUBLIC_BASE?.trim() || null;

  return { secretId, secretKey, bucket, region, prefix, publicBase };
}

export function isCosUploadConfigured(): boolean {
  return getCosUploadConfig() !== null;
}
