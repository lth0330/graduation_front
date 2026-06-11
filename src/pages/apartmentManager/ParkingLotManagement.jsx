import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import ConfirmModal from '../../components/feedback/ConfirmModal.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import FormField from '../../components/forms/FormField.jsx';
import TextInput from '../../components/forms/TextInput.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import { calculateGateOccupancy } from '../../utils/gateOccupancy.js';
import { usePagination } from '../../utils/pagination.js';

const columns = [
  { key: 'id', header: '주차장 ID' },
  { key: 'name', header: '주차장 이름' },
  { key: 'floor', header: '층' },
  { key: 'totalSpaces', header: '총 주차면 수', render: (row) => `${row.totalSpaces}면` },
  { key: 'usedSpaces', header: '사용 중 주차면 수', render: (row) => `${row.usedSpaces}면` },
  {
    key: 'availableSpaces',
    header: '사용 가능',
    render: (row) => `${row.totalSpaces - row.usedSpaces}면`,
  },
];

export default function ParkingLotManagement() {
  const {
    parkingLots,
    parkingAreas,
    isParkingLoading,
    parkingError,
    refreshParkingData,
    gatePolicy,
    isGatePolicyLoading,
    gatePolicyError,
    refreshGatePolicy,
    updateGatePolicy,
    createParkingLot,
    deleteParkingLot,
  } = useApartmentManager();
  const [form, setForm] = useState({ name: '', floor: '', totalSpaces: '', usedSpaces: '' });
  const [deleteTargetId, setDeleteTargetId] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [savingPolicyField, setSavingPolicyField] = useState('');
  const { currentPage, setCurrentPage, totalPages, pagedRows, startIndex } = usePagination(parkingLots, 5);
  const { totalSpaces, availableSpaces, occupancyRateLabel } = calculateGateOccupancy(parkingAreas);
  const gateModeLabel = gatePolicy.gateForceOpenEnabled ? '상시개방 모드' : '번호판 자동제어';
  const gateModeDescription = gatePolicy.gateForceOpenEnabled
    ? '번호판과 주차장 점유율 조건을 보지 않고 차단기를 열린 상태로 유지합니다.'
    : 'Spring Boot의 번호판 확인 결과와 관리자 정책에 따라 차단기를 제어합니다.';
  const tableColumns = [
    ...columns,
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
    if (!form.name.trim() || !form.floor.trim() || !form.totalSpaces || !form.usedSpaces) {
      setToastMessage('주차장 정보를 모두 입력하세요.');
      return;
    }

    if (Number(form.totalSpaces) <= 0) {
      setToastMessage('총 주차면 수는 1 이상이어야 합니다.');
      return;
    }

    if (Number(form.usedSpaces) > Number(form.totalSpaces)) {
      setToastMessage('사용 중 주차면 수는 총 주차면 수보다 클 수 없습니다.');
      return;
    }

    try {
      await createParkingLot(form);
      setForm({ name: '', floor: '', totalSpaces: '', usedSpaces: '' });
      setToastMessage('주차장이 등록되었습니다.');
    } catch (error) {
      setToastMessage('주차장 등록에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteParkingLot(deleteTargetId);
      setDeleteTargetId('');
      setToastMessage('주차장이 삭제되었습니다.');
    } catch (error) {
      setToastMessage('주차장 삭제에 실패했습니다.');
    }
  };

  const handlePolicyChange = async (field, value) => {
    if (savingPolicyField) {
      return;
    }

    try {
      setSavingPolicyField(field);
      await updateGatePolicy({
        ...gatePolicy,
        [field]: value,
      });
      setToastMessage('차단기 설정이 저장되었습니다.');
    } catch (error) {
      setToastMessage('차단기 설정 저장에 실패했습니다.');
    } finally {
      setSavingPolicyField('');
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
        title="주차장 정보 관리"
        description="주차장 등록 후 각 주차장별 주차면을 관리할 수 있습니다."
      />

      <div className="metric-grid">
        <MetricCard label="전체 주차장" value={`${parkingLots.length}곳`} helper="등록된 주차장 수" />
        <MetricCard label="일반 주차면" value={`${totalSpaces}면`} helper="차단기 혼잡도 계산 대상" />
        <MetricCard label="사용 가능" value={`${availableSpaces}면`} helper="통로 주차칸 제외 여유 면수" />
      </div>

      <SectionCard title="차단기 운행 설정" description="방문차량 입차 제한과 상시개방 모드를 관리합니다.">
        {isGatePolicyLoading ? (
          <LoadingState message="차단기 설정 불러오는 중" />
        ) : gatePolicyError ? (
          <>
            <EmptyState title="설정 조회 실패" description={gatePolicyError} />
            <div className="detail-actions">
              <Button variant="secondary" onClick={refreshGatePolicy}>
                다시 불러오기
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={`gate-policy-summary ${gatePolicy.gateForceOpenEnabled ? 'is-force-open' : ''}`}>
              <div>
                <span className="policy-eyebrow">현재 차단기 모드</span>
                <strong>{gateModeLabel}</strong>
                <p>{gateModeDescription}</p>
              </div>
              <div className="gate-policy-metrics" aria-label="현재 주차장 사용률">
                <span>사용률 {occupancyRateLabel}</span>
                <span>여유 {availableSpaces}면</span>
              </div>
            </div>

            <div className="policy-grid">
              <div className={`policy-item ${gatePolicy.gateOccupancyBlockEnabled ? 'is-on' : 'is-off'}`}>
                <div>
                  <div className="policy-title-row">
                    <span className="policy-dot" aria-hidden="true" />
                    <strong>방문차량 혼잡도 차단</strong>
                  </div>
                  <p className="section-help">
                    {gatePolicy.gateOccupancyBlockEnabled
                      ? '주차장 80% 이상 또는 만차 시 방문차량을 차단합니다.'
                      : '방문차량도 번호판 등록 여부만 확인합니다.'}
                  </p>
                </div>
                <button
                  className={`policy-switch ${gatePolicy.gateOccupancyBlockEnabled ? 'is-on' : 'is-off'}`}
                  type="button"
                  aria-pressed={gatePolicy.gateOccupancyBlockEnabled}
                  disabled={Boolean(savingPolicyField)}
                  onClick={() =>
                    handlePolicyChange('gateOccupancyBlockEnabled', !gatePolicy.gateOccupancyBlockEnabled)
                  }
                >
                  <span className="policy-switch-track" aria-hidden="true">
                    <span className="policy-switch-thumb" />
                  </span>
                  <span>{savingPolicyField === 'gateOccupancyBlockEnabled' ? '저장 중' : gatePolicy.gateOccupancyBlockEnabled ? '켜짐' : '꺼짐'}</span>
                </button>
              </div>
              <div className={`policy-item ${gatePolicy.gateForceOpenEnabled ? 'is-force-open' : 'is-off'}`}>
                <div>
                  <div className="policy-title-row">
                    <span className="policy-dot" aria-hidden="true" />
                    <strong>차단기 상시 개방</strong>
                  </div>
                  <p className="section-help">
                    {gatePolicy.gateForceOpenEnabled
                      ? '장비가 상시개방 모드로 차단기를 열린 상태로 유지합니다.'
                      : '번호판 확인 결과에 따라 차단기를 제어합니다.'}
                  </p>
                </div>
                <button
                  className={`policy-switch ${gatePolicy.gateForceOpenEnabled ? 'is-danger' : 'is-off'}`}
                  type="button"
                  aria-pressed={gatePolicy.gateForceOpenEnabled}
                  disabled={Boolean(savingPolicyField)}
                  onClick={() => handlePolicyChange('gateForceOpenEnabled', !gatePolicy.gateForceOpenEnabled)}
                >
                  <span className="policy-switch-track" aria-hidden="true">
                    <span className="policy-switch-thumb" />
                  </span>
                  <span>{savingPolicyField === 'gateForceOpenEnabled' ? '저장 중' : gatePolicy.gateForceOpenEnabled ? '켜짐' : '꺼짐'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title="주차장 목록" description="주차장 등록과 삭제를 처리합니다.">
        <div className="inline-form-grid">
          <FormField label="주차장 이름">
            <TextInput value={form.name} onChange={(event) => handleChange('name', event.target.value)} />
          </FormField>
          <FormField label="층">
            <TextInput value={form.floor} onChange={(event) => handleChange('floor', event.target.value)} />
          </FormField>
          <FormField label="총 주차면 수">
            <TextInput type="number" value={form.totalSpaces} onChange={(event) => handleChange('totalSpaces', event.target.value)} />
          </FormField>
          <FormField label="사용 중">
            <TextInput type="number" value={form.usedSpaces} onChange={(event) => handleChange('usedSpaces', event.target.value)} />
          </FormField>
          <Button onClick={handleCreate}>주차장 등록</Button>
        </div>
        <p className="section-help">주차장을 삭제하면 연결된 주차 구역도 함께 삭제됩니다.</p>
        {isParkingLoading ? (
          <LoadingState message="주차장 목록 불러오는 중" />
        ) : parkingError ? (
          <>
            <EmptyState title="주차장 조회 실패" description={parkingError} />
            <div className="detail-actions">
              <Button variant="secondary" onClick={refreshParkingData}>
                다시 불러오기
              </Button>
            </div>
          </>
        ) : (
          <>
            <DataTable columns={tableColumns} rows={pagedRows} startIndex={startIndex} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>

      <ConfirmModal
        open={Boolean(deleteTargetId)}
        title="정말 삭제하시겠습니까?"
        description="삭제된 주차장과 연결된 주차 구역은 복구할 수 없습니다."
        confirmLabel="삭제"
        danger
        onClose={() => setDeleteTargetId('')}
        onConfirm={handleDelete}
      />
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
