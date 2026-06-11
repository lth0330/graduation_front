export function resolveVisitorCarStatus(visitorCar) {
  if (visitorCar?.parkedAt) {
    return 'parked';
  }
  if (visitorCar?.gateEnteredAt) {
    return 'entered';
  }
  return 'waiting';
}
