import "./Header.css";

export function Header() {
  return (
    <header>
      <span className="brand-line">같이교육 제작 앱 체험관</span>
      <h1>같교오락실</h1>
      <p>
        같이교육<span className="edu-particle">이</span>{" "}
        <span className="teacher-word">선생님들이 </span>
        직접 개발한 다양한 앱들을 직접 체험해보세요 !
      </p>
    </header>
  );
}
