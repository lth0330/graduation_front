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
import { useWebAdmin } from '../../contexts/WebAdminContext.jsx';
import { webAdminMenus } from '../../data/navigation.js';

export default function SignupApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    findSignupRequestById,
    isSignupRequestsLoading,
    signupRequestsError,
    approveSignupRequest,
    rejectSignupRequest,
  } = useWebAdmin();
  const request = findSignupRequestById(id);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await approveSignupRequest(request.id);
      navigate('/web-admin/signup-approvals');
    } catch (error) {
      setToastType('error');
      setToastMessage('가입 신청 승인에 실패했습니다. 서버 상태를 확인하세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (reason) => {
    try {
      setIsSubmitting(true);
      await rejectSignupRequest(request.id, reason);
      setIsRejectModalOpen(false);
      navigate('/web-admin/signup-approvals');
    } catch (error) {
      setToastType('error');
      setToastMessage('가입 신청 반려에 실패했습니다. 서버 상태를 확인하세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSignupRequestsLoading) {
    return (
      <AdminLayout
        roleLabel="웹 관리자"
        consoleTitle="웹 관리자 콘솔"
        userName="최고관리자"
        menus={webAdminMenus}
      >
        <PageTitle title="가입 신청 상세" description="가입 신청 정보를 불러오고 있습니다." />
        <SectionCard title="신청 정보">
          <LoadingState message="가입 신청 상세 불러오는 중" />
        </SectionCard>
      </AdminLayout>
    );
  }

  if (signupRequestsError) {
    return (
      <AdminLayout
        roleLabel="웹 관리자"
        consoleTitle="웹 관리자 콘솔"
        userName="최고관리자"
        menus={webAdminMenus}
      >
        <PageTitle title="가입 신청 상세" description="가입 신청 정보를 불러오지 못했습니다." />
        <SectionCard title="조회 실패">
          <EmptyState title="상세 조회 실패" description={signupRequestsError} />
          <div className="detail-actions">
            <Link to="/web-admin/signup-approvals">
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
        roleLabel="웹 관리자"
        consoleTitle="웹 관리자 콘솔"
        userName="최고관리자"
        menus={webAdminMenus}
      >
        <PageTitle title="가입 신청 상세" description="요청한 가입 신청 정보를 찾을 수 없습니다." />
        <SectionCard title="데이터 없음">
          <Link className="text-link" to="/web-admin/signup-approvals">
            목록으로 돌아가기
          </Link>
        </SectionCard>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      roleLabel="웹 관리자"
      consoleTitle="웹 관리자 콘솔"
      userName="최고관리자"
      menus={webAdminMenus}
    >
      <PageTitle
        title="가입 신청 상세"
        description="아파트 관리자 가입 신청 정보를 확인하고 승인 또는 거절합니다."
      />

      <SectionCard title="신청 정보" description="승인하면 아파트 관리자 계정이 활성화됩니다.">
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
            <dt>아이디</dt>
            <dd>{request.loginId}</dd>
          </div>
          <div>
            <dt>이메일</dt>
            <dd>{request.email}</dd>
          </div>
          <div>
            <dt>신청자</dt>
            <dd>{request.applicantName}</dd>
          </div>
          <div>
            <dt>아파트 이름</dt>
            <dd>{request.apartmentName}</dd>
          </div>
          <div className="detail-wide">
            <dt>아파트 주소</dt>
            <dd>{request.address}</dd>
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
          <Link to="/web-admin/signup-approvals">
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
