// /lib/loading/spinning-favicon/FaviconLoadingManager.tsx

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

    // ① 攔截 History API（Next 的 Link/Router 都會用到）
    if (!window._origPushState) {
      window._origPushState = history.pushState;
      history.pushState = function (...args) {
        navStart();
        return window._origPushState!.apply(this, args as any);
      };
    }
    if (!window._origReplaceState) {
      window._origReplaceState = history.replaceState;
      history.replaceState = function (...args) {
        navStart();
        return window._origReplaceState!.apply(this, args as any);
      };
    }
    const onPopState = () => navStart();
    window.addEventListener("popstate", onPopState, true);

    function navStart() {
      // 一偵測到導航就先顯示（即便還沒發生任何 fetch）
      ensureSpinner();
      if (navTimer) {
        window.clearTimeout(navTimer);
        navTimer = null;
      }
      // 若這次導航完全沒有網路請求，也至少顯示一小段時間
      navTimer = window.setTimeout(() => {
        if (inflight === 0) maybeStop();
        navTimer = null;
      }, 350);
    }

    // ② 包裝全域 fetch：有請求就顯示，全部完成才關
    if (!window._origFetch) {
      window._origFetch = window.fetch;
      window.fetch = async (...args) => {
        if (inflight++ === 0) ensureSpinner();
        try {
          return await window._origFetch!(...args);
        } finally {
          if (--inflight <= 0) scheduleSoftStop(120);
        }
      };
    }

    return () => {
      // 還原 fetch
      if (window._origFetch) {
        window.fetch = window._origFetch;
        delete window._origFetch;
      }
      // 還原 History API
      if (window._origPushState) {
        history.pushState = window._origPushState;
        delete window._origPushState;
      }
      if (window._origReplaceState) {
        history.replaceState = window._origReplaceState;
        delete window._origReplaceState;
      }
      window.removeEventListener("popstate", onPopState, true);

      // 收尾
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
