import { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import ConfirmModal from '../../components/feedback/ConfirmModal.jsx';
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
import {
  formatManagerNotificationCreatedAt,
  formatManagerNotificationMessage,
} from '../../utils/managerNotificationDisplay.js';
import { usePagination } from '../../utils/pagination.js';

const notificationTypeLabel = {
  resident_signup_request: '입주민 가입 신청',
  resident_inquiry: '입주민 문의',
  abnormal_parking: '주차 알림',
  ocr_error: 'OCR 인식 실패',
  plate_review_required: '번호판 확인 필요',
  gate_alert: '차단기 알림',
};

export default function ManagerNotificationList() {
  const {
    managerNotifications,
    isManagerNotificationsLoading,
    managerNotificationsError,
    refreshManagerNotifications,
    markManagerNotificationAsRead,
    markAllManagerNotificationsAsRead,
    deleteManagerNotification,
    deleteAllManagerNotifications,
  } = useApartmentManager();
  const [selectedReadStatus, setSelectedReadStatus] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isBulkActionRunning, setIsBulkActionRunning] = useState(false);

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

  const handleReadAll = async () => {
    try {
      setIsBulkActionRunning(true);
      const result = await markAllManagerNotificationsAsRead();
      setToastMessage(`${result.updated_count || 0}개의 알림을 읽음 처리했습니다.`);
    } catch (error) {
      setToastMessage('전체 읽음 처리에 실패했습니다.');
    } finally {
      setIsBulkActionRunning(false);
    }
  };

  const handleDeleteNotification = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsBulkActionRunning(true);
      await deleteManagerNotification(deleteTarget.notificationNo);
      setDeleteTarget(null);
      setToastMessage('알림을 삭제했습니다.');
    } catch (error) {
      setToastMessage('알림 삭제에 실패했습니다.');
    } finally {
      setIsBulkActionRunning(false);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      setIsBulkActionRunning(true);
      const result = await deleteAllManagerNotifications();
      setIsDeleteAllModalOpen(false);
      setToastMessage(`${result.deleted_count || 0}개의 알림을 삭제했습니다.`);
    } catch (error) {
      setToastMessage('전체 알림 삭제에 실패했습니다.');
    } finally {
      setIsBulkActionRunning(false);
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
    {
      key: 'message',
      header: '내용',
      render: (row) => formatManagerNotificationMessage(row.message),
    },
    {
      key: 'read',
      header: '상태',
      render: (row) => (
        <Badge status={row.read ? 'inactive' : 'active'}>{row.read ? '읽음' : '안 읽음'}</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: '생성일',
      render: (row) => formatManagerNotificationCreatedAt(row.createdAt),
    },
    {
      key: 'action',
      header: '처리',
      render: (row) => (
        <div className="table-actions">
          {row.notificationType === 'plate_review_required' && (
            <Link to="/apartment-manager/plate-corrections">
              <Button variant="primary" size="small">
                보정 페이지
              </Button>
            </Link>
          )}
          {!row.read && row.notificationType !== 'plate_review_required' && (
            <Button variant="secondary" size="small" onClick={() => handleRead(row.notificationNo)}>
              읽음 처리
            </Button>
          )}
          <Button variant="danger" size="small" onClick={() => setDeleteTarget(row)}>
            삭제
          </Button>
        </div>
      ),
    },
  ];
  const hasNotifications = managerNotifications.length > 0;
  const hasUnreadNotifications = managerNotifications.some((notification) => !notification.read);

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
          <div className="table-actions">
            <Button
              variant="secondary"
              onClick={handleReadAll}
              disabled={!hasUnreadNotifications || isBulkActionRunning}
            >
              전체 읽음
            </Button>
            <Button
              variant="danger"
              onClick={() => setIsDeleteAllModalOpen(true)}
              disabled={!hasNotifications || isBulkActionRunning}
            >
              전체 삭제
            </Button>
            <Button variant="secondary" onClick={refreshManagerNotifications} disabled={isBulkActionRunning}>
              새로고침
            </Button>
          </div>
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
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="알림을 삭제하시겠습니까?"
        description={`${deleteTarget?.title || '선택한 알림'}은 삭제 후 목록에서 다시 확인할 수 없습니다.`}
        confirmLabel="삭제"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteNotification}
      />
      <ConfirmModal
        open={isDeleteAllModalOpen}
        title="전체 알림을 삭제하시겠습니까?"
        description="현재 아파트 관리자가 볼 수 있는 모든 알림이 삭제됩니다."
        confirmLabel="전체 삭제"
        danger
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAllNotifications}
      />
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
