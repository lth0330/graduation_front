import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  approveSignupRequest as approveSignupRequestApi,
  getSignupRequests,
  rejectSignupRequest as rejectSignupRequestApi,
} from '../api/webAdminApi.js';
import {
  answerWebAdminInquiry as answerWebAdminInquiryApi,
  getWebAdminInquiries,
} from '../api/inquiryApi.js';
import { authRoles, getValidAuthSession } from '../utils/auth.js';
import { sortByNewest } from '../utils/listOrdering.js';

const WebAdminContext = createContext(null);

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

function mapSignupRequest(apiRequest) {
  return {
    id: String(apiRequest.managerNo),
    managerNo: apiRequest.managerNo,
    apartmentNo: apiRequest.apartmentNo,
    loginId: apiRequest.loginId,
    email: apiRequest.email,
    phone: apiRequest.phone,
    apartmentName: apiRequest.apartmentName,
    address: apiRequest.address,
    applicantName: apiRequest.name,
    picture: apiRequest.picture,
    status: statusMap[apiRequest.approvalStatus] || 'pending',
    rejectReason: apiRequest.rejectReason || '',
    requestedAt: formatDate(apiRequest.requestedAt),
    approvedAt: formatDate(apiRequest.approvedAt),
  };
}

function mapWebAdminInquiry(apiInquiry) {
  return {
    id: String(apiInquiry.inquiryNo),
    inquiryNo: apiInquiry.inquiryNo,
    title: apiInquiry.title,
    category: apiInquiry.category,
    content: apiInquiry.content,
    status: apiInquiry.status,
    answer: apiInquiry.answer || '',
    writer: apiInquiry.writer,
    apartmentName: apiInquiry.apartmentName,
    createdAt: formatDate(apiInquiry.createdAt),
    answeredAt: formatDate(apiInquiry.answeredAt),
  };
}

export function WebAdminProvider({ children }) {
  const [signupRequests, setSignupRequests] = useState([]);
  const [isSignupRequestsLoading, setIsSignupRequestsLoading] = useState(false);
  const [signupRequestsError, setSignupRequestsError] = useState('');
  const [webAdminInquiries, setWebAdminInquiries] = useState([]);
  const [isWebAdminInquiriesLoading, setIsWebAdminInquiriesLoading] = useState(false);
  const [webAdminInquiriesError, setWebAdminInquiriesError] = useState('');

  const refreshSignupRequests = async () => {
    try {
      setIsSignupRequestsLoading(true);
      setSignupRequestsError('');

      const requests = await getSignupRequests();
      setSignupRequests(sortByNewest(requests.map(mapSignupRequest)));
    } catch (error) {
      setSignupRequestsError('가입 신청 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setIsSignupRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (getValidAuthSession(authRoles.WEB_ADMIN)) {
      refreshSignupRequests();
    }
  }, []);

  const refreshWebAdminInquiries = async () => {
    try {
      setIsWebAdminInquiriesLoading(true);
      setWebAdminInquiriesError('');

      const inquiries = await getWebAdminInquiries();
      setWebAdminInquiries(sortByNewest(inquiries.map(mapWebAdminInquiry)));
    } catch (error) {
      setWebAdminInquiriesError('문의 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setIsWebAdminInquiriesLoading(false);
    }
  };

  useEffect(() => {
    if (getValidAuthSession(authRoles.WEB_ADMIN)) {
      refreshWebAdminInquiries();
    }
  }, []);

  useEffect(() => {
    const handleAuthSessionChanged = (event) => {
      if (event.detail?.role === authRoles.WEB_ADMIN) {
        refreshSignupRequests();
        refreshWebAdminInquiries();
      }
    };

    window.addEventListener('auth-session-changed', handleAuthSessionChanged);
    return () => window.removeEventListener('auth-session-changed', handleAuthSessionChanged);
  }, []);

  const approveSignupRequest = async (id) => {
    await approveSignupRequestApi(id);
    await refreshSignupRequests();
  };

  const rejectSignupRequest = async (id, rejectReason) => {
    await rejectSignupRequestApi(id, rejectReason);
    await refreshSignupRequests();
  };

  const answerWebAdminInquiry = async (id, answer) => {
    const answeredInquiry = await answerWebAdminInquiryApi(id, answer);
    await refreshWebAdminInquiries();
    return mapWebAdminInquiry(answeredInquiry);
  };

  const value = useMemo(
    () => ({
      signupRequests,
      isSignupRequestsLoading,
      signupRequestsError,
      webAdminInquiries,
      isWebAdminInquiriesLoading,
      webAdminInquiriesError,
      findSignupRequestById: (id) => signupRequests.find((request) => request.id === id),
      findWebAdminInquiryById: (id) => webAdminInquiries.find((inquiry) => inquiry.id === id),
      refreshSignupRequests,
      refreshWebAdminInquiries,
      approveSignupRequest,
      rejectSignupRequest,
      answerWebAdminInquiry,
    }),
    [
      signupRequests,
      isSignupRequestsLoading,
      signupRequestsError,
      webAdminInquiries,
      isWebAdminInquiriesLoading,
      webAdminInquiriesError,
    ],
  );

  return <WebAdminContext.Provider value={value}>{children}</WebAdminContext.Provider>;
}

export function useWebAdmin() {
  const context = useContext(WebAdminContext);

  if (!context) {
    throw new Error('useWebAdmin must be used inside WebAdminProvider.');
  }

  return context;
}
