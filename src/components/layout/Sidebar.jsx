import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function Sidebar({ roleLabel, consoleTitle, menus }) {
  const location = useLocation();

  // 대시보드는 정확히 해당 경로일 때만 활성화하고,
  // 목록 메뉴는 상세 페이지에서도 활성화되도록 경로 앞부분을 비교합니다.
  const isSameMenuPath = (path) => {
    const dashboardPaths = ['/web-admin', '/apartment-admin'];

    if (dashboardPaths.includes(path)) {
      return location.pathname === path;
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const isGroupActive = (menu) => menu.children?.some((childMenu) => isSameMenuPath(childMenu.path));

  const [openGroups, setOpenGroups] = useState(() =>
    menus.reduce((groups, menu) => {
      if (menu.children && isGroupActive(menu)) {
        groups[menu.label] = true;
      }

      return groups;
    }, {}),
  );

  const toggleGroup = (label) => {
    setOpenGroups((currentGroups) => ({
      ...currentGroups,
      [label]: !currentGroups[label],
    }));
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">P</div>
        <div>
          <strong>Park on</strong>
          <span>{consoleTitle}</span>
        </div>
      </div>

      <div className="role-box">
        <span>관리자 역할</span>
        <strong>{roleLabel}</strong>
      </div>

      <nav className="sidebar-nav" aria-label={`${roleLabel} 메뉴`}>
        {menus.map((menu) => {
          if (menu.children) {
            const isOpen = openGroups[menu.label] || isGroupActive(menu);
            const groupActiveClass = isGroupActive(menu) ? 'active' : '';

            return (
              <div className="nav-group" key={menu.label}>
                <button
                  className={`nav-group-button ${groupActiveClass}`}
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleGroup(menu.label)}
                >
                  <span>{menu.label}</span>
                  <span className="nav-group-arrow">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="nav-submenu">
                    {menu.children.map((childMenu) => (
                      <NavLink
                        key={childMenu.path}
                        to={childMenu.path}
                        className={() => `nav-subitem ${isSameMenuPath(childMenu.path) ? 'active' : ''}`}
                      >
                        {childMenu.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={() => `nav-item ${isSameMenuPath(menu.path) ? 'active' : ''}`}
            >
              {menu.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
