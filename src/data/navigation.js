export const webAdminMenus = [
  { label: '대시보드', path: '/web-admin' },
  { label: '가입 승인', path: '/web-admin/signup-approvals' },
  { label: '관리자 정보 관리', path: '/web-admin/apartment-managers' },
  { label: '문의 관리', path: '/web-admin/inquiries' },
];

export const apartmentManagerMenus = [
  { label: '대시보드', path: '/apartment-admin' },
  { label: '마이페이지', path: '/apartment-manager/my-page' },
  { label: '알림', path: '/apartment-manager/notifications' },
  {
    label: '입주민',
    children: [
      { label: '입주민 가입 요청 관리', path: '/apartment-manager/resident-requests' },
      { label: '입주민 정보 관리', path: '/apartment-manager/residents' },
    ],
  },
  {
    label: '주차 관리',
    children: [
      { label: '차량 정보 관리', path: '/apartment-manager/vehicles' },
      { label: '방문 차량 관리', path: '/apartment-manager/visitor-cars' },
      { label: '주차장 관리', path: '/apartment-manager/parking-lots' },
      { label: '주차 구역 관리', path: '/apartment-manager/parking-areas' },
      { label: '주차 상태 확인', path: '/apartment-manager/parking-status' },
    ],
  },
  {
    label: '문의',
    children: [
      { label: '웹 관리자 문의 작성', path: '/apartment-manager/inquiry-write' },
      { label: '문의 내역', path: '/apartment-manager/inquiry-history' },
      { label: '입주민 문의 관리', path: '/apartment-manager/resident-inquiries' },
    ],
  },
];
