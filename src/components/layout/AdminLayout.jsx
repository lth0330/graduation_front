import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import useAutoRefresh from '../../hooks/useAutoRefresh.js';

export default function AdminLayout({
  roleLabel,
  consoleTitle,
  userName,
  menus,
  children,
}) {
  const { managerNotifications, refreshManagerNotifications } = useApartmentManager();
  const shouldRefreshNotifications = roleLabel === '아파트 관리자';

  useAutoRefresh(
    () => refreshManagerNotifications({ silent: true }),
    15000,
    shouldRefreshNotifications,
  );

  const unreadNotificationCount = managerNotifications.filter((notification) => !notification.read).length;
  const menuBadges = {
    '/apartment-manager/notifications': unreadNotificationCount,
  };

  return (
    <div className="admin-layout">
      <Sidebar roleLabel={roleLabel} consoleTitle={consoleTitle} menus={menus} menuBadges={menuBadges} />
      <div className="admin-main">
        <Header roleLabel={roleLabel} userName={userName} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
