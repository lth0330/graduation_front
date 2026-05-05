import { createContext, useContext, useMemo, useState } from 'react';
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

const ApartmentManagerContext = createContext(null);

export function ApartmentManagerProvider({ children }) {
  const [residentSignupRequests, setResidentSignupRequests] = useState(initialResidentSignupRequests);
  const [residents, setResidents] = useState(initialResidents);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [parkingLots, setParkingLots] = useState(initialParkingLots);
  const [parkingAreas, setParkingAreas] = useState(initialParkingAreas);
  const [managerInquiries, setManagerInquiries] = useState(initialManagerInquiries);
  const [residentParkingInquiries, setResidentParkingInquiries] = useState(initialResidentParkingInquiries);

  const approveResidentSignupRequest = (id) => {
    setResidentSignupRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === id
          ? {
              ...request,
              status: 'approved',
              rejectReason: '',
            }
          : request,
      ),
    );
  };

  const rejectResidentSignupRequest = (id, rejectReason) => {
    setResidentSignupRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === id
          ? {
              ...request,
              status: 'rejected',
              rejectReason,
            }
          : request,
      ),
    );
  };

  const updateResident = (id, updatedFields) => {
    setResidents((currentResidents) =>
      currentResidents.map((resident) =>
        resident.id === id
          ? {
              ...resident,
              ...updatedFields,
            }
          : resident,
      ),
    );
  };

  const deleteResident = (id) => {
    setResidents((currentResidents) => currentResidents.filter((resident) => resident.id !== id));
  };

  const createVehicle = (vehicle) => {
    const nextNumber = vehicles.length + 5009;
    const newVehicle = {
      ...vehicle,
      id: `CAR-${nextNumber}`,
      registeredAt: new Date().toISOString().slice(0, 10),
    };

    setVehicles((currentVehicles) => [newVehicle, ...currentVehicles]);
    return newVehicle;
  };

  const updateVehicle = (id, updatedFields) => {
    setVehicles((currentVehicles) =>
      currentVehicles.map((vehicle) =>
        vehicle.id === id
          ? {
              ...vehicle,
              ...updatedFields,
            }
          : vehicle,
      ),
    );
  };

  const deleteVehicle = (id) => {
    setVehicles((currentVehicles) => currentVehicles.filter((vehicle) => vehicle.id !== id));
  };

  const isDuplicateCarNumber = (carNumber, currentVehicleId) =>
    vehicles.some((vehicle) => vehicle.carNumber === carNumber && vehicle.id !== currentVehicleId);

  const createParkingLot = (parkingLot) => {
    const newParkingLot = {
      ...parkingLot,
      id: `PL-${1000 + parkingLots.length + 1}`,
      totalSpaces: Number(parkingLot.totalSpaces),
      usedSpaces: Number(parkingLot.usedSpaces),
    };

    setParkingLots((currentParkingLots) => [newParkingLot, ...currentParkingLots]);
    return newParkingLot;
  };

  const deleteParkingLot = (id) => {
    setParkingLots((currentParkingLots) => currentParkingLots.filter((parkingLot) => parkingLot.id !== id));
    setParkingAreas((currentParkingAreas) => currentParkingAreas.filter((parkingArea) => parkingArea.parkingLotId !== id));
  };

  const createParkingArea = (parkingArea) => {
    const newParkingArea = {
      ...parkingArea,
      id: `AREA-${1000 + parkingAreas.length + 1}`,
    };

    setParkingAreas((currentParkingAreas) => [newParkingArea, ...currentParkingAreas]);
    return newParkingArea;
  };

  const deleteParkingArea = (id) => {
    setParkingAreas((currentParkingAreas) => currentParkingAreas.filter((parkingArea) => parkingArea.id !== id));
  };

  const createManagerInquiry = (inquiry) => {
    const newInquiry = {
      ...inquiry,
      id: `INQ-${4108 + managerInquiries.length}`,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setManagerInquiries((currentInquiries) => [newInquiry, ...currentInquiries]);
    return newInquiry;
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
      apartmentManagerProfile,
      findResidentSignupRequestById: (id) =>
        residentSignupRequests.find((request) => request.id === id),
      approveResidentSignupRequest,
      rejectResidentSignupRequest,
      residents,
      findResidentById: (id) => residents.find((resident) => resident.id === id),
      updateResident,
      deleteResident,
      vehicles,
      findVehicleById: (id) => vehicles.find((vehicle) => vehicle.id === id),
      createVehicle,
      updateVehicle,
      deleteVehicle,
      isDuplicateCarNumber,
      parkingLots,
      parkingAreas,
      createParkingLot,
      deleteParkingLot,
      createParkingArea,
      deleteParkingArea,
      managerInquiries,
      createManagerInquiry,
      residentParkingInquiries,
      findResidentParkingInquiryById: (id) =>
        residentParkingInquiries.find((inquiry) => inquiry.id === id),
      answerResidentParkingInquiry,
    }),
    [
      residentSignupRequests,
      residents,
      vehicles,
      parkingLots,
      parkingAreas,
      managerInquiries,
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
