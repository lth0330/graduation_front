import { useEffect, useMemo, useState } from 'react';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import FormField from '../../components/forms/FormField.jsx';
import TextInput from '../../components/forms/TextInput.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import useAutoRefresh from '../../hooks/useAutoRefresh.js';
import { usePagination } from '../../utils/pagination.js';
import {
  getPlateReviewImageUrl,
  getPlateReviewManualConfirmLabel,
  hasPlateReviewCandidates,
  normalizePlateInput,
} from '../../utils/plateCorrectionReview.js';

function formatCandidateText(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return '후보 없음';
  }
  return candidates.join(', ');
}

export default function PlateCorrectionReviewPage() {
  const {
    plateCorrectionReviews,
    plateCorrectionReviewsError,
    isManagerNotificationsLoading,
    refreshManagerNotifications,
    confirmPlateCorrectionReview,
  } = useApartmentManager();
  const [selectedReviewId, setSelectedReviewId] = useState('');
  const [manualPlate, setManualPlate] = useState('');
  const [reviewImageError, setReviewImageError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isConfirmingReview, setIsConfirmingReview] = useState(false);

  useAutoRefresh(() => refreshManagerNotifications({ silent: true }), 10000, !isConfirmingReview);

  const selectedReview = useMemo(
    () => plateCorrectionReviews.find((review) => review.id === selectedReviewId) || plateCorrectionReviews[0] || null,
    [plateCorrectionReviews, selectedReviewId],
  );

  useEffect(() => {
    if (!selectedReview || selectedReviewId) {
      return;
    }
    setManualPlate(selectedReview.matchedPlate || '');
    setReviewImageError('');
  }, [selectedReview, selectedReviewId]);

  const { currentPage, setCurrentPage, totalPages, pagedRows, startIndex } = usePagination(
    plateCorrectionReviews,
    8,
    [],
  );

  const selectedReviewImageUrl = getPlateReviewImageUrl(selectedReview);
  const selectedReviewImagePath = String(selectedReview?.parkingHistory?.imagePath || '').trim();
  const hasSelectedReviewImage = Boolean(selectedReviewImageUrl) && !reviewImageError;
  const reviewCandidates = selectedReview?.candidateList || [];
  const hasReviewCandidates = hasPlateReviewCandidates(selectedReview);

  const handleSelectReview = (review) => {
    setSelectedReviewId(review.id);
    setManualPlate(review.matchedPlate || '');
    setReviewImageError('');
  };

  const handleConfirmReview = async (plate) => {
    const confirmedPlate = normalizePlateInput(plate);

    if (!selectedReview) {
      setToastMessage('확인할 번호판 보정 항목을 선택하세요.');
      return;
    }

    if (!confirmedPlate) {
      setToastMessage('확정할 차량번호를 입력하세요.');
      return;
    }

    try {
      setIsConfirmingReview(true);
      await confirmPlateCorrectionReview(selectedReview.reviewId, confirmedPlate);
      setSelectedReviewId('');
      setManualPlate('');
      setReviewImageError('');
      setToastMessage(`${confirmedPlate} 번호판으로 확정했습니다.`);
    } catch (error) {
      setToastMessage('번호판 확정에 실패했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setIsConfirmingReview(false);
    }
  };

  const columns = [
    { key: 'id', header: '번호' },
    { key: 'zone', header: '구역' },
    {
      key: 'ocrPlate',
      header: 'OCR 결과',
      render: (row) => row.ocrPlate || '-',
    },
    {
      key: 'matchedPlate',
      header: '자동 후보',
      render: (row) => row.matchedPlate || '-',
    },
    {
      key: 'candidateList',
      header: '후보 목록',
      render: (row) => formatCandidateText(row.candidateList),
    },
    {
      key: 'distance',
      header: '거리값',
      render: (row) => row.distance ?? '-',
    },
    {
      key: 'entryTime',
      header: '입차 시각',
      render: (row) => row.parkingHistory?.entryTime || '-',
    },
    {
      key: 'createdAt',
      header: '생성일',
      render: (row) => row.createdAt || '-',
    },
    {
      key: 'action',
      header: '처리',
      render: (row) => (
        <Button variant={row.id === selectedReview?.id ? 'primary' : 'secondary'} size="small" onClick={() => handleSelectReview(row)}>
          확인
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
        title="번호판 보정"
        description="OCR 결과가 애매한 주차 이력을 이미지와 후보 목록으로 확인하고 실제 차량번호를 확정합니다."
      />

      <SectionCard title="확인 필요 목록">
        <div className="section-toolbar">
          <p className="section-help">최근 확인 필요 항목이 먼저 표시됩니다.</p>
          <Button variant="secondary" onClick={refreshManagerNotifications} disabled={isConfirmingReview}>
            새로고침
          </Button>
        </div>

        {isManagerNotificationsLoading ? (
          <LoadingState message="번호판 확인 필요 목록을 불러오는 중" />
        ) : plateCorrectionReviewsError ? (
          <>
            <EmptyState title="번호판 확인 필요 목록 조회 실패" description={plateCorrectionReviewsError} />
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
              emptyMessage="확인할 번호판 보정 항목이 없습니다."
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>

      <SectionCard title="번호판 확인 작업">
        {!selectedReview ? (
          <EmptyState title="선택된 항목이 없습니다." description="확인 필요 목록에서 항목을 선택하세요." />
        ) : (
          <div className="plate-review-workspace">
            <div className="plate-review-preview">
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
              {hasSelectedReviewImage && (
                <a className="text-link" href={selectedReviewImageUrl} target="_blank" rel="noreferrer">
                  새 탭에서 이미지 열기
                </a>
              )}
            </div>

            <div className="plate-review-panel">
              <div className="detail-grid">
                <div>
                  <strong>상태</strong>
                  <span>
                    <Badge status="pending">확인 필요</Badge>
                  </span>
                </div>
                <div>
                  <strong>구역</strong>
                  <span>{selectedReview.zone || '-'}</span>
                </div>
                <div>
                  <strong>OCR 결과</strong>
                  <span>{selectedReview.ocrPlate || '-'}</span>
                </div>
                <div>
                  <strong>자동 후보</strong>
                  <span>{selectedReview.matchedPlate || '-'}</span>
                </div>
                <div>
                  <strong>거리값</strong>
                  <span>{selectedReview.distance ?? '-'}</span>
                </div>
                <div>
                  <strong>주차 이력</strong>
                  <span>{selectedReview.historyId || '-'}</span>
                </div>
                <div>
                  <strong>입차 시각</strong>
                  <span>{selectedReview.parkingHistory?.entryTime || '-'}</span>
                </div>
                <div>
                  <strong>현재 저장 번호</strong>
                  <span>{selectedReview.parkingHistory?.plate || '-'}</span>
                </div>
              </div>

              <div className="plate-review-candidates">
                <strong>후보 선택</strong>
                <div className="table-actions">
                  {hasReviewCandidates ? (
                    reviewCandidates.map((candidate) => (
                      <Button
                        key={candidate}
                        variant="primary"
                        onClick={() => handleConfirmReview(candidate)}
                        disabled={isConfirmingReview}
                      >
                        {candidate}
                      </Button>
                    ))
                  ) : (
                    <span className="parking-error-meta">후보가 없으면 이미지 확인 후 직접 입력하세요.</span>
                  )}
                </div>
              </div>

              <div className="form-grid">
                <FormField
                  label="직접 입력"
                  helper="후보가 틀렸거나 후보가 없으면 실제 차량번호를 입력합니다."
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
            </div>
          </div>
        )}
      </SectionCard>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
