// /lib/loading/spinning-favicon/favicon-spinner.ts
let rafId: number | null = null;
let origHref: string | null = null;

export type SpinnerOptions = {
  size?: number;       // 圖像大小 (px)
  lineWidth?: number;  // 粗線條寬
  color?: string;      // 旋轉弧顏色
  bg?: string;         // 背景圓顏色
  speed?: number;      // 每秒轉幾圈
  fps?: number;        // 更新頻率
};

function getOrCreateFaviconLink() {
  let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  return link;
}

export function startFaviconSpinner(opts: SpinnerOptions = {}) {
  const {
    size = 64,
    lineWidth = 10,
    color = "#4f46e5",
    bg = "#e5e7eb",
    speed = 1.25,
    fps = 12,
  } = opts;

  const link = getOrCreateFaviconLink();
  if (!origHref) origHref = link.href || "";

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const canvas = document.createElement("canvas");
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  let angle = 0;
  let last = performance.now();
  const frameInterval = 1000 / fps;
  let acc = 0;

  function draw(a: number) {
    ctx.clearRect(0, 0, size, size);

    // 背景圓（淺灰粗線）
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - lineWidth, 0, Math.PI * 2);
    ctx.strokeStyle = bg;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // 旋轉 270° 弧（主色粗線）
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.arc(0, 0, size / 2 - lineWidth, 0, Math.PI * 1.5);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    link.href = canvas.toDataURL("image/png");
  }

  function loop(now: number) {
    rafId = requestAnimationFrame(loop);
    const dt = now - last;
    last = now;
    acc += dt;
    if (acc >= frameInterval) {
      angle += (Math.PI * 2) * (speed * (acc / 1000));
      draw(angle);
      acc = 0;
    }
  }

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    draw(0); // 尊重減少動效
    return () => stopFaviconSpinner();
  }

  loop(performance.now());
  return () => stopFaviconSpinner();
}

export function stopFaviconSpinner() {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  const link = getOrCreateFaviconLink();
  if (origHref) link.href = origHref;
  origHref = null;
}

function setFaviconUrl(href: string) {
  const links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
  if (links.length === 0) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = href;
    document.head.appendChild(link);
  } else {
    links.forEach((l) => (l.href = href));
  }
}
