import { useState } from 'react';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import FormField from '../../components/forms/FormField.jsx';
import SelectBox from '../../components/forms/SelectBox.jsx';
import TextInput from '../../components/forms/TextInput.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import { usePagination } from '../../utils/pagination.js';
import {
  getPlateReviewImageUrl,
  getPlateReviewManualConfirmLabel,
  hasPlateReviewCandidates,
  normalizePlateInput,
} from '../../utils/plateCorrectionReview.js';

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
    plateCorrectionReviews,
    plateCorrectionReviewsError,
    refreshManagerNotifications,
    markManagerNotificationAsRead,
    confirmPlateCorrectionReview,
  } = useApartmentManager();
  const [selectedReadStatus, setSelectedReadStatus] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [manualPlate, setManualPlate] = useState('');
  const [reviewImageError, setReviewImageError] = useState('');
  const [isConfirmingReview, setIsConfirmingReview] = useState(false);

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

  const findReviewForNotification = (notification) =>
    plateCorrectionReviews.find((review) => review.reviewId === notification.referenceId) || null;

  const handleOpenReview = (notification) => {
    const review = findReviewForNotification(notification);
    if (!review) {
      setToastMessage(plateCorrectionReviewsError || '확인할 번호판 후보를 찾지 못했습니다.');
      return;
    }
    setSelectedReview(review);
    setManualPlate(review.matchedPlate || '');
    setReviewImageError('');
  };

  const handleCloseReview = () => {
    setSelectedReview(null);
    setManualPlate('');
    setReviewImageError('');
  };

  const handleConfirmReview = async (plate) => {
    const confirmedPlate = normalizePlateInput(plate);

    if (!selectedReview) {
      return;
    }

    if (!confirmedPlate) {
      setToastMessage('확정할 차량번호를 입력하세요.');
      return;
    }

    try {
      setIsConfirmingReview(true);
      await confirmPlateCorrectionReview(selectedReview.reviewId, confirmedPlate);
      handleCloseReview();
      setToastMessage(`${confirmedPlate} 번호판으로 확정했습니다.`);
    } catch (error) {
      setToastMessage('번호판 확정에 실패했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setIsConfirmingReview(false);
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
        ) : row.notificationType === 'plate_review_required' ? (
          <Button variant="primary" size="small" onClick={() => handleOpenReview(row)}>
            후보 선택
          </Button>
        ) : (
          <Button variant="secondary" size="small" onClick={() => handleRead(row.notificationNo)}>
            읽음 처리
          </Button>
      ),
    },
  ];
  const selectedReviewImageUrl = getPlateReviewImageUrl(selectedReview);
  const selectedReviewImagePath = String(selectedReview?.parkingHistory?.imagePath || '').trim();
  const hasSelectedReviewImage = Boolean(selectedReviewImageUrl) && !reviewImageError;
  const reviewCandidates = selectedReview?.candidateList || [];
  const hasReviewCandidates = hasPlateReviewCandidates(selectedReview);

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
      {selectedReview && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-panel parking-error-modal" role="dialog" aria-modal="true" aria-labelledby="plate-review-title">
            <h2 id="plate-review-title">번호판 후보 확인</h2>
            <p>
              {selectedReview.zone} 구역 OCR 결과 {selectedReview.ocrPlate || '-'}를 확인합니다.
              거리값 {selectedReview.distance ?? '-'} 기준 후보를 선택하거나 이미지를 보고 직접 입력하세요.
            </p>
            {hasSelectedReviewImage ? (
              <img
                className="parking-error-image"
                src={selectedReviewImageUrl}
                alt={`${selectedReview.zone} 구역 번호판 확인 이미지`}
                onLoad={() => setReviewImageError('')}
                onError={() => {
                  setReviewImageError('이미지 파일을 불러오지 못했습니다. 서버 uploads/S3 경로와 파일 존재 여부를 확인하세요.');
                }}
              />
            ) : (
              <div className="parking-error-empty">
                {reviewImageError || '저장된 확인 이미지 없음'}
              </div>
            )}
            {(!selectedReviewImageUrl || reviewImageError) && selectedReviewImagePath && (
              <p className="parking-error-meta">저장 경로: {selectedReviewImagePath}</p>
            )}
            <div className="detail-grid">
              <div>
                <strong>주차 이력</strong>
                <span>{selectedReview.historyId || '-'}</span>
              </div>
              <div>
                <strong>입차 시각</strong>
                <span>{selectedReview.parkingHistory?.entryTime || '-'}</span>
              </div>
            </div>
            <div className="form-grid">
              <FormField
                label="직접 입력"
                helper="후보에 없거나 이미지 확인 결과가 다르면 실제 차량번호를 입력합니다."
              >
                <TextInput
                  value={manualPlate}
                  onChange={(event) => setManualPlate(event.target.value)}
                  placeholder="예: 12가3456"
                  disabled={isConfirmingReview}
                />
              </FormField>
              <div className="form-field">
                <span>직접 확정</span>
                <Button
                  variant="primary"
                  onClick={() => handleConfirmReview(manualPlate)}
                  disabled={isConfirmingReview || !normalizePlateInput(manualPlate)}
                >
                  {getPlateReviewManualConfirmLabel(isConfirmingReview)}
                </Button>
              </div>
            </div>
            {!hasReviewCandidates && (
              <p className="parking-error-meta">후보 없음: 이미지를 확인한 뒤 직접 입력하세요.</p>
            )}
            <div className="modal-actions">
              {hasSelectedReviewImage && (
                <a className="text-link" href={selectedReviewImageUrl} target="_blank" rel="noreferrer">
                  새 탭에서 열기
                </a>
              )}
              {hasReviewCandidates && reviewCandidates.map((candidate) => (
                <Button
                  key={candidate}
                  variant="primary"
                  onClick={() => handleConfirmReview(candidate)}
                  disabled={isConfirmingReview}
                >
                  {candidate}
                </Button>
              ))}
              <Button variant="secondary" onClick={handleCloseReview} disabled={isConfirmingReview}>
                닫기
              </Button>
            </div>
          </section>
        </div>
      )}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
