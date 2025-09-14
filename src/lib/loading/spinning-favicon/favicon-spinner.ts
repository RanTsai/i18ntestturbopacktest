let rafId: number | null = null;
let origHref: string | null = null;

export type SpinnerOptions = {
  size?: number;        // 圖像大小 (px)
  lineWidth?: number;   // 外圈粗線寬
  color?: string;       // 外圈顏色（旋轉的灰圈）
  speed?: number;       // 每秒轉幾圈
  fps?: number;         // 更新頻率
  gapAngle?: number;    // 缺口角度（度數），預設 40°
  ringMargin?: number;  // 外圈與內部圖示的間距（px）
};

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

function getOrCreateAnyFaviconLink() {
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
    color = "#9CA3AF", // 灰色（Tailwind gray-400）
    speed = 1.25,
    fps = 12,
    gapAngle = 40,   // 度數
    ringMargin = 2,
  } = opts;

  // 記住原始 href（Next 會自動把 app/favicon.ico 注入成 <link rel="icon">）
  const link = getOrCreateAnyFaviconLink();
  if (!origHref) origHref = link.href || "";

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const canvas = document.createElement("canvas");
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // 載入原始 favicon，畫在中心
  const iconImg = new Image();
  // 同網域的 /favicon.ico 不需要 CORS 設定；若改用外域圖片才需要加 crossOrigin
  iconImg.decoding = "async";
  iconImg.src = origHref || "/favicon.ico";

  let iconReady = false;
  iconImg.onload = () => {
    iconReady = true;
  };

  let angle = 0;
  let last = performance.now();
  const frameInterval = 1000 / fps;
  let acc = 0;

  const gapRad = (Math.max(0, Math.min(330, gapAngle))) * Math.PI / 180; // 限制 0~330 度
  const outerR = size / 2 - lineWidth / 2;    // 外圈中心半徑
  const innerR = outerR - lineWidth / 2 - ringMargin; // 內部圖示最大圓半徑

  function draw(a: number) {
    ctx.clearRect(0, 0, size, size);

    // 1) 先畫中間的原始 favicon（裁成圓形以避免四角外露）
    if (iconReady && innerR > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, innerR, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // 以 cover 方式塞滿圓內正方形
      const targetSize = innerR * 2;
      const iw = iconImg.naturalWidth || targetSize;
      const ih = iconImg.naturalHeight || targetSize;
      const srcRatio = iw / ih;
      const dstRatio = 1; // 圓內的方形是 1:1

      let sx = 0, sy = 0, sw = iw, sh = ih;
      if (srcRatio > dstRatio) {
        // 源圖偏寬：裁左右
        const newW = ih * dstRatio;
        sx = (iw - newW) / 2;
        sw = newW;
      } else if (srcRatio < dstRatio) {
        // 源圖偏高：裁上下
        const newH = iw / dstRatio;
        sy = (ih - newH) / 2;
        sh = newH;
      }

      ctx.drawImage(
        iconImg,
        sx, sy, sw, sh,
        size / 2 - targetSize / 2,
        size / 2 - targetSize / 2,
        targetSize,
        targetSize
      );
      ctx.restore();
    }

    // 2) 畫外圈「帶缺口的圓弧」，並讓整個圓弧旋轉
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(a);
    ctx.beginPath();
    // 畫 (2π - gapRad) 長度的弧；留下 gapRad 的缺口
    ctx.arc(0, 0, outerR, 0, Math.PI * 2 - gapRad, false);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    setFaviconUrl(canvas.toDataURL("image/png"));
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
    draw(0); // 尊重減少動效：只畫靜態版
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
  if (origHref) setFaviconUrl(origHref);
  origHref = null;
}
