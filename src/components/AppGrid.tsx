import { useState } from "react";
import { APPS, type AppLink } from "../data/apps";
import "./AppCard.css";

// 카드는 전체가 하나의 링크이고 항상 새 탭으로 연다 — 포털이 원래 탭에 남아야
// 앱 탭만 닫으면 선택 화면으로 돌아온다(각 앱에 "돌아가기" 버튼이 없는 이유).
function AppCard({ app }: { app: AppLink }) {
  const [thumbBroken, setThumbBroken] = useState(false);

  return (
    <a className="app" href={app.href} target="_blank" rel="noopener noreferrer">
      <div className="thumb">
        <img
          className="thumb-img" src={app.thumb} alt={app.alt} loading="lazy"
          style={thumbBroken ? { display: "none" } : undefined}
          onError={() => setThumbBroken(true)}
        />
        <span className="play" aria-hidden="true" />
      </div>
      <div className="body">
        <span className="name">{app.name}</span>
        <span className="desc">
          <span className="hook">{app.hook}</span>
          <br />
          {app.short ? (
            <>
              <span className="full">{app.full}</span>
              <span className="short">{app.short}</span>
            </>
          ) : (
            app.full
          )}
        </span>
      </div>
    </a>
  );
}

export function AppGrid() {
  return (
    <main>
      {APPS.map((app) => (
        <AppCard key={app.href} app={app} />
      ))}
    </main>
  );
}
