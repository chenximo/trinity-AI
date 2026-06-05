import { randomUUID } from "node:crypto";
import { getCosUploadConfig, type CosUploadConfig } from "./cosEnv";

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

const MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 10 * 1024 * 1024;

export { getCosUploadConfig, isCosUploadConfigured } from "./cosEnv";
export type { CosUploadConfig } from "./cosEnv";

function extFromMime(mime: string, filename?: string): string {
  const fromMime = MIME_EXT[mime.toLowerCase()];
  if (fromMime) return fromMime;
  const match = filename?.match(/\.([a-z0-9]+)$/i);
  if (match) return match[1].toLowerCase();
  return "png";
}

/** 对象键：trinity-docs/images/{id}.{ext}，无日期子目录 */
function buildObjectKey(prefix: string, mime: string, filename?: string): string {
  const ext = extFromMime(mime, filename);
  return `${prefix}${randomUUID()}.${ext}`;
}

function publicUrlForKey(config: CosUploadConfig, key: string): string {
  if (config.publicBase) {
    const base = config.publicBase.replace(/\/+$/, "");
    return `${base}/${key}`;
  }
  return `https://${config.bucket}.cos.${config.region}.myqcloud.com/${key}`;
}

export async function uploadImageToCos(
  buffer: Buffer,
  mime: string,
  filename?: string,
): Promise<{ url: string; key: string }> {
  const config = getCosUploadConfig();
  if (!config) {
    throw new Error(
      "COS 未配置：在 apps/trinity-docs/.env.local 填写 TRINITY_DOCS_COS_*（见 env.cos.example）",
    );
  }

  const normalizedMime = mime.toLowerCase();
  if (!ALLOWED_MIME.has(normalizedMime)) {
    throw new Error(`不支持的图片类型：${mime}`);
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error(`图片超过 ${MAX_BYTES / 1024 / 1024}MB 上限`);
  }

  let COS: typeof import("cos-nodejs-sdk-v5").default;
  try {
    ({ default: COS } = await import("cos-nodejs-sdk-v5"));
  } catch {
    throw new Error(
      "缺少 cos-nodejs-sdk-v5：在仓库根目录执行 npm install 后重启 npm run dev:trinity-docs",
    );
  }

  const key = buildObjectKey(config.prefix, normalizedMime, filename);
  const cos = new COS({
    SecretId: config.secretId,
    SecretKey: config.secretKey,
  });

  await new Promise<void>((resolve, reject) => {
    cos.putObject(
      {
        Bucket: config.bucket,
        Region: config.region,
        Key: key,
        Body: buffer,
        ContentType: normalizedMime,
      },
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });

  return { url: publicUrlForKey(config, key), key };
}
