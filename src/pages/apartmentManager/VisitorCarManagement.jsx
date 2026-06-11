import { useState } from 'react';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import ConfirmModal from '../../components/feedback/ConfirmModal.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import FormField from '../../components/forms/FormField.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SearchBar from '../../components/forms/SearchBar.jsx';
import TextInput from '../../components/forms/TextInput.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import useAutoRefresh from '../../hooks/useAutoRefresh.js';
import { usePagination } from '../../utils/pagination.js';
import { filterByKeyword } from '../../utils/search.js';

const visitorCarStatusLabel = {
  waiting: '입차 대기',
  entered: '입차 완료',
  parked: '주차 중',
};

const visitorCarStatusBadge = {
  waiting: 'pending',
  entered: 'approved',
  parked: 'active',
};

const columns = [
  { key: 'id', header: '방문 차량 ID' },
  { key: 'carNumber', header: '차량번호' },
  { key: 'ownerName', header: '신청 입주민' },
  { key: 'unitInfo', header: '동/호수', render: (row) => `${row.building || '-'}동 ${row.unit || '-'}호` },
  { key: 'registeredAt', header: '등록일시' },
  { key: 'gateEnteredAt', header: '입차시간', render: (row) => row.gateEnteredAt || '입차 전' },
  { key: 'parkedAt', header: '주차시간', render: (row) => row.parkedAt || '주차 전' },
  { key: 'expiresAt', header: '만료일', render: (row) => row.expiresAt || '-' },
  {
    key: 'status',
    header: '상태',
    render: (row) => (
      <Badge status={visitorCarStatusBadge[row.status]}>{visitorCarStatusLabel[row.status]}</Badge>
    ),
  },
];

export default function VisitorCarManagement() {
  const {
    visitorCars,
    isVisitorCarsLoading,
    visitorCarsError,
    refreshVisitorCars,
    updateVisitorCarExpiration,
    deleteVisitorCar,
  } = useApartmentManager();
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [expirationTarget, setExpirationTarget] = useState(null);
  const [expirationValue, setExpirationValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAutoRefresh(() => refreshVisitorCars({ silent: true }), 10000);

  const filteredVisitorCars = filterByKeyword(visitorCars, keyword, [
    'id',
    'carNumber',
    'ownerName',
    'building',
    'unit',
    'status',
  ]);
  const { currentPage, setCurrentPage, totalPages, pagedRows, startIndex } = usePagination(
    filteredVisitorCars,
    5,
    [keyword],
  );

  const openExpirationModal = (visitorCar) => {
    setExpirationTarget(visitorCar);
    setExpirationValue(visitorCar.expiresAtInput || '');
  };

  const closeExpirationModal = () => {
    if (isSubmitting) {
      return;
    }

    setExpirationTarget(null);
    setExpirationValue('');
  };

  const handleUpdateExpiration = async () => {
    if (!expirationTarget || isSubmitting) {
      return;
    }

    if (!expirationValue) {
      setToastType('error');
      setToastMessage('만료시간을 입력하세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateVisitorCarExpiration(expirationTarget.id, expirationValue);
      setExpirationTarget(null);
      setExpirationValue('');
      setToastType('success');
      setToastMessage('방문차량 만료시간이 수정되었습니다.');
    } catch (error) {
      setToastType('error');
      setToastMessage('방문차량 만료시간 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteVisitorCar(deleteTarget.id);
      setDeleteTarget(null);
      setToastType('success');
      setToastMessage('방문차량이 삭제되었습니다.');
    } catch (error) {
      setToastType('error');
      setToastMessage('방문차량 삭제에 실패했습니다. 연결된 입차 기록이 있는지 확인하세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const tableColumns = [
    ...columns,
    {
      key: 'actions',
      header: '관리',
      render: (row) => (
        <div className="table-actions">
          <Button variant="secondary" size="small" onClick={() => openExpirationModal(row)}>
            만료 수정
          </Button>
          <Button variant="danger" size="small" onClick={() => setDeleteTarget(row)}>
            삭제
          </Button>
        </div>
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
        title="방문 차량 관리"
        description="입주민이 앱에서 등록한 방문 차량과 입차/만료 상태를 확인합니다."
      />

      <SectionCard title="방문 차량 목록" description="방문 차량은 앱에서 입주민이 등록하며, 실제 입차 후 24시간 만료 시간이 기록됩니다.">
        <div className="section-toolbar">
          <SearchBar
            placeholder="차량번호, 신청 입주민, 동/호수 검색"
            value={searchInput}
            onChange={setSearchInput}
            onSearch={() => setKeyword(searchInput)}
          />
          <Button variant="secondary" onClick={refreshVisitorCars}>
            새로고침
          </Button>
        </div>

        {isVisitorCarsLoading ? (
          <LoadingState message="방문 차량 목록을 불러오는 중" />
        ) : visitorCarsError ? (
          <>
            <EmptyState title="방문 차량 목록 조회 실패" description={visitorCarsError} />
            <div className="detail-actions">
              <Button variant="secondary" onClick={refreshVisitorCars}>
                다시 불러오기
              </Button>
            </div>
          </>
        ) : (
          <>
            <DataTable
              columns={tableColumns}
              rows={pagedRows}
              startIndex={startIndex}
              emptyMessage="조건에 맞는 방문 차량이 없습니다."
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>

      {expirationTarget && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="visitor-expiration-title">
            <h2 id="visitor-expiration-title">방문차량 만료시간 수정</h2>
            <p>{expirationTarget.carNumber} 차량의 방문 만료시간을 수정합니다.</p>
            <FormField label="만료시간">
              <TextInput
                type="datetime-local"
                value={expirationValue}
                onChange={(event) => setExpirationValue(event.target.value)}
              />
            </FormField>
            <div className="modal-actions">
              <Button variant="secondary" disabled={isSubmitting} onClick={closeExpirationModal}>
                취소
              </Button>
              <Button disabled={isSubmitting} onClick={handleUpdateExpiration}>
                {isSubmitting ? '저장 중' : '저장'}
              </Button>
            </div>
          </section>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="방문차량을 삭제하시겠습니까?"
        description={`${deleteTarget?.carNumber || ''} 방문차량 등록 정보는 삭제 후 복구할 수 없습니다.`}
        confirmLabel={isSubmitting ? '삭제 중' : '삭제'}
        danger
        onClose={() => {
          if (!isSubmitting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleDelete}
      />
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
