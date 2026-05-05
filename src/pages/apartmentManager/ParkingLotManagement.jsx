import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import ConfirmModal from '../../components/feedback/ConfirmModal.jsx';
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
  const { parkingLots, createParkingLot, deleteParkingLot } = useApartmentManager();
  const [form, setForm] = useState({ name: '', floor: '', totalSpaces: '', usedSpaces: '' });
  const [deleteTargetId, setDeleteTargetId] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const totalSpaces = parkingLots.reduce((sum, parkingLot) => sum + parkingLot.totalSpaces, 0);
  const usedSpaces = parkingLots.reduce((sum, parkingLot) => sum + parkingLot.usedSpaces, 0);
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

    createParkingLot(form);
    setForm({ name: '', floor: '', totalSpaces: '', usedSpaces: '' });
    setToastMessage('주차장이 등록되었습니다.');
  };

  const handleDelete = () => {
    deleteParkingLot(deleteTargetId);
    setDeleteTargetId('');
    setToastMessage('주차장이 삭제되었습니다.');
  };

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="한빛아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="주차장 정보 관리"
        description="주차장 등록 후 각 주차장별 주차면을 관리할 수 있습니다."
      />

      <div className="metric-grid">
        <MetricCard label="전체 주차장" value={`${parkingLots.length}곳`} helper="등록된 주차장 수" />
        <MetricCard label="전체 주차면" value={`${totalSpaces}면`} helper="전체 운영 주차면" />
        <MetricCard label="사용 가능" value={`${totalSpaces - usedSpaces}면`} helper="현재 여유 주차면" />
      </div>

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
        <DataTable columns={tableColumns} rows={parkingLots} />
        <Pagination currentPage={1} totalPages={2} />
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
