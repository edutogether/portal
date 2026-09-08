import { useState } from "react";
import { usePlayer } from "./PlayerContext";

// 슬라이더를 끄는 동안에는 재생 위치를 따라가지 않고 손가락(마우스)을 따라가고,
// 놓는 순간에만 실제 재생 위치를 옮긴다. 원본은 seeking 플래그와 timeupdate 안의
// 조건문으로 같은 일을 했다.
export function useSeekDrag() {
  const { currentTime, duration, seekTo } = usePlayer();
  const [dragValue, setDragValue] = useState<number | null>(null);

  const displayTime = dragValue ?? currentTime;

  return {
    displayTime,
    remaining: duration - displayTime,
    sliderProps: {
      min: 0,
      max: duration || 100,
      step: 0.1,
      value: displayTime,
      onInput: (e: React.FormEvent<HTMLInputElement>) =>
        setDragValue(Number(e.currentTarget.value)),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        seekTo(Number(e.currentTarget.value));
        setDragValue(null);
      },
    },
  };
}
