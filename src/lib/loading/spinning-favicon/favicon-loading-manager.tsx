"use client";

import { useEffect } from "react";
import { startFaviconSpinner, stopFaviconSpinner } from "./favicon-spinner";

declare global {
  interface Window {
    _origFetch?: typeof fetch;
    _origPushState?: History["pushState"];
    _origReplaceState?: History["replaceState"];
  }
}

export default function FaviconLoadingManager() {
  useEffect(() => {
    let stop: (() => void) | undefined;
    let inflight = 0;
    let navTimer: number | null = null;

    const ensureSpinner = () => {
      if (!stop) stop = startFaviconSpinner();
    };
    const maybeStop = () => {
      if (inflight === 0) {
        stop?.();
        stop = undefined;
        stopFaviconSpinner();
      }
    };
    const scheduleSoftStop = (delay = 200) => {
      window.setTimeout(maybeStop, delay);
    };

    function navStart() {
      ensureSpinner();
      if (navTimer) {
        window.clearTimeout(navTimer);
        navTimer = null;
      }
      navTimer = window.setTimeout(() => {
        if (inflight === 0) maybeStop();
        navTimer = null;
      }, 350);
    }

    // ① History API：導航時才顯示 spinner
    if (!window._origPushState) {
      window._origPushState = history.pushState;
      const orig = window._origPushState;
      history.pushState = ((...args: Parameters<typeof orig>) => {
        navStart();
        return orig.call(history, ...args);
      }) as History["pushState"];
    }

    if (!window._origReplaceState) {
      window._origReplaceState = history.replaceState;
      const orig = window._origReplaceState;
      history.replaceState = ((...args: Parameters<typeof orig>) => {
        navStart();
        return orig.call(history, ...args);
      }) as History["replaceState"];
    }

    const onPopState = () => navStart();
    window.addEventListener("popstate", onPopState, true);

    // ② 包裝 fetch：必要時才顯示，且跳過某些 API（例如 i18n）
if (!window._origFetch) {
  window._origFetch = window.fetch;

  // 支援 string | URL | Request
// 支援 string | URL | Request | 其他 (unknown)
const toUrlString = (input: string | URL | Request | unknown): string => {
  try {
    if (typeof input === "string") return input;

    if (input instanceof URL) return input.toString();

    if (typeof Request !== "undefined" && input instanceof Request) {
      return input.url;
    }

    // 其它未知型別：嘗試取 url 屬性，最後 fallback 成字串
    if (typeof input === "object" && input !== null && "url" in input) {
      const maybeUrl = (input as { url?: unknown }).url;
      if (typeof maybeUrl === "string") return maybeUrl;
    }

    return String(input ?? "");
  } catch {
    return "";
  }
};

  const shouldSkip = (url?: string) => {
    if (!url) return true; // 沒有 URL 當作要跳過，避免報錯

    // 跳過 i18n、favicon、Next 自己的載入/靜態資源/RSC
    return (
      url.includes("/api/i18n") ||
      url.includes("/favicon.ico") ||
      url.includes("/_next/") ||
      url.includes("__nextjs") ||
      url.includes("__flight__") ||
      url.includes("/_proxy") // 部分環境的中介端點
    );
  };

  const origFetch = window._origFetch;
  window.fetch = (async (...args: Parameters<typeof origFetch>) => {
    const url = toUrlString(args[0]); // ← 統一抽成字串

    if (!shouldSkip(url)) {
      if (inflight++ === 0) ensureSpinner();
    }
    try {
      const resp = await origFetch(...args);
      return resp;
    } finally {
      if (!shouldSkip(url)) {
        if (--inflight <= 0) scheduleSoftStop(120);
      }
    }
  }) as typeof fetch;
}


    // ③ 頁籤隱藏時停止動畫，避免浪費
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        stop?.();
        stop = undefined;
        stopFaviconSpinner();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (window._origFetch) {
        window.fetch = window._origFetch;
        delete window._origFetch;
      }
      if (window._origPushState) {
        history.pushState = window._origPushState;
        delete window._origPushState;
      }
      if (window._origReplaceState) {
        history.replaceState = window._origReplaceState;
        delete window._origReplaceState;
      }
      window.removeEventListener("popstate", onPopState, true);
      document.removeEventListener("visibilitychange", onVisibility);

      stop?.();
      stop = undefined;
      stopFaviconSpinner();
      if (navTimer) {
        window.clearTimeout(navTimer);
        navTimer = null;
      }
    };
  }, []);

  return null;
}
