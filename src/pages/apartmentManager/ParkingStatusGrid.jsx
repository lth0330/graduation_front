import { useEffect, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import FormField from '../../components/forms/FormField.jsx';
import TextArea from '../../components/forms/TextArea.jsx';
import TextInput from '../../components/forms/TextInput.jsx';
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
import {
  findAreaIssueNotification,
  mergeAreaWithNotificationDetail,
} from '../../utils/parkingIssueImage.js';
import {
  buildParkingOwnerNotificationForm,
  canNotifyParkingAreaOwner,
} from '../../utils/parkingOwnerNotification.js';
import { findVehicleOwnerFromLists } from '../../utils/vehicleOwnerLookup.js';

const statusClassMap = {
  empty: 'empty',
  occupied: 'used',
  disabled: 'disabled',
  error: 'error',
  unknown: 'error',
};

export default function ParkingStatusGrid() {
  const {
    parkingLots,
    parkingAreas,
    isParkingLoading,
    refreshParkingData,
    managerNotifications,
    refreshManagerNotifications,
    getManagerNotificationDetail,
    getVehicleOwnerByCarNumber,
    sendResidentNotification,
    vehicles,
    visitorCars,
    residents,
  } = useApartmentManager();
  const [selectedParkingLotId, setSelectedParkingLotId] = useState(parkingLots[0]?.id || '');
  const [selectedErrorArea, setSelectedErrorArea] = useState(null);
  const [isErrorImageLoading, setIsErrorImageLoading] = useState(false);
  const [errorImageError, setErrorImageError] = useState('');
  const [ownerLookupAreaId, setOwnerLookupAreaId] = useState('');
  const [contactTargetArea, setContactTargetArea] = useState(null);
  const [contactOwner, setContactOwner] = useState(null);
  const [contactForm, setContactForm] = useState({ title: '', message: '' });
  const [contactError, setContactError] = useState('');
  const [isContactSending, setIsContactSending] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

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
  const hasSelectedErrorImage = Boolean(selectedErrorImageUrl) && !errorImageError;

  useEffect(() => {
    if (!selectedErrorArea?.id) {
      return;
    }

    const latestArea = parkingAreas.find((parkingArea) => parkingArea.id === selectedErrorArea.id);
    if (!latestArea || !isParkingImageInspectableArea(latestArea)) {
      setSelectedErrorArea(null);
      setErrorImageError('');
      return;
    }

    setSelectedErrorArea((currentArea) => {
      if (!currentArea || currentArea.id !== latestArea.id) {
        return currentArea;
      }

      const nextArea = {
        ...currentArea,
        ...latestArea,
        relatedNotificationNo: currentArea.relatedNotificationNo,
        errorImage: latestArea.errorImage || currentArea.errorImage,
        errorMessage: latestArea.errorMessage || currentArea.errorMessage,
        errorPlate: latestArea.currentCarNumber || currentArea.errorPlate,
        errorEntryTime: currentArea.errorEntryTime,
      };

      if (
        nextArea.status === currentArea.status &&
        nextArea.currentCarNumber === currentArea.currentCarNumber &&
        nextArea.errorImage === currentArea.errorImage &&
        nextArea.errorMessage === currentArea.errorMessage
      ) {
        return currentArea;
      }

      return nextArea;
    });

    if (latestArea.errorImage && latestArea.errorImage !== selectedErrorArea.errorImage) {
      setErrorImageError('');
    }
  }, [parkingAreas, selectedErrorArea?.id, selectedErrorArea?.errorImage]);

  const handleManualRefresh = async () => {
    await Promise.all([
      refreshParkingData(),
      refreshManagerNotifications({ silent: true }),
    ]);
  };

  const handleInspectArea = async (area) => {
    const matchedNotification = findAreaIssueNotification(area, managerNotifications);

    setSelectedErrorArea({
      ...area,
      relatedNotificationNo: matchedNotification?.notificationNo,
      errorMessage: area.errorMessage,
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

  const openOwnerContactModal = async (area) => {
    try {
      setOwnerLookupAreaId(area.id);
      let owner = null;
      try {
        owner = await getVehicleOwnerByCarNumber(area.currentCarNumber);
      } catch (error) {
        owner = findVehicleOwnerFromLists(area.currentCarNumber, {
          vehicles,
          visitorCars,
          residents,
        });
      }

      if (!owner?.residentNo) {
        throw new Error('owner_not_found');
      }

      setContactTargetArea(area);
      setContactOwner(owner);
      setContactForm(buildParkingOwnerNotificationForm(area, owner));
      setContactError('');
    } catch (error) {
      setToastType('error');
      setToastMessage(`${area.currentCarNumber} 차량과 연결된 주민을 찾지 못했습니다. 차량 관리 또는 방문차량 목록을 확인하세요.`);
    } finally {
      setOwnerLookupAreaId('');
    }
  };

  const closeOwnerContactModal = () => {
    if (isContactSending) {
      return;
    }

    setContactTargetArea(null);
    setContactOwner(null);
    setContactError('');
  };

  const handleContactFormChange = (field, value) => {
    setContactForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const submitOwnerContactNotification = async (event) => {
    event.preventDefault();

    const title = contactForm.title.trim();
    const message = contactForm.message.trim();
    if (!title || !message) {
      setContactError('제목과 내용을 모두 입력하세요.');
      return;
    }

    try {
      setIsContactSending(true);
      setContactError('');
      await sendResidentNotification(contactOwner.residentNo, {
        title,
        message,
        type: 'manager_contact',
      });
      setToastType('success');
      setToastMessage(`${contactOwner.name} 주민에게 차량 이동 알림을 보냈습니다.`);
      setContactTargetArea(null);
      setContactOwner(null);
    } catch (error) {
      setToastType('error');
      setToastMessage('차주 알림 발송에 실패했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setIsContactSending(false);
    }
  };

  const renderParkingSpot = (area) => {
    const isImageInspectable = isParkingImageInspectableArea(area);
    const canNotifyOwner = canNotifyParkingAreaOwner(area);
    const statusClass = isImageInspectable ? 'error' : statusClassMap[area.status] || 'empty';
    const commonProps = {
      className: `parking-spot ${statusClass}`,
      style: {
        gridColumn: `${area.layoutColumn} / span ${area.layoutWidth}`,
        gridRow: `${area.layoutRow} / span ${area.layoutHeight}`,
      },
      title: `${area.areaNumber}: ${area.layoutRow}행 ${area.layoutColumn}열, ${area.layoutWidth}x${area.layoutHeight}${
        area.currentCarNumber ? `, ${area.currentCarNumber}` : ''
      }${isImageInspectable ? ', 이미지 확인 가능' : ''}${canNotifyOwner ? ', 차주 알림 가능' : ''}`,
    };

    return (
      <div key={area.id} {...commonProps}>
        <span className="parking-spot-label">{getParkingSpotDisplayText(area)}</span>
        {(isImageInspectable || canNotifyOwner) && (
          <span className="parking-spot-actions">
            {isImageInspectable && (
              <button
                className="parking-spot-action"
                type="button"
                onClick={() => handleInspectArea(area)}
              >
                이미지
              </button>
            )}
            {canNotifyOwner && (
              <button
                className="parking-spot-action"
                type="button"
                disabled={ownerLookupAreaId === area.id}
                onClick={() => openOwnerContactModal(area)}
              >
                {ownerLookupAreaId === area.id ? '조회' : '알림'}
              </button>
            )}
          </span>
        )}
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
          <div className="parking-refresh-control">
            <span>5초마다 자동 갱신</span>
            <Button
              className="parking-refresh-button"
              variant="secondary"
              size="small"
              onClick={handleManualRefresh}
              disabled={isParkingLoading}
              aria-label="주차 상태 수동 새로고침"
            >
              <span className={isParkingLoading ? 'refresh-symbol is-spinning' : 'refresh-symbol'} aria-hidden="true">
                ↻
              </span>
              {isParkingLoading ? '갱신 중' : '새로고침'}
            </Button>
          </div>
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
                '주차칸 상태 확인 이미지와 연결된 주차 이력을 조회합니다.'}
            </p>

            {hasSelectedErrorImage ? (
              <img
                className="parking-error-image"
                src={selectedErrorImageUrl}
                alt={`${selectedErrorArea.areaNumber} 주차칸 확인 이미지`}
                onLoad={() => setErrorImageError('')}
                onError={() => {
                  setErrorImageError('이미지 파일을 불러오지 못했습니다. 서버 uploads/S3 경로와 파일 존재 여부를 확인하세요.');
                }}
              />
            ) : isErrorImageLoading ? (
              <div className="parking-error-empty">확인 이미지를 불러오는 중입니다.</div>
            ) : (
              <div className="parking-error-empty">
                {errorImageError ||
                  '저장된 이미지 경로가 없습니다. Python이 image_base64를 보내고 Spring Boot가 image_path를 저장해야 표시됩니다.'}
              </div>
            )}

            {selectedErrorArea.errorPlate && (
              <p className="parking-error-meta">
                차량번호: {selectedErrorArea.errorPlate}
                {selectedErrorArea.errorEntryTime ? ` / 입차 시각: ${selectedErrorArea.errorEntryTime}` : ''}
              </p>
            )}

            {(!selectedErrorImageUrl || errorImageError) && selectedErrorImagePath && (
              <p className="parking-error-meta">
                저장 경로: {selectedErrorImagePath}
              </p>
            )}

            <div className="modal-actions">
              {hasSelectedErrorImage && (
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

      {contactTargetArea && contactOwner && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="parking-owner-contact-title">
            <h2 id="parking-owner-contact-title">차주 알림 보내기</h2>
            <p>
              {contactTargetArea.areaNumber} 주차칸의 {contactOwner.carNumber} 차량 소유 주민에게 앱 알림을 보냅니다.
            </p>

            <form className="answer-form" onSubmit={submitOwnerContactNotification}>
              <FormField label="차주 정보" helper="전화 연락이 필요하면 등록된 연락처를 사용하세요.">
                <TextInput
                  value={`${contactOwner.building || '-'}동 ${contactOwner.unit || '-'}호 ${contactOwner.name || '-'} / ${contactOwner.phone || '연락처 없음'}`}
                  readOnly
                />
              </FormField>
              <FormField label="제목">
                <TextInput
                  value={contactForm.title}
                  maxLength={100}
                  disabled={isContactSending}
                  onChange={(event) => handleContactFormChange('title', event.target.value)}
                />
              </FormField>
              <FormField label="내용" error={contactError}>
                <TextArea
                  rows={5}
                  value={contactForm.message}
                  maxLength={500}
                  disabled={isContactSending}
                  onChange={(event) => handleContactFormChange('message', event.target.value)}
                />
              </FormField>
              <div className="modal-actions">
                <Button variant="secondary" disabled={isContactSending} onClick={closeOwnerContactModal}>
                  취소
                </Button>
                <Button type="submit" disabled={isContactSending}>
                  {isContactSending ? '발송 중' : '알림 보내기'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
