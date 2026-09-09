import { useCallback, useState } from "react";
import { usePlayer } from "./PlayerContext";

// 탐색바를 끄는 동안에는 재생 위치를 따라가지 않고 손가락(마우스)을 따라가고,
// 놓는 순간에만 실제 재생 위치를 옮긴다.
//
// 리액트에서 주의할 점: `<input type="range">`의 onChange는 드래그 중 입력마다
// 발생한다(원래 DOM의 change처럼 "놓을 때 한 번"이 아니다). 그래서 onChange에
// 탐색을 걸면 드래그하는 내내 계속 탐색이 걸려서, 원본의 "놓을 때 한 번" 동작과
// 달라진다. 값 갱신은 onChange로 받고, 실제 탐색은 포인터를 놓거나 키에서 손을
// 뗄 때 확정한다.
export function useSeekDrag() {
  const { currentTime, duration, seekTo } = usePlayer();
  const [dragValue, setDragValue] = useState<number | null>(null);

  const displayTime = dragValue ?? currentTime;

  const commit = useCallback(() => {
    setDragValue((pending) => {
      if (pending !== null) seekTo(pending);
      return null;
    });
  }, [seekTo]);

  return {
    displayTime,
    remaining: duration - displayTime,
    sliderProps: {
      min: 0,
      max: duration || 100,
      step: 0.1,
      value: displayTime,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setDragValue(Number(e.currentTarget.value)),
      onPointerUp: commit,
      onPointerCancel: commit,
      onKeyUp: commit,
      onBlur: commit,
    },
  };
}
