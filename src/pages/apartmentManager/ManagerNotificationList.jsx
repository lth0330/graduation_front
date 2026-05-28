import { useState } from 'react';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SelectBox from '../../components/forms/SelectBox.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import { usePagination } from '../../utils/pagination.js';

const notificationTypeLabel = {
  resident_inquiry: '입주민 문의',
  abnormal_parking: '주차 알림',
};

export default function ManagerNotificationList() {
  const {
    managerNotifications,
    isManagerNotificationsLoading,
    managerNotificationsError,
    refreshManagerNotifications,
    markManagerNotificationAsRead,
  } = useApartmentManager();
  const [selectedReadStatus, setSelectedReadStatus] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  const filteredNotifications =
    selectedReadStatus === 'all'
      ? managerNotifications
      : managerNotifications.filter((notification) =>
          selectedReadStatus === 'unread' ? !notification.read : notification.read,
        );

  const { currentPage, setCurrentPage, totalPages, pagedRows, startIndex } = usePagination(
    filteredNotifications,
    8,
    [selectedReadStatus],
  );

  const handleRead = async (notificationNo) => {
    try {
      await markManagerNotificationAsRead(notificationNo);
      setToastMessage('알림을 읽음 처리했습니다.');
    } catch (error) {
      setToastMessage('알림 읽음 처리에 실패했습니다.');
    }
  };

  const columns = [
    { key: 'id', header: '번호' },
    {
      key: 'notificationType',
      header: '구분',
      render: (row) => notificationTypeLabel[row.notificationType] || row.notificationType,
    },
    { key: 'title', header: '제목' },
    { key: 'message', header: '내용' },
    {
      key: 'read',
      header: '상태',
      render: (row) => (
        <Badge status={row.read ? 'inactive' : 'active'}>{row.read ? '읽음' : '안 읽음'}</Badge>
      ),
    },
    { key: 'createdAt', header: '생성일' },
    {
      key: 'action',
      header: '처리',
      render: (row) =>
        row.read ? (
          '-'
        ) : (
          <Button variant="secondary" size="small" onClick={() => handleRead(row.notificationNo)}>
            읽음 처리
          </Button>
        ),
    },
  ];

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="관리자 알림"
        description="입주민 문의와 주차 이상 상황 알림을 확인합니다."
      />

      <SectionCard title="알림 목록">
        <div className="section-toolbar">
          <div className="status-filter">
            <SelectBox
              aria-label="알림 읽음 상태 분류"
              value={selectedReadStatus}
              onChange={(event) => setSelectedReadStatus(event.target.value)}
            >
              <option value="all">전체</option>
              <option value="unread">안 읽음</option>
              <option value="read">읽음</option>
            </SelectBox>
          </div>
          <Button variant="secondary" onClick={refreshManagerNotifications}>
            새로고침
          </Button>
        </div>

        {isManagerNotificationsLoading ? (
          <LoadingState message="관리자 알림 목록을 불러오는 중" />
        ) : managerNotificationsError ? (
          <>
            <EmptyState title="관리자 알림 조회 실패" description={managerNotificationsError} />
            <div className="detail-actions">
              <Button variant="secondary" onClick={refreshManagerNotifications}>
                다시 불러오기
              </Button>
            </div>
          </>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={pagedRows}
              startIndex={startIndex}
              emptyMessage="표시할 관리자 알림이 없습니다."
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
