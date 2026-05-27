const CAPTCHA_LEN = 4;

export function generateDemoCaptchaCode(length = CAPTCHA_LEN): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += String(Math.floor(Math.random() * 10));
  }
  return out;
}

export type DemoCaptchaColors = {
  bg: string;
  text: string;
  line: string;
};

export function readDemoCaptchaColors(): DemoCaptchaColors {
  if (typeof document === "undefined") {
    return { bg: "#eff6ff", text: "#7c3aed", line: "rgba(148, 163, 184, 0.55)" };
  }
  const style = getComputedStyle(document.documentElement);
  const pick = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    bg: pick("--blue-soft", "#eff6ff"),
    text: pick("--purple", "#7c3aed"),
    line: "rgba(148, 163, 184, 0.55)",
  };
}

/** 在 canvas 上绘制演示用图形验证码（静态原型，非服务端校验） */
export function drawDemoCaptcha(
  canvas: HTMLCanvasElement,
  code: string,
  colors?: DemoCaptchaColors
): void {
  const palette = colors ?? readDemoCaptchaColors();
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.lineTo(Math.random() * w, Math.random() * h);
    ctx.stroke();
  }

  const chars = code.split("");
  const slot = w / (chars.length + 1);
  chars.forEach((ch, i) => {
    ctx.save();
    const x = slot * (i + 0.85);
    const y = h / 2 + (Math.random() * 6 - 3);
    ctx.translate(x, y);
    ctx.rotate(Math.random() * 0.3 - 0.15);
    ctx.font = `700 ${22 + Math.floor(Math.random() * 4)}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillStyle = palette.text;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
}

export function normalizeCaptchaInput(value: string): string {
  return value.replace(/\s/g, "");
}

export function captchaMatches(input: string, code: string): boolean {
  return normalizeCaptchaInput(input) === code;
}
