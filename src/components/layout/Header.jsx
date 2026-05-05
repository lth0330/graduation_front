export default function Header({ roleLabel, userName }) {
  return (
    <header className="top-header">
      <div>
        <span className="header-role">{roleLabel}</span>
        <strong>{userName}</strong>
      </div>
      <button className="logout-button" type="button">
        로그아웃
      </button>
    </header>
  );
}
