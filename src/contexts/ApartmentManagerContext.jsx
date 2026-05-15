import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  approveResidentSignupRequest as approveResidentSignupRequestApi,
  createVehicle as createVehicleApi,
  deleteVehicle as deleteVehicleApi,
  deleteResident as deleteResidentApi,
  getApartmentManagerMyPage,
  getResidents,
  getResidentSignupRequests,
  getVehicles,
  rejectResidentSignupRequest as rejectResidentSignupRequestApi,
  updateResident as updateResidentApi,
  updateVehicle as updateVehicleApi,
} from '../api/apartmentManagerApi.js';
import {
  createParkingLot as createParkingLotApi,
  createParkingZone,
  deleteParkingLot as deleteParkingLotApi,
  deleteParkingZone,
  getParkingLots,
  getParkingZones,
  updateParkingZoneLayout,
  updateParkingZoneStatus,
} from '../api/parkingApi.js';
import {
  createManagerInquiry as createManagerInquiryApi,
  getMyManagerInquiries,
} from '../api/inquiryApi.js';
import {
  apartmentManagerProfile,
  residentSignupRequests as initialResidentSignupRequests,
  residents as initialResidents,
  vehicles as initialVehicles,
  parkingLots as initialParkingLots,
  parkingAreas as initialParkingAreas,
  managerInquiries as initialManagerInquiries,
  residentParkingInquiries as initialResidentParkingInquiries,
} from '../data/apartmentManagerData.js';
import { authRoles, getValidAuthSession } from '../utils/auth.js';

const ApartmentManagerContext = createContext(null);

const statusMap = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

function formatDate(value) {
  if (!value) {
    return '';
  }

  return String(value).slice(0, 10);
}

function getStoredApartmentNo() {
  const storedManager = getValidAuthSession(authRoles.APARTMENT_MANAGER);

  if (!storedManager) {
    return 1;
  }

  return storedManager.apartmentNo || 1;
}

function getStoredManagerNo() {
  const storedManager = getValidAuthSession(authRoles.APARTMENT_MANAGER);

  if (!storedManager) {
    return 1;
  }

  return storedManager.managerNo || 1;
}

function mapApartmentManagerProfile(apiProfile) {
  return {
    managerNo: apiProfile.managerNo,
    loginId: apiProfile.loginId,
    email: apiProfile.email,
    phone: apiProfile.phone,
    name: apiProfile.name,
    apartmentNo: apiProfile.apartmentNo,
    apartmentName: apiProfile.apartmentName,
    address: apiProfile.detailAddress
      ? `${apiProfile.address} ${apiProfile.detailAddress}`
      : apiProfile.address,
    detailAddress: apiProfile.detailAddress,
    apartmentPassword: apiProfile.apartmentPassword,
  };
}

function mapResidentSignupRequest(apiRequest) {
  return {
    id: String(apiRequest.residentNo),
    residentNo: apiRequest.residentNo,
    apartmentNo: apiRequest.apartmentNo,
    name: apiRequest.name,
    loginId: apiRequest.loginId,
    email: apiRequest.email,
    building: apiRequest.building,
    unit: apiRequest.unit,
    carNumber: apiRequest.carNumber,
    carType: apiRequest.carType,
    status: statusMap[apiRequest.approvalStatus] || 'pending',
    rejectReason: apiRequest.rejectReason || '',
    requestedAt: formatDate(apiRequest.requestedAt),
  };
}

function mapResident(apiResident) {
  return {
    id: String(apiResident.residentNo),
    residentNo: apiResident.residentNo,
    apartmentNo: apiResident.apartmentNo,
    name: apiResident.name,
    loginId: apiResident.loginId,
    email: apiResident.email,
    building: apiResident.building,
    unit: apiResident.unit,
    phone: apiResident.phone,
    vehicleCount: Number(apiResident.vehicleCount || 0),
    joinedAt: formatDate(apiResident.joinedAt),
    status: statusMap[apiResident.approvalStatus] || 'approved',
  };
}

function mapVehicle(apiVehicle) {
  return {
    id: String(apiVehicle.vehicleNo),
    vehicleNo: apiVehicle.vehicleNo,
    carNumber: apiVehicle.carNumber,
    carType: apiVehicle.carType,
    ownerId: String(apiVehicle.ownerId),
    ownerName: apiVehicle.ownerName,
    building: apiVehicle.building,
    unit: apiVehicle.unit,
    note: apiVehicle.note || '',
    registeredAt: formatDate(apiVehicle.registeredAt),
  };
}

function mapParkingLot(apiParkingLot) {
  return {
    id: String(apiParkingLot.parkingLotNo),
    parkingLotNo: apiParkingLot.parkingLotNo,
    apartmentNo: apiParkingLot.apartmentNo,
    name: apiParkingLot.name,
    floor: apiParkingLot.floor,
    totalSpaces: Number(apiParkingLot.totalSpaces),
    usedSpaces: Number(apiParkingLot.usedSpaces),
  };
}

function mapParkingArea(apiParkingZone) {
  return {
    id: String(apiParkingZone.parkingZoneNo),
    parkingZoneNo: apiParkingZone.parkingZoneNo,
    parkingLotId: String(apiParkingZone.parkingLotNo),
    parkingLotNo: apiParkingZone.parkingLotNo,
    areaNumber: apiParkingZone.areaNumber,
    location: apiParkingZone.location,
    status: apiParkingZone.status,
    layoutRow: Number(apiParkingZone.layoutRow),
    layoutColumn: Number(apiParkingZone.layoutColumn),
    statusChangeReason: apiParkingZone.statusChangeReason || '',
  };
}

function mapManagerInquiry(apiInquiry) {
  return {
    id: String(apiInquiry.inquiryNo),
    inquiryNo: apiInquiry.inquiryNo,
    title: apiInquiry.title,
    category: apiInquiry.category,
    content: apiInquiry.content,
    status: apiInquiry.status,
    answer: apiInquiry.answer || '',
    createdAt: formatDate(apiInquiry.createdAt),
    answeredAt: formatDate(apiInquiry.answeredAt),
  };
}

export function ApartmentManagerProvider({ children }) {
  const [managerProfile, setManagerProfile] = useState(apartmentManagerProfile);
  const [isManagerProfileLoading, setIsManagerProfileLoading] = useState(false);
  const [managerProfileError, setManagerProfileError] = useState('');
  const [residentSignupRequests, setResidentSignupRequests] = useState(initialResidentSignupRequests);
  const [isResidentRequestsLoading, setIsResidentRequestsLoading] = useState(false);
  const [residentRequestsError, setResidentRequestsError] = useState('');
  const [residents, setResidents] = useState(initialResidents);
  const [isResidentsLoading, setIsResidentsLoading] = useState(false);
  const [residentsError, setResidentsError] = useState('');
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState('');
  const [parkingLots, setParkingLots] = useState(initialParkingLots);
  const [parkingAreas, setParkingAreas] = useState(initialParkingAreas);
  const [isParkingLoading, setIsParkingLoading] = useState(false);
  const [parkingError, setParkingError] = useState('');
  const [managerInquiries, setManagerInquiries] = useState(initialManagerInquiries);
  const [isManagerInquiriesLoading, setIsManagerInquiriesLoading] = useState(false);
  const [managerInquiriesError, setManagerInquiriesError] = useState('');
  const [residentParkingInquiries, setResidentParkingInquiries] = useState(initialResidentParkingInquiries);

  const refreshManagerProfile = async () => {
    try {
      setIsManagerProfileLoading(true);
      setManagerProfileError('');

      const managerNo = getStoredManagerNo();
      const profile = await getApartmentManagerMyPage(managerNo);
      setManagerProfile(mapApartmentManagerProfile(profile));
    } catch (error) {
      setManagerProfileError('아파트 관리자 정보를 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setIsManagerProfileLoading(false);
    }
  };

  useEffect(() => {
    if (getValidAuthSession(authRoles.APARTMENT_MANAGER)) {
      refreshManagerProfile();
    }
  }, []);

  useEffect(() => {
    const handleAuthSessionChanged = (event) => {
      if (event.detail?.role === authRoles.APARTMENT_MANAGER) {
        refreshManagerProfile();
        refreshResidentSignupRequests();
        refreshResidents();
        refreshVehicles();
        refreshParkingData();
        refreshManagerInquiries();
      }
    };

    window.addEventListener('auth-session-changed', handleAuthSessionChanged);
    return () => window.removeEventListener('auth-session-changed', handleAuthSessionChanged);
  }, []);

  const refreshResidentSignupRequests = async () => {
    try {
      setIsResidentRequestsLoading(true);
      setResidentRequestsError('');

      const apartmentNo = getStoredApartmentNo();
      const requests = await getResidentSignupRequests(apartmentNo);
      setResidentSignupRequests(requests.map(mapResidentSignupRequest));
    } catch (error) {
      setResidentRequestsError('주민 가입 신청 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setIsResidentRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (getValidAuthSession(authRoles.APARTMENT_MANAGER)) {
      refreshResidentSignupRequests();
    }
  }, []);

  const approveResidentSignupRequest = async (id) => {
    await approveResidentSignupRequestApi(id);
    await refreshResidentSignupRequests();
  };

  const rejectResidentSignupRequest = async (id, rejectReason) => {
    await rejectResidentSignupRequestApi(id, rejectReason);
    await refreshResidentSignupRequests();
  };

  const refreshResidents = async () => {
    try {
      setIsResidentsLoading(true);
      setResidentsError('');

      const apartmentNo = getStoredApartmentNo();
      const residentList = await getResidents(apartmentNo);
      setResidents(residentList.map(mapResident));
    } catch (error) {
      setResidentsError('주민 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setIsResidentsLoading(false);
    }
  };

  useEffect(() => {
    if (getValidAuthSession(authRoles.APARTMENT_MANAGER)) {
      refreshResidents();
    }
  }, []);

  const updateResident = async (id, updatedFields) => {
    await updateResidentApi(id, updatedFields);
    await refreshResidents();
  };

  const deleteResident = async (id) => {
    await deleteResidentApi(id);
    await refreshResidents();
  };

  const refreshVehicles = async () => {
    try {
      setIsVehiclesLoading(true);
      setVehiclesError('');

      const apartmentNo = getStoredApartmentNo();
      const vehicleList = await getVehicles(apartmentNo);
      setVehicles(vehicleList.map(mapVehicle));
    } catch (error) {
      setVehiclesError('차량 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setIsVehiclesLoading(false);
    }
  };

  useEffect(() => {
    if (getValidAuthSession(authRoles.APARTMENT_MANAGER)) {
      refreshVehicles();
    }
  }, []);

  const createVehicle = async (vehicle) => {
    const createdVehicle = await createVehicleApi({
      carNumber: vehicle.carNumber,
      carType: vehicle.carType,
      ownerId: Number(vehicle.ownerId),
      note: vehicle.note,
    });
    await refreshVehicles();

    return mapVehicle(createdVehicle);
  };

  const updateVehicle = async (id, updatedFields) => {
    await updateVehicleApi(id, {
      carNumber: updatedFields.carNumber,
      carType: updatedFields.carType,
      ownerId: Number(updatedFields.ownerId),
      note: updatedFields.note,
    });
    await refreshVehicles();
  };

  const deleteVehicle = async (id) => {
    await deleteVehicleApi(id);
    await refreshVehicles();
  };

  const isDuplicateCarNumber = (carNumber, currentVehicleId) =>
    vehicles.some((vehicle) => vehicle.carNumber === carNumber && vehicle.id !== currentVehicleId);

  const refreshParkingData = async () => {
    try {
      setIsParkingLoading(true);
      setParkingError('');

      const apartmentNo = getStoredApartmentNo();
      const parkingLotList = await getParkingLots(apartmentNo);
      const mappedParkingLots = parkingLotList.map(mapParkingLot);
      const parkingZoneGroups = await Promise.all(
        mappedParkingLots.map((parkingLot) => getParkingZones(parkingLot.parkingLotNo)),
      );

      setParkingLots(mappedParkingLots);
      setParkingAreas(parkingZoneGroups.flat().map(mapParkingArea));
    } catch (error) {
      setParkingError('주차장 정보를 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setIsParkingLoading(false);
    }
  };

  useEffect(() => {
    if (getValidAuthSession(authRoles.APARTMENT_MANAGER)) {
      refreshParkingData();
    }
  }, []);

  const createParkingLot = async (parkingLot) => {
    const apartmentNo = getStoredApartmentNo();

    await createParkingLotApi({
      apartmentNo,
      name: parkingLot.name,
      floor: parkingLot.floor,
      totalSpaces: Number(parkingLot.totalSpaces),
      usedSpaces: Number(parkingLot.usedSpaces),
    });
    await refreshParkingData();
  };

  const deleteParkingLot = async (id) => {
    await deleteParkingLotApi(id);
    await refreshParkingData();
  };

  const createParkingArea = async (parkingArea) => {
    await createParkingZone({
      parkingLotNo: Number(parkingArea.parkingLotId),
      areaNumber: parkingArea.areaNumber,
      location: parkingArea.location,
      status: parkingArea.status,
      layoutRow: Number(parkingArea.layoutRow),
      layoutColumn: Number(parkingArea.layoutColumn),
      statusChangeReason: parkingArea.statusChangeReason || '',
    });
    await refreshParkingData();
  };

  const updateParkingAreaStatus = async (id, status, statusChangeReason) => {
    await updateParkingZoneStatus(id, status, statusChangeReason);
    await refreshParkingData();
  };

  const updateParkingAreaLayout = async (id, layoutRow, layoutColumn) => {
    await updateParkingZoneLayout(id, Number(layoutRow), Number(layoutColumn));
    await refreshParkingData();
  };

  const deleteParkingArea = async (id) => {
    await deleteParkingZone(id);
    await refreshParkingData();
  };

  const refreshManagerInquiries = async () => {
    try {
      setIsManagerInquiriesLoading(true);
      setManagerInquiriesError('');

      const inquiries = await getMyManagerInquiries();
      setManagerInquiries(inquiries.map(mapManagerInquiry));
    } catch (error) {
      setManagerInquiriesError('문의 내역을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setIsManagerInquiriesLoading(false);
    }
  };

  useEffect(() => {
    if (getValidAuthSession(authRoles.APARTMENT_MANAGER)) {
      refreshManagerInquiries();
    }
  }, []);

  const createManagerInquiry = async (inquiry) => {
    const createdInquiry = await createManagerInquiryApi(inquiry);
    await refreshManagerInquiries();
    return mapManagerInquiry(createdInquiry);
  };

  const answerResidentParkingInquiry = (id, answer) => {
    setResidentParkingInquiries((currentInquiries) =>
      currentInquiries.map((inquiry) =>
        inquiry.id === id
          ? {
              ...inquiry,
              status: 'answered',
              answer,
            }
          : inquiry,
      ),
    );
  };

  const value = useMemo(
    () => ({
      residentSignupRequests,
      isResidentRequestsLoading,
      residentRequestsError,
      refreshResidentSignupRequests,
      apartmentManagerProfile: managerProfile,
      isManagerProfileLoading,
      managerProfileError,
      refreshManagerProfile,
      findResidentSignupRequestById: (id) =>
        residentSignupRequests.find((request) => request.id === id),
      approveResidentSignupRequest,
      rejectResidentSignupRequest,
      residents,
      isResidentsLoading,
      residentsError,
      refreshResidents,
      findResidentById: (id) => residents.find((resident) => resident.id === id),
      updateResident,
      deleteResident,
      vehicles,
      isVehiclesLoading,
      vehiclesError,
      refreshVehicles,
      findVehicleById: (id) => vehicles.find((vehicle) => vehicle.id === id),
      createVehicle,
      updateVehicle,
      deleteVehicle,
      isDuplicateCarNumber,
      parkingLots,
      parkingAreas,
      isParkingLoading,
      parkingError,
      refreshParkingData,
      createParkingLot,
      deleteParkingLot,
      createParkingArea,
      updateParkingAreaStatus,
      updateParkingAreaLayout,
      deleteParkingArea,
      managerInquiries,
      isManagerInquiriesLoading,
      managerInquiriesError,
      refreshManagerInquiries,
      createManagerInquiry,
      residentParkingInquiries,
      findResidentParkingInquiryById: (id) =>
        residentParkingInquiries.find((inquiry) => inquiry.id === id),
      answerResidentParkingInquiry,
    }),
    [
      residentSignupRequests,
      managerProfile,
      isManagerProfileLoading,
      managerProfileError,
      isResidentRequestsLoading,
      residentRequestsError,
      residents,
      isResidentsLoading,
      residentsError,
      vehicles,
      isVehiclesLoading,
      vehiclesError,
      parkingLots,
      parkingAreas,
      isParkingLoading,
      parkingError,
      managerInquiries,
      isManagerInquiriesLoading,
      managerInquiriesError,
      residentParkingInquiries,
    ],
  );

  return (
    <ApartmentManagerContext.Provider value={value}>
      {children}
    </ApartmentManagerContext.Provider>
  );
}

export function useApartmentManager() {
  const context = useContext(ApartmentManagerContext);

  if (!context) {
    throw new Error('useApartmentManager must be used inside ApartmentManagerProvider.');
  }

  return context;
}
