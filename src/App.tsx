import { useCallback, useRef } from "react";
import { Orbs } from "./components/Orbs";
import { Motes } from "./components/Motes";
import { Loader } from "./components/Loader";
import { Header } from "./components/Header";
import { AppGrid } from "./components/AppGrid";
import { PlayerDesktop } from "./components/PlayerDesktop";
import { PlayerMobile } from "./components/PlayerMobile";
import { Footer } from "./components/Footer";
import { Toast, useToast } from "./components/Toast";
import { PlayerProvider } from "./player/PlayerContext";
import { useSyncPlayerHeight } from "./hooks/useSyncPlayerHeight";
import { useFaviconGray } from "./hooks/useFaviconGray";
import "./components/Stage.css";
import "./components/Controls.css";

export function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const toast = useToast();
  useSyncPlayerHeight();
  useFaviconGray();

  const showMore = useCallback(() => toast.show(), [toast]);
  const onAudioError = useCallback(() => toast.show("재생할 수 없습니다"), [toast]);

  return (
    <>
      <Orbs />
      <Motes />
      <Loader />
      <Header />

      <PlayerProvider audioRef={audioRef} onError={onAudioError}>
        <div className="stage">
          <PlayerDesktop onMore={showMore} />
          <PlayerMobile onMore={showMore} />
          <AppGrid />
        </div>
      </PlayerProvider>

      <Footer />
      <Toast message={toast.message} onDismiss={toast.hide} />
    </>
  );
}
