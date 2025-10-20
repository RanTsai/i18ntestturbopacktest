let rafId: number | null = null;
let origHref: string | null = null;
let currentHref: string | null = null; // ✅ 追蹤目前已設定的 href，避免重複寫入

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
  // ✅ 只有在不同時才改 href，避免觸發瀏覽器重新抓取
  if (href === currentHref) return;
  const links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
  if (links.length === 0) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = href;
    document.head.appendChild(link);
  } else {
    links.forEach((l) => (l.href = href));
  }
  currentHref = href;
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
    color = "#9CA3AF",
    speed = 1.25,
    fps = 12,
    gapAngle = 40,
    ringMargin = 2,
  } = opts;

  // 記住原始 href（Next 會把 public/favicon.ico 注入）
  const link = getOrCreateAnyFaviconLink();
  if (!origHref) origHref = link.href || "/favicon.ico";
  if (currentHref === null) currentHref = link.href || "";

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const canvas = document.createElement("canvas");
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // 載入原始 favicon（只會請求一次）
  const iconImg = new Image();
  iconImg.decoding = "async";
  iconImg.src = origHref || "/favicon.ico";
  let iconReady = false;
  iconImg.onload = () => { iconReady = true; };
  iconImg.onerror = () => { iconReady = false; }; // 載不到也照常轉

  let angle = 0;
  let last = performance.now();
  const frameInterval = 1000 / fps;
  let acc = 0;

  const gapRad = Math.max(0, Math.min(330, gapAngle)) * Math.PI / 180;
  const outerR = size / 2 - lineWidth / 2;
  const innerR = Math.max(0, outerR - lineWidth / 2 - ringMargin);

  function draw(a: number) {
    ctx.clearRect(0, 0, size, size);

    // 1) 畫中間原始 favicon（裁成圓形）
    if (iconReady && innerR > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, innerR, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const target = innerR * 2;
      const iw = iconImg.naturalWidth || target;
      const ih = iconImg.naturalHeight || target;
      const srcRatio = iw / ih;

      let sx = 0, sy = 0, sw = iw, sh = ih;
      if (srcRatio > 1) { // 源圖偏寬：裁左右
        const newW = ih * 1;
        sx = (iw - newW) / 2; sw = newW;
      } else if (srcRatio < 1) { // 源圖偏高：裁上下
        const newH = iw / 1;
        sy = (ih - newH) / 2; sh = newH;
      }

      ctx.drawImage(
        iconImg,
        sx, sy, sw, sh,
        size / 2 - target / 2,
        size / 2 - target / 2,
        target, target
      );
      ctx.restore();
    }

    // 2) 旋轉外圈弧
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, Math.PI * 2 - gapRad, false);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    // ✅ 使用 dataURL：純本地，不會打網路
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

  // 尊重「減少動效」
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    draw(0);
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
  // ✅ 只在不同時才還原，避免再次觸發載入
  if (origHref && currentHref !== origHref) {
    setFaviconUrl(origHref);
  }
  // 清理追蹤（下次啟動時可再次記錄）
  currentHref = origHref;
  origHref = null;
}
