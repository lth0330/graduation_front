import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  approveResidentSignupRequest as approveResidentSignupRequestApi,
  createResident as createResidentApi,
  createVehicle as createVehicleApi,
  deleteVehicle as deleteVehicleApi,
  deleteResident as deleteResidentApi,
  getApartmentManagerMyPage,
  getResident,
  getResidents,
  getResidentSignupRequests,
  getVehicle,
  getVisitorCars,
  getVehicles,
  rejectResidentSignupRequest as rejectResidentSignupRequestApi,
  updateApartmentManagerProfile as updateApartmentManagerProfileApi,
  updateResident as updateResidentApi,
  updateVehicle as updateVehicleApi,
} from '../api/apartmentManagerApi.js';
import {
  createParkingLot as createParkingLotApi,
  createParkingZone,
  deleteParkingLot as deleteParkingLotApi,
  deleteParkingZone,
  getGatePolicy,
  getParkingLots,
  getParkingZones,
  updateGatePolicy as updateGatePolicyApi,
  updateParkingZoneLayout,
  updateParkingZoneStatus,
} from '../api/parkingApi.js';
import {
  createManagerInquiry as createManagerInquiryApi,
  getMyManagerInquiries,
} from '../api/inquiryApi.js';
import {
  getManagerNotifications,
  markManagerNotificationAsRead as markManagerNotificationAsReadApi,
} from '../api/managerNotificationApi.js';
import {
  answerResidentInquiry as answerResidentInquiryApi,
  getResidentInquiries,
} from '../api/residentInquiryApi.js';
import { authRoles, getValidAuthSession } from '../utils/auth.js';

const ApartmentManagerContext = createContext(null);

const statusMap = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const emptyApartmentManagerProfile = {
  managerNo: '',
  loginId: '',
  email: '',
  phone: '',
  name: '',
  apartmentNo: '',
  apartmentName: '',
  address: '',
  detailAddress: '',
  apartmentPassword: '',
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
    residentCarLimit: Number(apiResident.residentCarLimit ?? 1),
    visitorCarLimit: Number(apiResident.visitorCarLimit ?? 2),
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

function mapVisitorCar(apiVisitorCar) {
  return {
    id: String(apiVisitorCar.visitorCarNo),
    visitorCarNo: apiVisitorCar.visitorCarNo,
    carNumber: apiVisitorCar.carNumber,
    ownerId: String(apiVisitorCar.ownerId),
    ownerName: apiVisitorCar.ownerName,
    building: apiVisitorCar.building,
    unit: apiVisitorCar.unit,
    registeredAt: formatDate(apiVisitorCar.registeredAt),
    parkedAt: formatDate(apiVisitorCar.parkedAt),
    expiresAt: formatDate(apiVisitorCar.expiresAt),
    status: apiVisitorCar.parkedAt ? 'parked' : 'waiting',
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
    layoutWidth: Number(apiParkingZone.layoutWidth || 1),
    layoutHeight: Number(apiParkingZone.layoutHeight || 1),
    zoneType: apiParkingZone.zoneType || 'normal',
    statusChangeReason: apiParkingZone.statusChangeReason || '',
  };
}

function mapGatePolicy(apiPolicy) {
  return {
    apartmentNo: apiPolicy.apartmentNo,
    gateOccupancyBlockEnabled: Boolean(apiPolicy.gateOccupancyBlockEnabled),
    gateForceOpenEnabled: Boolean(apiPolicy.gateForceOpenEnabled),
  };
}

function mapManagerNotification(apiNotification) {
  return {
    id: String(apiNotification.notificationNo),
    notificationNo: apiNotification.notificationNo,
    managerNo: apiNotification.managerNo,
    apartmentNo: apiNotification.apartmentNo,
    notificationType: apiNotification.notificationType,
    title: apiNotification.title,
    message: apiNotification.message,
    referenceType: apiNotification.referenceType || '',
    referenceId: apiNotification.referenceId,
    read: Boolean(apiNotification.read),
    createdAt: formatDate(apiNotification.createdAt),
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

function mapResidentParkingInquiry(apiInquiry) {
  return {
    id: String(apiInquiry.inquiryNo),
    inquiryNo: apiInquiry.inquiryNo,
    residentNo: apiInquiry.residentNo,
    apartmentNo: apiInquiry.apartmentNo,
    title: apiInquiry.title,
    writer: apiInquiry.writer,
    building: apiInquiry.building,
    unit: apiInquiry.unit,
    vehicleNo: apiInquiry.vehicleNo,
    carNumber: apiInquiry.carNumber || '-',
    status: apiInquiry.status,
    content: apiInquiry.content,
    answer: apiInquiry.answer || '',
    createdAt: formatDate(apiInquiry.createdAt),
    answeredAt: formatDate(apiInquiry.answeredAt),
  };
}

export function ApartmentManagerProvider({ children }) {
  const [managerProfile, setManagerProfile] = useState(emptyApartmentManagerProfile);
  const [isManagerProfileLoading, setIsManagerProfileLoading] = useState(false);
  const [managerProfileError, setManagerProfileError] = useState('');
  const [residentSignupRequests, setResidentSignupRequests] = useState([]);
  const [isResidentRequestsLoading, setIsResidentRequestsLoading] = useState(false);
  const [residentRequestsError, setResidentRequestsError] = useState('');
  const [residents, setResidents] = useState([]);
  const [isResidentsLoading, setIsResidentsLoading] = useState(false);
  const [residentsError, setResidentsError] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState('');
  const [visitorCars, setVisitorCars] = useState([]);
  const [isVisitorCarsLoading, setIsVisitorCarsLoading] = useState(false);
  const [visitorCarsError, setVisitorCarsError] = useState('');
  const [parkingLots, setParkingLots] = useState([]);
  const [parkingAreas, setParkingAreas] = useState([]);
  const [isParkingLoading, setIsParkingLoading] = useState(false);
  const [parkingError, setParkingError] = useState('');
  const [gatePolicy, setGatePolicy] = useState({
    apartmentNo: '',
    gateOccupancyBlockEnabled: true,
    gateForceOpenEnabled: false,
  });
  const [isGatePolicyLoading, setIsGatePolicyLoading] = useState(false);
  const [gatePolicyError, setGatePolicyError] = useState('');
  const [managerInquiries, setManagerInquiries] = useState([]);
  const [isManagerInquiriesLoading, setIsManagerInquiriesLoading] = useState(false);
  const [managerInquiriesError, setManagerInquiriesError] = useState('');
  const [managerNotifications, setManagerNotifications] = useState([]);
  const [isManagerNotificationsLoading, setIsManagerNotificationsLoading] = useState(false);
  const [managerNotificationsError, setManagerNotificationsError] = useState('');
  // 입주민 주차 문의 목록은 백엔드 API 응답을 기준으로 관리합니다.
  const [residentParkingInquiries, setResidentParkingInquiries] = useState([]);
  const [isResidentParkingInquiriesLoading, setIsResidentParkingInquiriesLoading] = useState(false);
  const [residentParkingInquiriesError, setResidentParkingInquiriesError] = useState('');

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

  const updateManagerProfile = async (updatedFields) => {
    const managerNo = getStoredManagerNo();
    await updateApartmentManagerProfileApi(managerNo, {
      email: updatedFields.email,
      phone: updatedFields.phone,
      name: updatedFields.name,
    });
    await refreshManagerProfile();
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
        refreshVisitorCars();
        refreshParkingData();
        refreshGatePolicy();
        refreshManagerInquiries();
        refreshManagerNotifications();
        refreshResidentParkingInquiries();
      }
    };

    window.addEventListener('auth-session-changed', handleAuthSessionChanged);
    return () => window.removeEventListener('auth-session-changed', handleAuthSessionChanged);
  }, []);

  const refreshResidentSignupRequests = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setIsResidentRequestsLoading(true);
        setResidentRequestsError('');
      }

      const apartmentNo = getStoredApartmentNo();
      const requests = await getResidentSignupRequests(apartmentNo);
      setResidentSignupRequests(requests.map(mapResidentSignupRequest));
    } catch (error) {
      if (!silent) {
        setResidentRequestsError('주민 가입 신청 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
      }
    } finally {
      if (!silent) {
        setIsResidentRequestsLoading(false);
      }
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
    await refreshResidents();
    await refreshVehicles();
  };

  const rejectResidentSignupRequest = async (id, rejectReason) => {
    await rejectResidentSignupRequestApi(id, rejectReason);
    await refreshResidentSignupRequests();
    await refreshResidents();
    await refreshVehicles();
  };

  const refreshResidents = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setIsResidentsLoading(true);
        setResidentsError('');
      }

      const apartmentNo = getStoredApartmentNo();
      const residentList = await getResidents(apartmentNo);
      setResidents(residentList.map(mapResident));
    } catch (error) {
      if (!silent) {
        setResidentsError('주민 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
      }
    } finally {
      if (!silent) {
        setIsResidentsLoading(false);
      }
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

  const getResidentDetail = async (id) => mapResident(await getResident(id));

  const createResident = async (resident) => {
    const createdResident = await createResidentApi({
      ...resident,
      apartmentNo: Number(resident.apartmentNo || getStoredApartmentNo()),
      residentCarLimit: Number(resident.residentCarLimit ?? 1),
      visitorCarLimit: Number(resident.visitorCarLimit ?? 2),
    });
    await refreshResidents();

    return mapResident(createdResident);
  };

  const deleteResident = async (id) => {
    await deleteResidentApi(id);
    await refreshResidents();
  };

  const refreshVehicles = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setIsVehiclesLoading(true);
        setVehiclesError('');
      }

      const apartmentNo = getStoredApartmentNo();
      const vehicleList = await getVehicles(apartmentNo);
      setVehicles(vehicleList.map(mapVehicle));
    } catch (error) {
      if (!silent) {
        setVehiclesError('차량 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
      }
    } finally {
      if (!silent) {
        setIsVehiclesLoading(false);
      }
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
    await refreshResidents({ silent: true });

    return mapVehicle(createdVehicle);
  };

  const getVehicleDetail = async (id) => mapVehicle(await getVehicle(id));

  const updateVehicle = async (id, updatedFields) => {
    await updateVehicleApi(id, {
      carNumber: updatedFields.carNumber,
      carType: updatedFields.carType,
      note: updatedFields.note,
    });
    await refreshVehicles();
  };

  const deleteVehicle = async (id) => {
    await deleteVehicleApi(id);
    await refreshVehicles();
    await refreshResidents({ silent: true });
  };

  const refreshVisitorCars = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setIsVisitorCarsLoading(true);
        setVisitorCarsError('');
      }

      const apartmentNo = getStoredApartmentNo();
      const visitorCarList = await getVisitorCars(apartmentNo);
      setVisitorCars(visitorCarList.map(mapVisitorCar));
    } catch (error) {
      if (!silent) {
        setVisitorCarsError('방문 차량 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
      }
    } finally {
      if (!silent) {
        setIsVisitorCarsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (getValidAuthSession(authRoles.APARTMENT_MANAGER)) {
      refreshVisitorCars();
    }
  }, []);

  const isDuplicateCarNumber = (carNumber, currentVehicleId) =>
    vehicles.some((vehicle) => vehicle.carNumber === carNumber && vehicle.id !== currentVehicleId);

  const refreshParkingData = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setIsParkingLoading(true);
        setParkingError('');
      }

      const apartmentNo = getStoredApartmentNo();
      const parkingLotList = await getParkingLots(apartmentNo);
      const mappedParkingLots = parkingLotList.map(mapParkingLot);
      const parkingZoneGroups = await Promise.all(
        mappedParkingLots.map((parkingLot) => getParkingZones(parkingLot.parkingLotNo)),
      );

      setParkingLots(mappedParkingLots);
      setParkingAreas(parkingZoneGroups.flat().map(mapParkingArea));
    } catch (error) {
      if (!silent) {
        setParkingError('주차장 정보를 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
      }
    } finally {
      if (!silent) {
        setIsParkingLoading(false);
      }
    }
  };

  useEffect(() => {
    if (getValidAuthSession(authRoles.APARTMENT_MANAGER)) {
      refreshParkingData();
    }
  }, []);

  const refreshGatePolicy = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setIsGatePolicyLoading(true);
        setGatePolicyError('');
      }

      const policy = await getGatePolicy();
      setGatePolicy(mapGatePolicy(policy));
    } catch (error) {
      if (!silent) {
        setGatePolicyError('차단기 정책을 불러오지 못했습니다.');
      }
    } finally {
      if (!silent) {
        setIsGatePolicyLoading(false);
      }
    }
  };

  useEffect(() => {
    if (getValidAuthSession(authRoles.APARTMENT_MANAGER)) {
      refreshGatePolicy();
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
      layoutWidth: Number(parkingArea.layoutWidth || 1),
      layoutHeight: Number(parkingArea.layoutHeight || 1),
      zoneType: parkingArea.zoneType || 'normal',
      statusChangeReason: parkingArea.statusChangeReason || '',
    });
    await refreshParkingData();
  };

  const updateParkingAreaStatus = async (id, status, statusChangeReason, zoneType) => {
    await updateParkingZoneStatus(id, status, statusChangeReason, zoneType);
    await refreshParkingData();
  };

  const updateParkingAreaLayout = async (id, layoutRow, layoutColumn, layoutWidth, layoutHeight) => {
    await updateParkingZoneLayout(
      id,
      Number(layoutRow),
      Number(layoutColumn),
      Number(layoutWidth || 1),
      Number(layoutHeight || 1),
    );
    await refreshParkingData();
  };

  const deleteParkingArea = async (id) => {
    await deleteParkingZone(id);
    await refreshParkingData();
  };

  const updateGatePolicy = async (nextPolicy) => {
    const updatedPolicy = await updateGatePolicyApi({
      gateOccupancyBlockEnabled: nextPolicy.gateOccupancyBlockEnabled,
      gateForceOpenEnabled: nextPolicy.gateForceOpenEnabled,
    });
    const mappedPolicy = mapGatePolicy(updatedPolicy);
    setGatePolicy(mappedPolicy);
    return mappedPolicy;
  };

  const refreshManagerInquiries = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setIsManagerInquiriesLoading(true);
        setManagerInquiriesError('');
      }

      const inquiries = await getMyManagerInquiries();
      setManagerInquiries(inquiries.map(mapManagerInquiry));
    } catch (error) {
      if (!silent) {
        setManagerInquiriesError('문의 내역을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
      }
    } finally {
      if (!silent) {
        setIsManagerInquiriesLoading(false);
      }
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

  const refreshManagerNotifications = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setIsManagerNotificationsLoading(true);
        setManagerNotificationsError('');
      }

      const notifications = await getManagerNotifications();
      setManagerNotifications(notifications.map(mapManagerNotification));
    } catch (error) {
      if (!silent) {
        setManagerNotificationsError('관리자 알림 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
      }
    } finally {
      if (!silent) {
        setIsManagerNotificationsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (getValidAuthSession(authRoles.APARTMENT_MANAGER)) {
      refreshManagerNotifications();
    }
  }, []);

  const markManagerNotificationAsRead = async (notificationNo) => {
    const updatedNotification = await markManagerNotificationAsReadApi(notificationNo);
    await refreshManagerNotifications();
    return mapManagerNotification(updatedNotification);
  };

  const refreshResidentParkingInquiries = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setIsResidentParkingInquiriesLoading(true);
        setResidentParkingInquiriesError('');
      }

      const apartmentNo = getStoredApartmentNo();
      const inquiries = await getResidentInquiries(apartmentNo);
      setResidentParkingInquiries(inquiries.map(mapResidentParkingInquiry));
    } catch (error) {
      if (!silent) {
        setResidentParkingInquiriesError('입주민 문의 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
      }
    } finally {
      if (!silent) {
        setIsResidentParkingInquiriesLoading(false);
      }
    }
  };

  useEffect(() => {
    if (getValidAuthSession(authRoles.APARTMENT_MANAGER)) {
      refreshResidentParkingInquiries();
    }
  }, []);

  const answerResidentParkingInquiry = async (id, answer) => {
    const answeredInquiry = await answerResidentInquiryApi(id, answer);
    await refreshResidentParkingInquiries();
    await refreshManagerNotifications({ silent: true });
    return mapResidentParkingInquiry(answeredInquiry);
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
      updateManagerProfile,
      findResidentSignupRequestById: (id) =>
        residentSignupRequests.find((request) => request.id === id),
      approveResidentSignupRequest,
      rejectResidentSignupRequest,
      residents,
      isResidentsLoading,
      residentsError,
      refreshResidents,
      findResidentById: (id) => residents.find((resident) => resident.id === id),
      getResidentDetail,
      createResident,
      updateResident,
      deleteResident,
      vehicles,
      isVehiclesLoading,
      vehiclesError,
      refreshVehicles,
      visitorCars,
      isVisitorCarsLoading,
      visitorCarsError,
      refreshVisitorCars,
      findVehicleById: (id) => vehicles.find((vehicle) => vehicle.id === id),
      getVehicleDetail,
      createVehicle,
      updateVehicle,
      deleteVehicle,
      isDuplicateCarNumber,
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
      createParkingArea,
      updateParkingAreaStatus,
      updateParkingAreaLayout,
      deleteParkingArea,
      managerInquiries,
      isManagerInquiriesLoading,
      managerInquiriesError,
      refreshManagerInquiries,
      createManagerInquiry,
      managerNotifications,
      isManagerNotificationsLoading,
      managerNotificationsError,
      refreshManagerNotifications,
      markManagerNotificationAsRead,
      residentParkingInquiries,
      isResidentParkingInquiriesLoading,
      residentParkingInquiriesError,
      refreshResidentParkingInquiries,
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
      visitorCars,
      isVisitorCarsLoading,
      visitorCarsError,
      parkingLots,
      parkingAreas,
      isParkingLoading,
      parkingError,
      gatePolicy,
      isGatePolicyLoading,
      gatePolicyError,
      managerInquiries,
      isManagerInquiriesLoading,
      managerInquiriesError,
      managerNotifications,
      isManagerNotificationsLoading,
      managerNotificationsError,
      residentParkingInquiries,
      isResidentParkingInquiriesLoading,
      residentParkingInquiriesError,
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
