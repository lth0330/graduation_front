import { useEffect, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SelectBox from '../../components/forms/SelectBox.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import useAutoRefresh from '../../hooks/useAutoRefresh.js';
import { getUploadedFileUrl } from '../../utils/fileUrl.js';
import {
  isParkingImageInspectableArea,
  getParkingPlacement,
  getParkingSpotDisplayText,
} from '../../utils/parkingLayout.js';

const statusClassMap = {
  empty: 'empty',
  occupied: 'used',
  disabled: 'disabled',
  error: 'error',
  unknown: 'error',
};

const issueNotificationTypes = ['ocr_error', 'gate_alert', 'abnormal_parking'];

function findAreaIssueNotification(area, notifications) {
  const areaNumber = String(area.areaNumber || '').trim();

  if (!areaNumber) {
    return null;
  }

  return notifications.find((notification) => {
    if (!issueNotificationTypes.includes(notification.notificationType)) {
      return false;
    }

    const historyZone = String(notification.parkingHistory?.zone || '').trim();
    const searchableText = [
      notification.title,
      notification.message,
      notification.referenceType,
    ]
      .filter(Boolean)
      .join(' ');

    return historyZone === areaNumber || searchableText.includes(areaNumber);
  }) || null;
}

function mergeAreaWithNotificationDetail(area, notificationDetail) {
  const parkingHistory = notificationDetail?.parkingHistory;

  return {
    ...area,
    relatedNotificationNo: notificationDetail?.notificationNo || area.relatedNotificationNo,
    errorImage: area.errorImage || parkingHistory?.imagePath || '',
    errorMessage: notificationDetail?.message || area.errorMessage,
    errorPlate: parkingHistory?.plate || area.currentCarNumber,
    errorEntryTime: parkingHistory?.entryTime || '',
  };
}

export default function ParkingStatusGrid() {
  const {
    parkingLots,
    parkingAreas,
    refreshParkingData,
    managerNotifications,
    getManagerNotificationDetail,
  } = useApartmentManager();
  const [selectedParkingLotId, setSelectedParkingLotId] = useState(parkingLots[0]?.id || '');
  const [selectedErrorArea, setSelectedErrorArea] = useState(null);
  const [isErrorImageLoading, setIsErrorImageLoading] = useState(false);
  const [errorImageError, setErrorImageError] = useState('');

  useAutoRefresh(() => refreshParkingData({ silent: true }), 5000);

  useEffect(() => {
    if (parkingLots.length > 0 && !parkingLots.some((parkingLot) => parkingLot.id === selectedParkingLotId)) {
      setSelectedParkingLotId(parkingLots[0].id);
    }
  }, [parkingLots, selectedParkingLotId]);

  const selectedParkingLot = parkingLots.find((parkingLot) => parkingLot.id === selectedParkingLotId);
  const visibleAreas = parkingAreas
    .filter((parkingArea) => parkingArea.parkingLotId === selectedParkingLotId)
    .map((parkingArea, index) => ({
      ...parkingArea,
      ...getParkingPlacement(parkingArea, index),
    }));
  const occupiedCount = visibleAreas.filter((parkingArea) => parkingArea.status === 'occupied').length;
  const emptyCount = visibleAreas.filter((parkingArea) => parkingArea.status === 'empty').length;
  const disabledCount = visibleAreas.filter((parkingArea) => parkingArea.status === 'disabled').length;
  const inspectableCount = visibleAreas.filter((parkingArea) =>
    isParkingImageInspectableArea(parkingArea),
  ).length;
  const selectedErrorImageUrl = getUploadedFileUrl(selectedErrorArea?.errorImage);
  const selectedErrorImagePath = String(selectedErrorArea?.errorImage || '').trim();

  const handleInspectArea = async (area) => {
    const matchedNotification = findAreaIssueNotification(area, managerNotifications);

    setSelectedErrorArea({
      ...area,
      relatedNotificationNo: matchedNotification?.notificationNo,
      errorMessage: matchedNotification?.message || area.errorMessage,
    });
    setErrorImageError('');

    if (area.errorImage || !matchedNotification?.notificationNo) {
      return;
    }

    try {
      setIsErrorImageLoading(true);
      const notificationDetail = await getManagerNotificationDetail(matchedNotification.notificationNo);
      setSelectedErrorArea((currentArea) => {
        if (!currentArea || currentArea.id !== area.id) {
          return currentArea;
        }

        return mergeAreaWithNotificationDetail(currentArea, notificationDetail);
      });
    } catch (error) {
      setErrorImageError('확인 이미지를 불러오지 못했습니다. 관리자 알림 상세 조회를 확인하세요.');
    } finally {
      setIsErrorImageLoading(false);
    }
  };

  const renderParkingSpot = (area) => {
    const isImageInspectable = isParkingImageInspectableArea(area);
    const statusClass = isImageInspectable ? 'error' : statusClassMap[area.status] || 'empty';
    const commonProps = {
      className: `parking-spot ${statusClass} ${isImageInspectable ? 'is-clickable' : ''}`,
      style: {
        gridColumn: `${area.layoutColumn} / span ${area.layoutWidth}`,
        gridRow: `${area.layoutRow} / span ${area.layoutHeight}`,
      },
      title: `${area.areaNumber}: ${area.layoutRow}행 ${area.layoutColumn}열, ${area.layoutWidth}x${area.layoutHeight}${
        area.currentCarNumber ? `, ${area.currentCarNumber}` : ''
      }${isImageInspectable ? ', 이미지 확인 가능' : ''}`,
    };

    if (isImageInspectable) {
      return (
        <button
          key={area.id}
          type="button"
          {...commonProps}
          onClick={() => handleInspectArea(area)}
        >
          {getParkingSpotDisplayText(area)}
        </button>
      );
    }

    return (
      <div key={area.id} {...commonProps}>
        {getParkingSpotDisplayText(area)}
      </div>
    );
  };

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="주차 상태 모니터링"
        description="주차장과 층을 선택해 현재 주차면 상태를 확인합니다."
      />

      <div className="metric-grid">
        <MetricCard label="전체 주차면" value={`${visibleAreas.length}면`} helper={`${selectedParkingLot?.name || ''} ${selectedParkingLot?.floor || ''}`} />
        <MetricCard label="사용 중" value={`${occupiedCount}면`} helper="실시간 입차 기준" />
        <MetricCard label="빈자리" value={`${emptyCount}면`} helper={`사용 불가 ${disabledCount}면 / 확인 필요 ${inspectableCount}면`} />
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
          {visibleAreas.map(renderParkingSpot)}
        </div>
      </SectionCard>

      {selectedErrorArea && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-panel parking-error-modal" role="dialog" aria-modal="true" aria-labelledby="parking-error-title">
            <h2 id="parking-error-title">{selectedErrorArea.areaNumber} 확인 이미지</h2>
            <p>
              {selectedErrorArea.errorMessage ||
                '주차칸 상태를 확인해야 하는 시점의 이미지를 확인합니다.'}
            </p>

            {selectedErrorImageUrl ? (
              <img
                className="parking-error-image"
                src={selectedErrorImageUrl}
                alt={`${selectedErrorArea.areaNumber} 주차칸 확인 이미지`}
              />
            ) : isErrorImageLoading ? (
              <div className="parking-error-empty">확인 이미지를 불러오는 중입니다.</div>
            ) : (
              <div className="parking-error-empty">
                {errorImageError || '표시할 오류 이미지가 없습니다.'}
              </div>
            )}

            {selectedErrorArea.errorPlate && (
              <p className="parking-error-meta">
                차량번호: {selectedErrorArea.errorPlate}
                {selectedErrorArea.errorEntryTime ? ` / 입차 시각: ${selectedErrorArea.errorEntryTime}` : ''}
              </p>
            )}

            {!selectedErrorImageUrl && selectedErrorImagePath && (
              <p className="parking-error-meta">
                저장 경로: {selectedErrorImagePath}
              </p>
            )}

            <div className="modal-actions">
              {selectedErrorImageUrl && (
                <a className="text-link" href={selectedErrorImageUrl} target="_blank" rel="noreferrer">
                  새 탭에서 열기
                </a>
              )}
              <Button variant="secondary" onClick={() => setSelectedErrorArea(null)}>
                닫기
              </Button>
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
