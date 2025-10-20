// lib/ui/score-generic.ts
export type ScoresDict = Record<string, number>;
export type ScoresMeta = {
  order?: string[];
  labels?: Record<string, string>;
  tooltips?: Record<string, string>;
  colors?: Record<string, string>;
  primary?: string;
  weights?: Record<string, number>;
};

type Aspect = {
  key: string;
  label: string;
  value: number;
  color?: string;
  tooltip?: string;
};

const PALETTE = ["#fbbf24","#34d399","#60a5fa","#f472b6","#f87171","#a78bfa","#22d3ee","#f59e0b"];

const clamp100 = (n: unknown) => {
  const x = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, x));
};

const startCase = (key: string) =>
  key.replace(/[_\-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

const colorFromKey = (key: string) => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
};

export function scoreToStars(score100: number, scale = 5, step = 0.5): number {
  const raw = clamp100(score100) / (100 / scale);   // 0..5
  // 量化到 0.5 星（或你指定的 step）
  const q = Math.round(raw / step) * step;
  // 避免浮點 4.999999 之類
  return Math.max(0, Math.min(scale, Number(q.toFixed(2))));
}

/** headline 的星數（從 getHeadlineScore 推導） */
export function getHeadlineStars(scores?: ScoresDict, meta?: ScoresMeta, scale = 5, step = 0.5): number {
  const headline100 = getHeadlineScore(scores, meta); // 0..100
  return scoreToStars(headline100, scale, step);      // 0..5
}

export function buildAiMarkdown(feedback: Record<string, unknown> | null | undefined): string {
  if (!feedback || typeof feedback !== "object") return "";

  const formatKey = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

  return Object.entries(feedback)
    .filter(([value]) => typeof value === "string" && value.trim().length > 0)
    .map(([key, value]) => `### ${formatKey(key)}\n\n${(value as string).trim()}`)
    .join("\n\n");
}



// ---- type guards / normalizers (no `as any`) ----
export function normalizeScores(input: unknown): ScoresDict | undefined {
  if (!input || typeof input !== "object") return undefined;
  const out: ScoresDict = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = clamp100(v);
  }
  return Object.keys(out).length ? out : undefined;
}

export function normalizeScoresMeta(input: unknown): ScoresMeta | undefined {
  if (!input || typeof input !== "object") return undefined;
  const o = input as Record<string, unknown>;
  const meta: ScoresMeta = {};
  if (Array.isArray(o.order) && o.order.every((x) => typeof x === "string")) meta.order = o.order as string[];
  if (o.labels && typeof o.labels === "object") meta.labels = o.labels as Record<string, string>;
  if (o.tooltips && typeof o.tooltips === "object") meta.tooltips = o.tooltips as Record<string, string>;
  if (o.colors && typeof o.colors === "object") meta.colors = o.colors as Record<string, string>;
  if (typeof o.primary === "string") meta.primary = o.primary;
  if (o.weights && typeof o.weights === "object") {
    const w: Record<string, number> = {};
    for (const [k, v] of Object.entries(o.weights as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v) && v >= 0) w[k] = v;
    }
    if (Object.keys(w).length) meta.weights = w;
  }
  return Object.keys(meta).length ? meta : undefined;
}

// ---- builders ----
export function buildAspects(scores?: ScoresDict, meta?: ScoresMeta): Aspect[] {
  if (!scores) return [];
  const entries: Aspect[] = Object.entries(scores).map(([k, v]) => ({
    key: k,
    label: meta?.labels?.[k] ?? startCase(k),
    value: clamp100(v),
    color: meta?.colors?.[k] ?? colorFromKey(k),
    tooltip: meta?.tooltips?.[k],
  }));

  if (meta?.order?.length) {
    const pos = new Map(meta.order.map((k, i) => [k, i]));
    entries.sort((a, b) => (pos.get(a.key) ?? 999) - (pos.get(b.key) ?? 999));
  } else {
    entries.sort((a, b) => b.value - a.value);
  }
  return entries;
}

export function getHeadlineScore(scores?: ScoresDict, meta?: ScoresMeta): number {
  if (!scores) return 0;

  // 1) 指定主鍵
  if (meta?.primary && typeof scores[meta.primary] === "number") {
    return clamp100(scores[meta.primary]);
  }

  // 2) 權重
  if (meta?.weights) {
    let sumW = 0, acc = 0;
    for (const [k, w] of Object.entries(meta.weights)) {
      const val = scores[k];
      if (typeof val === "number" && typeof w === "number" && w >= 0) {
        sumW += w;
        acc += clamp100(val) * w;
      }
    }
    if (sumW > 0) return Math.round(acc / sumW);
  }

  // 3) Top3 平均
  const top3 = Object.values(scores).map(clamp100).sort((a, b) => b - a).slice(0, 3);
  if (!top3.length) return 0;
  return Math.round(top3.reduce((a, b) => a + b, 0) / top3.length);
}
