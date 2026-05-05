import { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SelectBox from '../../components/forms/SelectBox.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';

const statusClassMap = {
  empty: 'empty',
  occupied: 'used',
  disabled: 'disabled',
};

export default function ParkingStatusGrid() {
  const { parkingLots, parkingAreas } = useApartmentManager();
  const [selectedParkingLotId, setSelectedParkingLotId] = useState(parkingLots[0]?.id || '');
  const selectedParkingLot = parkingLots.find((parkingLot) => parkingLot.id === selectedParkingLotId);
  const visibleAreas = parkingAreas.filter((parkingArea) => parkingArea.parkingLotId === selectedParkingLotId);
  const occupiedCount = visibleAreas.filter((parkingArea) => parkingArea.status === 'occupied').length;
  const emptyCount = visibleAreas.filter((parkingArea) => parkingArea.status === 'empty').length;
  const disabledCount = visibleAreas.filter((parkingArea) => parkingArea.status === 'disabled').length;

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="한빛아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="주차 상태 모니터링"
        description="주차장과 층을 선택해 현재 주차면 상태를 확인합니다."
      />

      <div className="metric-grid">
        <MetricCard label="전체 주차면" value={`${visibleAreas.length}면`} helper={`${selectedParkingLot?.name || ''} ${selectedParkingLot?.floor || ''}`} />
        <MetricCard label="사용 중" value={`${occupiedCount}면`} helper="실시간 입차 기준" />
        <MetricCard label="빈자리" value={`${emptyCount}면`} helper={`사용 불가 ${disabledCount}면`} />
      </div>

      <SectionCard title={`${selectedParkingLot?.name || '주차장'} ${selectedParkingLot?.floor || ''} 주차면`}>
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
        <div className="parking-grid">
          {visibleAreas.map((area) => (
            <div key={area.id} className={`parking-spot ${statusClassMap[area.status]}`}>
              {area.areaNumber}
            </div>
          ))}
        </div>
      </SectionCard>
    </AdminLayout>
  );
}
