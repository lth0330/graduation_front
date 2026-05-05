import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

export default function AdminLayout({
  roleLabel,
  consoleTitle,
  userName,
  menus,
  children,
}) {
  return (
    <div className="admin-layout">
      <Sidebar roleLabel={roleLabel} consoleTitle={consoleTitle} menus={menus} />
      <div className="admin-main">
        <Header roleLabel={roleLabel} userName={userName} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
