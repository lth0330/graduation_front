export const residentRequestStatusOptions = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '승인 대기' },
  { value: 'approved', label: '승인 완료' },
  { value: 'rejected', label: '거절' },
];

export function filterResidentRequestsByStatus(requests, selectedStatus) {
  if (selectedStatus === 'all') {
    return requests;
  }

  return requests.filter((request) => request.status === selectedStatus);
}

export function getResidentRequestStatusLabel(selectedStatus) {
  return residentRequestStatusOptions.find((option) => option.value === selectedStatus)?.label || '전체';
}
