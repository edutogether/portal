import { useCallback, useEffect, useRef, useState } from "react";
import "./Toast.css";

const DEFAULT_MESSAGE = "앞으로 추가될 플레이리스트를 기대해주세요 !";
const VISIBLE_MS = 2200;

// 짧게 떴다가 스스로 사라지는 토스트. 재생 실패처럼 사용자에게 알려야 하는 실패도
// 여기로 나온다 — 조용히 죽지 않게 하려는 것이다.
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const show = useCallback((text: string = DEFAULT_MESSAGE) => {
    setMessage(text);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), VISIBLE_MS);
  }, []);

  const hide = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    setMessage(null);
  }, []);

  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);

  return { message, show, hide };
}

export function Toast({ message, onDismiss }: { message: string | null; onDismiss: () => void }) {
  return (
    <div
      className={`toast${message ? " open" : ""}`} id="modalOverlay"
      role="status" aria-live="polite" onClick={onDismiss}
    >
      {message ?? DEFAULT_MESSAGE}
    </div>
  );
}
