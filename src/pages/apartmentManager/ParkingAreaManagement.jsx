import { useEffect, useState } from 'react';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import ConfirmModal from '../../components/feedback/ConfirmModal.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SelectBox from '../../components/forms/SelectBox.jsx';
import FormField from '../../components/forms/FormField.jsx';
import TextArea from '../../components/forms/TextArea.jsx';
import TextInput from '../../components/forms/TextInput.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import useAutoRefresh from '../../hooks/useAutoRefresh.js';
import {
  buildParkingPlacementFromRange,
  formatParkingRange,
  getParkingPlacement,
  getParkingRangeFromPlacement,
  isValidParkingRange,
} from '../../utils/parkingLayout.js';
import { usePagination } from '../../utils/pagination.js';

const areaStatusLabel = {
  empty: '빈자리',
  occupied: '주차됨',
  disabled: '사용 불가',
};

const areaStatusBadge = {
  empty: 'active',
  occupied: 'rejected',
  disabled: 'rejected',
};

const zoneTypeLabel = {
  normal: '일반 주차칸',
  double_lane: '통로 주차칸',
};

const columns = [
  { key: 'id', header: '구역 ID' },
  { key: 'areaNumber', header: '구역 번호' },
  { key: 'zoneType', header: '구역 종류', render: (row) => zoneTypeLabel[row.zoneType] || '일반 주차칸' },
  {
    key: 'status',
    header: '상태',
    render: (row) => <Badge status={areaStatusBadge[row.status]}>{areaStatusLabel[row.status]}</Badge>,
  },
  {
    key: 'placement',
    header: '배치',
    className: 'table-cell-center',
    render: (row) => formatParkingRange(row),
  },
  { key: 'statusChangeReason', header: '변경 사유', render: (row) => row.statusChangeReason ?? null },
];

export default function ParkingAreaManagement() {
  const {
    parkingLots,
    parkingAreas,
    isParkingLoading,
    parkingError,
    refreshParkingData,
    createParkingArea,
    updateParkingAreaStatus,
    updateParkingAreaLayout,
    deleteParkingArea,
  } = useApartmentManager();
  const [selectedParkingLotId, setSelectedParkingLotId] = useState(parkingLots[0]?.id || '');
  const [form, setForm] = useState({
    areaNumber: '',
    status: 'empty',
    zoneType: 'normal',
    rowStart: '1',
    rowEnd: '1',
    columnStart: '1',
    columnEnd: '2',
  });
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: 'empty', zoneType: 'normal', reason: '' });
  const [statusError, setStatusError] = useState('');
  const [layoutTarget, setLayoutTarget] = useState(null);
  const [layoutForm, setLayoutForm] = useState({
    rowStart: '1',
    rowEnd: '1',
    columnStart: '1',
    columnEnd: '2',
  });
  const [layoutError, setLayoutError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const canAutoRefresh = !statusTarget && !layoutTarget && !deleteTargetId;

  useAutoRefresh(() => refreshParkingData({ silent: true }), 10000, canAutoRefresh);

  useEffect(() => {
    if (parkingLots.length > 0 && !parkingLots.some((parkingLot) => parkingLot.id === selectedParkingLotId)) {
      setSelectedParkingLotId(parkingLots[0].id);
    }
  }, [parkingLots, selectedParkingLotId]);

  const selectedParkingLot = parkingLots.find((parkingLot) => parkingLot.id === selectedParkingLotId);
  const visibleAreas = parkingAreas
    .filter((parkingArea) => parkingArea.parkingLotId === selectedParkingLot?.id)
    .map((parkingArea, index) => {
      const placement = getParkingPlacement(parkingArea, index);

      return {
        ...parkingArea,
        ...placement,
      };
    });
  const { currentPage, setCurrentPage, totalPages, pagedRows, startIndex } = usePagination(visibleAreas, 5, [
    selectedParkingLotId,
  ]);
  const tableColumns = [
    ...columns,
    {
      key: 'changeLayout',
      header: '배치 수정',
      render: (row) => (
        <Button variant="secondary" size="small" onClick={() => openLayoutModal(row)}>
          수정
        </Button>
      ),
    },
    {
      key: 'changeStatus',
      header: '상태 변경',
      render: (row) => (
        <Button variant="secondary" size="small" onClick={() => openStatusModal(row)}>
          변경
        </Button>
      ),
    },
    {
      key: 'delete',
      header: '삭제',
      render: (row) => (
        <Button variant="danger" size="small" onClick={() => setDeleteTargetId(row.id)}>
          삭제
        </Button>
      ),
    },
  ];

  const handleChange = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleCreate = async () => {
    if (!selectedParkingLotId || !form.areaNumber.trim()) {
      setToastMessage('주차 구역 정보를 모두 입력하세요.');
      return;
    }

    if (!isValidParkingRange(form)) {
      setToastMessage('차지할 행과 열은 1 이상의 숫자이며, 끝 값은 시작 값보다 크거나 같아야 합니다.');
      return;
    }

    const placement = buildParkingPlacementFromRange(form);

    if (isDuplicatePlacement(placement.layoutRow, placement.layoutColumn, placement.layoutWidth, placement.layoutHeight)) {
      setToastMessage('이미 사용 중인 배치 영역입니다.');
      return;
    }

    try {
      await createParkingArea({
        ...form,
        ...placement,
        areaNumber: form.areaNumber.trim(),
        location: form.areaNumber.trim(),
        parkingLotId: selectedParkingLotId,
        statusChangeReason: null,
      });
      setForm({
        areaNumber: '',
        status: 'empty',
        zoneType: 'normal',
        rowStart: '1',
        rowEnd: '1',
        columnStart: '1',
        columnEnd: '2',
      });
      setToastMessage('주차 구역이 등록되었습니다.');
    } catch (error) {
      setToastMessage('주차 구역 등록에 실패했습니다.');
    }
  };

  const isDuplicatePlacement = (layoutRow, layoutColumn, layoutWidth, layoutHeight, currentAreaId) =>
    visibleAreas.some((area) => {
      if (area.id === currentAreaId) {
        return false;
      }

      const rowStart = Number(layoutRow);
      const rowEnd = rowStart + Number(layoutHeight || 1) - 1;
      const columnStart = Number(layoutColumn);
      const columnEnd = columnStart + Number(layoutWidth || 2) - 1;
      const areaRowStart = Number(area.layoutRow);
      const areaRowEnd = areaRowStart + Number(area.layoutHeight || 1) - 1;
      const areaColumnStart = Number(area.layoutColumn);
      const areaColumnEnd = areaColumnStart + Number(area.layoutWidth || 2) - 1;

      const rowOverlaps = rowStart <= areaRowEnd && rowEnd >= areaRowStart;
      const columnOverlaps = columnStart <= areaColumnEnd && columnEnd >= areaColumnStart;
      return rowOverlaps && columnOverlaps;
    });

  const openStatusModal = (parkingArea) => {
    setStatusTarget(parkingArea);
    setStatusForm({
      status: parkingArea.status,
      zoneType: parkingArea.zoneType || 'normal',
      reason: parkingArea.statusChangeReason || '',
    });
    setStatusError('');
  };

  const closeStatusModal = () => {
    setStatusTarget(null);
    setStatusForm({ status: 'empty', zoneType: 'normal', reason: '' });
    setStatusError('');
  };

  const handleStatusFormChange = (field, value) => {
    setStatusForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    if (statusError) {
      setStatusError('');
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusForm.reason.trim()) {
      setStatusError('상태 변경 사유를 입력하세요.');
      return;
    }

    try {
      await updateParkingAreaStatus(
        statusTarget.id,
        statusForm.status,
        statusForm.reason.trim(),
        statusForm.zoneType,
      );
      closeStatusModal();
      setToastMessage('주차 구역 상태가 변경되었습니다.');
    } catch (error) {
      setToastMessage('주차 구역 상태 변경에 실패했습니다.');
    }
  };

  const openLayoutModal = (parkingArea) => {
    setLayoutTarget(parkingArea);
    setLayoutForm(getParkingRangeFromPlacement(parkingArea));
    setLayoutError('');
  };

  const closeLayoutModal = () => {
    setLayoutTarget(null);
    setLayoutForm({
      rowStart: '1',
      rowEnd: '1',
      columnStart: '1',
      columnEnd: '2',
    });
    setLayoutError('');
  };

  const handleLayoutFormChange = (field, value) => {
    setLayoutForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    if (layoutError) {
      setLayoutError('');
    }
  };

  const handleUpdateLayout = async () => {
    if (!isValidParkingRange(layoutForm)) {
      setLayoutError('차지할 행과 열은 1 이상의 숫자이며, 끝 값은 시작 값보다 크거나 같아야 합니다.');
      return;
    }

    const placement = buildParkingPlacementFromRange(layoutForm);

    if (
      isDuplicatePlacement(
        placement.layoutRow,
        placement.layoutColumn,
        placement.layoutWidth,
        placement.layoutHeight,
        layoutTarget.id,
      )
    ) {
      setLayoutError('이미 사용 중인 배치 영역입니다.');
      return;
    }

    try {
      await updateParkingAreaLayout(
        layoutTarget.id,
        placement.layoutRow,
        placement.layoutColumn,
        placement.layoutWidth,
        placement.layoutHeight,
      );
      closeLayoutModal();
      setToastMessage('주차 구역 배치가 수정되었습니다.');
    } catch (error) {
      setToastMessage('주차 구역 배치 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteParkingArea(deleteTargetId);
      setDeleteTargetId('');
      setToastMessage('주차 구역이 삭제되었습니다.');
    } catch (error) {
      setToastMessage('주차 구역 삭제에 실패했습니다.');
    }
  };

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="주차 구역 관리"
        description="주차장 선택 후 층별 구역을 등록, 삭제할 수 있습니다."
      />

      <SectionCard title="주차장별 주차 구역 관리" description="주차 구역을 등록하고 상태, 배치, 삭제를 관리합니다.">
        {isParkingLoading ? (
          <LoadingState message="주차 구역 목록 불러오는 중" />
        ) : parkingError ? (
          <>
            <EmptyState title="주차 구역 조회 실패" description={parkingError} />
            <div className="detail-actions">
              <Button variant="secondary" onClick={refreshParkingData}>
                다시 불러오기
              </Button>
            </div>
          </>
        ) : parkingLots.length === 0 ? (
          <EmptyState title="등록된 주차장이 없습니다." description="주차장 정보 관리에서 주차장을 먼저 등록하세요." />
        ) : (
          <>
            <div className="filter-row parking-area-filter-row">
              <label>
                주차장 선택
                <SelectBox value={selectedParkingLotId} onChange={(event) => setSelectedParkingLotId(event.target.value)}>
                  {parkingLots.map((parkingLot) => (
                    <option value={parkingLot.id} key={parkingLot.id}>
                      {parkingLot.name} {parkingLot.floor}
                    </option>
                  ))}
                </SelectBox>
              </label>
            </div>

            <div className="inline-form-grid parking-area-form-grid">
              <FormField label="구역 번호">
                <TextInput value={form.areaNumber} onChange={(event) => handleChange('areaNumber', event.target.value)} />
              </FormField>
              <FormField label="상태">
                <SelectBox value={form.status} onChange={(event) => handleChange('status', event.target.value)}>
                  <option value="empty">빈자리</option>
                  <option value="occupied">주차됨</option>
                  <option value="disabled">사용 불가</option>
                </SelectBox>
              </FormField>
              <FormField label="구역 종류">
                <SelectBox value={form.zoneType} onChange={(event) => handleChange('zoneType', event.target.value)}>
                  <option value="normal">일반 주차칸</option>
                  <option value="double_lane">통로 주차칸</option>
                </SelectBox>
              </FormField>
              <FormField label="차지할 행">
                <div className="range-input-group">
                  <TextInput
                    aria-label="차지할 시작 행"
                    inputMode="numeric"
                    value={form.rowStart}
                    onChange={(event) => handleChange('rowStart', event.target.value)}
                  />
                  <span>~</span>
                  <TextInput
                    aria-label="차지할 끝 행"
                    inputMode="numeric"
                    value={form.rowEnd}
                    onChange={(event) => handleChange('rowEnd', event.target.value)}
                  />
                </div>
              </FormField>
              <FormField label="차지할 열">
                <div className="range-input-group">
                  <TextInput
                    aria-label="차지할 시작 열"
                    inputMode="numeric"
                    value={form.columnStart}
                    onChange={(event) => handleChange('columnStart', event.target.value)}
                  />
                  <span>~</span>
                  <TextInput
                    aria-label="차지할 끝 열"
                    inputMode="numeric"
                    value={form.columnEnd}
                    onChange={(event) => handleChange('columnEnd', event.target.value)}
                  />
                </div>
              </FormField>
              <Button onClick={handleCreate}>구역 등록</Button>
            </div>

            <DataTable
              columns={tableColumns}
              rows={pagedRows}
              startIndex={startIndex}
              emptyMessage="등록된 주차 구역이 없습니다."
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>

      <ConfirmModal
        open={Boolean(deleteTargetId)}
        title="정말 삭제하시겠습니까?"
        description="삭제된 주차 구역은 복구할 수 없습니다."
        confirmLabel="삭제"
        danger
        onClose={() => setDeleteTargetId('')}
        onConfirm={handleDelete}
      />
      {layoutTarget && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="parking-area-layout-title">
            <h2 id="parking-area-layout-title">주차 구역 배치 수정</h2>
            <p>{layoutTarget.areaNumber} 구역이 실제 주차장 어느 위치에 보일지 설정합니다.</p>

            <div className="form-grid">
              <FormField label="차지할 행" error={layoutError}>
                <div className="range-input-group">
                  <TextInput
                    aria-label="차지할 시작 행"
                    error={Boolean(layoutError)}
                    inputMode="numeric"
                    value={layoutForm.rowStart}
                    onChange={(event) => handleLayoutFormChange('rowStart', event.target.value)}
                  />
                  <span>~</span>
                  <TextInput
                    aria-label="차지할 끝 행"
                    error={Boolean(layoutError)}
                    inputMode="numeric"
                    value={layoutForm.rowEnd}
                    onChange={(event) => handleLayoutFormChange('rowEnd', event.target.value)}
                  />
                </div>
              </FormField>
              <FormField label="차지할 열" error={layoutError}>
                <div className="range-input-group">
                  <TextInput
                    aria-label="차지할 시작 열"
                    error={Boolean(layoutError)}
                    inputMode="numeric"
                    value={layoutForm.columnStart}
                    onChange={(event) => handleLayoutFormChange('columnStart', event.target.value)}
                  />
                  <span>~</span>
                  <TextInput
                    aria-label="차지할 끝 열"
                    error={Boolean(layoutError)}
                    inputMode="numeric"
                    value={layoutForm.columnEnd}
                    onChange={(event) => handleLayoutFormChange('columnEnd', event.target.value)}
                  />
                </div>
              </FormField>
            </div>

            {layoutError && <p className="form-error">{layoutError}</p>}

            <div className="modal-actions">
              <Button variant="secondary" onClick={closeLayoutModal}>
                취소
              </Button>
              <Button onClick={handleUpdateLayout}>저장</Button>
            </div>
          </section>
        </div>
      )}
      {statusTarget && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="parking-area-status-title">
            <h2 id="parking-area-status-title">주차 구역 상태 변경</h2>
            <p>
              {statusTarget.areaNumber} 구역의 상태를 변경하고 사유를 저장합니다.
            </p>

            <div className="form-grid">
              <FormField label="변경 상태">
                <SelectBox
                  value={statusForm.status}
                  onChange={(event) => handleStatusFormChange('status', event.target.value)}
                >
                  <option value="empty">빈자리</option>
                  <option value="occupied">주차됨</option>
                  <option value="disabled">사용 불가</option>
                </SelectBox>
              </FormField>
              <FormField label="구역 종류">
                <SelectBox
                  value={statusForm.zoneType}
                  onChange={(event) => handleStatusFormChange('zoneType', event.target.value)}
                >
                  <option value="normal">일반 주차칸</option>
                  <option value="double_lane">통로 주차칸</option>
                </SelectBox>
              </FormField>
            </div>

            <FormField label="변경 사유" error={statusError}>
              <TextArea
                error={Boolean(statusError)}
                placeholder="예: 시설 점검으로 사용 불가 처리"
                value={statusForm.reason}
                onChange={(event) => handleStatusFormChange('reason', event.target.value)}
              />
            </FormField>

            <div className="modal-actions">
              <Button variant="secondary" onClick={closeStatusModal}>
                취소
              </Button>
              <Button onClick={handleUpdateStatus}>저장</Button>
            </div>
          </section>
        </div>
      )}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
