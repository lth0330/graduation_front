export const signupRequests = [
  {
    id: 'REQ-1024',
    loginId: 'apt_hanbit',
    email: 'hanbit@apt.com',
    apartmentName: '한빛아파트',
    address: '서울특별시 강남구 테헤란로 123 한빛아파트 관리사무소',
    applicantName: '김민준',
    status: 'pending',
    requestedAt: '2026-04-30',
  },
  {
    id: 'REQ-1023',
    loginId: 'green_admin',
    email: 'green@apt.com',
    apartmentName: '그린파크',
    address: '서울특별시 송파구 올림픽로 88 그린파크 관리사무소',
    applicantName: '이서연',
    status: 'pending',
    requestedAt: '2026-04-29',
  },
  {
    id: 'REQ-1022',
    loginId: 'central01',
    email: 'central@apt.com',
    apartmentName: '센트럴뷰',
    address: '경기도 성남시 분당구 중앙로 45 센트럴뷰 관리사무소',
    applicantName: '박도윤',
    status: 'approved',
    requestedAt: '2026-04-28',
  },
  {
    id: 'REQ-1021',
    loginId: 'raon_mgr',
    email: 'raon@apt.com',
    apartmentName: '라온타워',
    address: '인천광역시 연수구 컨벤시아대로 10 라온타워 관리사무소',
    applicantName: '최하나',
    status: 'rejected',
    rejectReason: '아파트 주소 확인이 필요합니다.',
    requestedAt: '2026-04-27',
  },
];

export function findSignupRequestById(id) {
  return signupRequests.find((request) => request.id === id);
}

export const apartmentManagers = [
  {
    id: 'ADM-1008',
    loginId: 'apt_hanbit',
    email: 'hanbit@apt.com',
    apartmentName: '한빛아파트',
    status: 'active',
    approvedAt: '2026-04-30',
  },
  {
    id: 'ADM-1007',
    loginId: 'green_admin',
    email: 'green@apt.com',
    apartmentName: '그린파크',
    status: 'active',
    approvedAt: '2026-04-29',
  },
  {
    id: 'ADM-1006',
    loginId: 'central01',
    email: 'central@apt.com',
    apartmentName: '센트럴뷰',
    status: 'active',
    approvedAt: '2026-04-28',
  },
  {
    id: 'ADM-1005',
    loginId: 'raon_mgr',
    email: 'raon@apt.com',
    apartmentName: '라온타워',
    status: 'inactive',
    approvedAt: '2026-04-27',
  },
];

export const webAdminInquiries = [
  {
    id: 'INQ-3051',
    title: '관리자 승인 처리 일정 문의',
    writer: '김민준',
    apartmentName: '한빛아파트',
    category: '서비스 신청',
    status: 'pending',
    createdAt: '2026-04-30',
    content:
      '아파트 관리자 회원가입 신청 후 승인까지 얼마나 걸리는지 문의드립니다. 승인 기준과 처리 절차도 함께 안내 부탁드립니다.',
  },
  {
    id: 'INQ-3050',
    title: '아파트 주소 정보 수정 요청',
    writer: '이서연',
    apartmentName: '그린파크',
    category: '서비스 문제',
    status: 'answered',
    createdAt: '2026-04-29',
    content: '관리자 정보에 등록된 아파트 주소가 실제 주소와 달라 수정 방법을 문의드립니다.',
    answer: '웹 관리자 확인 후 주소 정보를 수정했습니다. 마이페이지에서 변경된 주소를 확인해 주세요.',
  },
  {
    id: 'INQ-3049',
    title: '주민 차량 등록 오류 문의',
    writer: '박도윤',
    apartmentName: '센트럴뷰',
    category: '서비스 문제',
    status: 'pending',
    createdAt: '2026-04-28',
    content: '주민 차량 등록 시 차량번호 중복 메시지가 계속 표시됩니다.',
  },
  {
    id: 'INQ-3048',
    title: '아파트 비밀번호 재발급 요청',
    writer: '최하나',
    apartmentName: '라온타워',
    category: '계정 문의',
    status: 'answered',
    createdAt: '2026-04-27',
    content: '주민 회원가입에 사용하는 아파트 비밀번호를 재발급받고 싶습니다.',
    answer: '관리자 본인 확인 후 아파트 비밀번호를 발급했습니다.',
  },
];

export function findWebAdminInquiryById(id) {
  return webAdminInquiries.find((inquiry) => inquiry.id === id);
}
