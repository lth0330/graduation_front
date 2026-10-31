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
  const { managerNotifications, refreshManagerNotifications, apartmentManagerProfile } = useApartmentManager();
  const shouldRefreshNotifications = roleLabel === '아파트 관리자';
  // 아파트 관리자는 로그인한 관리자 이름·아파트를 보여 준다 (불러오기 전에는 페이지가 넘긴 이름)
  const managerName = apartmentManagerProfile?.name;
  const displayUserName = shouldRefreshNotifications && managerName
    ? [managerName, apartmentManagerProfile.apartmentName].filter(Boolean).join(' · ')
    : userName;

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
        <Header roleLabel={roleLabel} userName={displayUserName} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
