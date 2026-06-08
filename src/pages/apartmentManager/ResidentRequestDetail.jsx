import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import RejectReasonModal from '../../components/feedback/RejectReasonModal.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import useAutoRefresh from '../../hooks/useAutoRefresh.js';

export default function ResidentRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    findResidentSignupRequestById,
    isResidentRequestsLoading,
    residentRequestsError,
    approveResidentSignupRequest,
    rejectResidentSignupRequest,
    refreshResidentSignupRequests,
  } = useApartmentManager();
  const request = findResidentSignupRequestById(id);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAutoRefresh(
    () => refreshResidentSignupRequests({ silent: true }),
    10000,
    !isRejectModalOpen && !isSubmitting,
  );

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await approveResidentSignupRequest(request.id);
      navigate('/apartment-manager/resident-requests');
    } catch (error) {
      setToastType('error');
      setToastMessage('주민 가입 신청 승인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (reason) => {
    try {
      setIsSubmitting(true);
      await rejectResidentSignupRequest(request.id, reason);
      setIsRejectModalOpen(false);
      navigate('/apartment-manager/resident-requests');
    } catch (error) {
      setToastType('error');
      setToastMessage('주민 가입 신청 반려에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isResidentRequestsLoading) {
    return (
      <AdminLayout
        roleLabel="아파트 관리자"
        consoleTitle="아파트 관리자 콘솔"
        userName="아파트 관리자"
        menus={apartmentManagerMenus}
      >
        <PageTitle title="주민 신청 상세" description="주민 신청 정보를 불러오고 있습니다." />
        <SectionCard title="신청 정보">
          <LoadingState message="주민 신청 상세 불러오는 중" />
        </SectionCard>
      </AdminLayout>
    );
  }

  if (residentRequestsError) {
    return (
      <AdminLayout
        roleLabel="아파트 관리자"
        consoleTitle="아파트 관리자 콘솔"
        userName="아파트 관리자"
        menus={apartmentManagerMenus}
      >
        <PageTitle title="주민 신청 상세" description="주민 신청 정보를 불러오지 못했습니다." />
        <SectionCard title="조회 실패">
          <EmptyState title="상세 조회 실패" description={residentRequestsError} />
          <div className="detail-actions">
            <Link to="/apartment-manager/resident-requests">
              <Button variant="secondary">목록으로</Button>
            </Link>
          </div>
        </SectionCard>
      </AdminLayout>
    );
  }

  if (!request) {
    return (
      <AdminLayout
        roleLabel="아파트 관리자"
        consoleTitle="아파트 관리자 콘솔"
        userName="아파트 관리자"
        menus={apartmentManagerMenus}
      >
        <PageTitle title="주민 신청 상세" description="요청한 주민 신청 정보를 찾을 수 없습니다." />
        <SectionCard title="데이터 없음">
          <Link className="text-link" to="/apartment-manager/resident-requests">
            목록으로 돌아가기
          </Link>
        </SectionCard>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="주민 회원가입 신청 상세"
        description="주민 정보와 차량 정보를 확인한 뒤 승인 또는 거절을 처리합니다."
      />

      <SectionCard title="신청 정보" description="승인하면 주민 계정이 활성화됩니다.">
        <dl className="detail-list">
          <div>
            <dt>신청 ID</dt>
            <dd>{request.id}</dd>
          </div>
          <div>
            <dt>신청 상태</dt>
            <dd>
              <Badge status={request.status} />
            </dd>
          </div>
          <div>
            <dt>이름</dt>
            <dd>{request.name}</dd>
          </div>
          <div>
            <dt>아이디</dt>
            <dd>{request.loginId}</dd>
          </div>
          <div>
            <dt>이메일</dt>
            <dd>{request.email}</dd>
          </div>
          <div>
            <dt>동/호수</dt>
            <dd>
              {request.building}동 {request.unit}호
            </dd>
          </div>
          <div>
            <dt>차량번호</dt>
            <dd>{request.carNumber}</dd>
          </div>
          <div>
            <dt>차량 종류</dt>
            <dd>{request.carType}</dd>
          </div>
          <div>
            <dt>신청일</dt>
            <dd>{request.requestedAt}</dd>
          </div>
          {request.rejectReason && (
            <div className="detail-wide">
              <dt>반려 사유</dt>
              <dd>{request.rejectReason}</dd>
            </div>
          )}
        </dl>

        <div className="detail-actions">
          <Link to="/apartment-manager/resident-requests">
            <Button variant="secondary">목록으로</Button>
          </Link>
          <Button variant="danger" disabled={isSubmitting} onClick={() => setIsRejectModalOpen(true)}>
            거절
          </Button>
          <Button disabled={isSubmitting} onClick={handleApprove}>
            {isSubmitting ? '처리 중...' : '승인'}
          </Button>
        </div>
      </SectionCard>

      <RejectReasonModal
        open={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
      />
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
