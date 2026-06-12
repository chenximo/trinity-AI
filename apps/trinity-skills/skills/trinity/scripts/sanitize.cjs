/**
 * Shared sanitization for trinity skill scripts.
 * Extends newapi patterns with xh- API key redaction.
 */

const SENSITIVE_KEYWORDS = [
  "password", "passwd", "secret", "token", "credential",
  "apikey", "api_key", "api-key", "api_secret",
  "auth", "auth_token", "authorization",
  "private_key", "private-key", "privatekey",
  "access_key", "access-key", "accesskey",
  "client_secret", "client-secret",
];

const SENSITIVE_PATTERN = new RegExp(
  "(" + SENSITIVE_KEYWORDS.join("|") + ")",
  "i"
);

function sanitize(content) {
  let result = content;

  // Trinity xh- API keys
  result = result.replace(/xh-[A-Za-z0-9_\-]{4,}/g, "xh-<REDACTED>");

  // OpenAI-style sk- keys (third-party configs)
  result = result.replace(/sk-[A-Za-z0-9_\-]{4,}/g, "sk-<REDACTED>");

  // Bearer tokens
  result = result.replace(
    /Bearer\s+[A-Za-z0-9_.\-/+=]{4,}/g,
    "Bearer <REDACTED>"
  );

  // Credentials in connection strings
  result = result.replace(
    /[A-Za-z0-9_.\-]+:[A-Za-z0-9_.\-]+@[^\s]+/g,
    "<REDACTED>"
  );

  result = result
    .split("\n")
    .map((line) => {
      const jsonMatch = line.match(/^(\s*"([^"]+)"\s*:\s*)"([^"]*)"(.*)$/);
      if (jsonMatch) {
        const [, prefix, key, , suffix] = jsonMatch;
        if (SENSITIVE_PATTERN.test(key)) {
          return `${prefix}"<REDACTED>"${suffix}`;
        }
        return line;
      }

      const yamlMatch = line.match(/^(\s*([\w.\-]+)\s*:\s*)(.+)$/);
      if (yamlMatch) {
        const [, prefix, key, value] = yamlMatch;
        if (
          SENSITIVE_PATTERN.test(key) &&
          value.trim() !== "" &&
          value.trim() !== "|" &&
          value.trim() !== ">"
        ) {
          return `${prefix}<REDACTED>`;
        }
        return line;
      }

      const envMatch = line.match(/^(\s*([\w.\-]+)\s*=\s*)(.+)$/);
      if (envMatch) {
        const [, prefix, key] = envMatch;
        if (SENSITIVE_PATTERN.test(key)) {
          return `${prefix}<REDACTED>`;
        }
        return line;
      }

      return line;
    })
    .join("\n");

  return result;
}

module.exports = { sanitize, SENSITIVE_KEYWORDS, SENSITIVE_PATTERN };
