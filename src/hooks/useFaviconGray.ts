import { useEffect } from "react";

// 탭이 비활성일 때 파비콘(🕹️)을 흑백으로 바꾼다.
function faviconUrl(gray: boolean): string {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
        (gray ? '<filter id="g"><feColorMatrix type="saturate" values="0"/></filter>' : "") +
        '<text x="50" y="54" font-size="82" text-anchor="middle" dominant-baseline="central"' +
        (gray ? ' filter="url(#g)"' : "") +
        ">🕹️</text></svg>"
    )
  );
}

export function useFaviconGray() {
  useEffect(() => {
    const link = document.getElementById("favicon") as HTMLLinkElement | null;
    if (!link) return;
    const color = faviconUrl(false);
    const gray = faviconUrl(true);
    const apply = () => {
      link.href = document.hidden ? gray : color;
    };
    document.addEventListener("visibilitychange", apply);
    apply();
    return () => document.removeEventListener("visibilitychange", apply);
  }, []);
}
