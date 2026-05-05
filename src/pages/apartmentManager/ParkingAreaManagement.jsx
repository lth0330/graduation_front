import { useState } from 'react';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import ConfirmModal from '../../components/feedback/ConfirmModal.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SelectBox from '../../components/forms/SelectBox.jsx';
import FormField from '../../components/forms/FormField.jsx';
import TextInput from '../../components/forms/TextInput.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';

const areaStatusLabel = {
  empty: '빈자리',
  occupied: '주차됨',
  disabled: '사용 불가',
};

const areaStatusBadge = {
  empty: 'active',
  occupied: 'pending',
  disabled: 'rejected',
};

const columns = [
  { key: 'id', header: '구역 ID' },
  { key: 'areaNumber', header: '구역 번호' },
  { key: 'location', header: '위치' },
  {
    key: 'status',
    header: '상태',
    render: (row) => <Badge status={areaStatusBadge[row.status]}>{areaStatusLabel[row.status]}</Badge>,
  },
];

export default function ParkingAreaManagement() {
  const { parkingLots, parkingAreas, createParkingArea, deleteParkingArea } = useApartmentManager();
  const [selectedParkingLotId, setSelectedParkingLotId] = useState(parkingLots[0]?.id || '');
  const [form, setForm] = useState({ areaNumber: '', location: '', status: 'empty' });
  const [deleteTargetId, setDeleteTargetId] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const selectedParkingLot = parkingLots.find((parkingLot) => parkingLot.id === selectedParkingLotId);
  const visibleAreas = parkingAreas.filter((parkingArea) => parkingArea.parkingLotId === selectedParkingLot?.id);
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

  const handleCreate = () => {
    if (!selectedParkingLotId || !form.areaNumber.trim() || !form.location.trim()) {
      setToastMessage('주차 구역 정보를 모두 입력하세요.');
      return;
    }

    createParkingArea({
      ...form,
      areaNumber: form.areaNumber.trim(),
      location: form.location.trim(),
      parkingLotId: selectedParkingLotId,
    });
    setForm({ areaNumber: '', location: '', status: 'empty' });
    setToastMessage('주차 구역이 등록되었습니다.');
  };

  const handleDelete = () => {
    deleteParkingArea(deleteTargetId);
    setDeleteTargetId('');
    setToastMessage('주차 구역이 삭제되었습니다.');
  };

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="한빛아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="주차 구역 관리"
        description="주차장 선택 후 층별 구역을 등록, 삭제할 수 있습니다."
      />

      <SectionCard title="주차장별 주차 구역 관리" description="등록과 삭제는 다음 단계에서 연결합니다.">
        <div className="filter-row">
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

        <div className="inline-form-grid">
          <FormField label="구역 번호">
            <TextInput value={form.areaNumber} onChange={(event) => handleChange('areaNumber', event.target.value)} />
          </FormField>
          <FormField label="위치">
            <TextInput value={form.location} onChange={(event) => handleChange('location', event.target.value)} />
          </FormField>
          <FormField label="상태">
            <SelectBox value={form.status} onChange={(event) => handleChange('status', event.target.value)}>
              <option value="empty">빈자리</option>
              <option value="occupied">주차됨</option>
              <option value="disabled">사용 불가</option>
            </SelectBox>
          </FormField>
          <Button onClick={handleCreate}>구역 등록</Button>
        </div>

        <DataTable columns={tableColumns} rows={visibleAreas} emptyMessage="등록된 주차 구역이 없습니다." />
        <Pagination currentPage={1} totalPages={2} />
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
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
