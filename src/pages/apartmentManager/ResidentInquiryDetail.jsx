import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import FormField from '../../components/forms/FormField.jsx';
import TextArea from '../../components/forms/TextArea.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import useAutoRefresh from '../../hooks/useAutoRefresh.js';

export default function ResidentInquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    findResidentParkingInquiryById,
    answerResidentParkingInquiry,
    residentParkingInquiriesError,
    refreshResidentParkingInquiries,
  } = useApartmentManager();
  const inquiry = findResidentParkingInquiryById(id);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAutoRefresh(() => refreshResidentParkingInquiries({ silent: true }), 10000, !isSubmitting);

  useEffect(() => {
    refreshResidentParkingInquiries();
  }, []);

  useEffect(() => {
    setAnswer(inquiry?.answer || '');
  }, [inquiry?.answer]);

  if (!inquiry) {
    return (
      <AdminLayout
        roleLabel="아파트 관리자"
        consoleTitle="아파트 관리자 콘솔"
        userName="아파트 관리자"
        menus={apartmentManagerMenus}
      >
        <PageTitle title="입주민 문의 상세" description="요청한 입주민 문의 정보를 찾을 수 없습니다." />
        <SectionCard title="데이터 없음">
          <EmptyState
            title={residentParkingInquiriesError ? '입주민 문의 조회 실패' : '입주민 문의가 없습니다.'}
            description={residentParkingInquiriesError || '목록에서 문의를 다시 선택하세요.'}
          />
          <div className="detail-actions">
            <Link to="/apartment-manager/resident-inquiries">
              <Button variant="secondary">목록으로</Button>
            </Link>
          </div>
        </SectionCard>
      </AdminLayout>
    );
  }

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError('답변 내용을 입력하세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await answerResidentParkingInquiry(inquiry.id, answer.trim());
      setToastMessage('입주민 문의 답변이 등록되었습니다.');
      navigate('/apartment-manager/resident-inquiries');
    } catch (submitError) {
      setError('답변 등록에 실패했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle title="입주민 문의 상세 및 답변" description="입주민이 보낸 문의를 확인하고 답변을 등록합니다." />

      <SectionCard title="입주민 문의 상세">
        <dl className="detail-list">
          <div>
            <dt>문의 ID</dt>
            <dd>{inquiry.id}</dd>
          </div>
          <div>
            <dt>답변 상태</dt>
            <dd>
              <Badge status={inquiry.status}>{inquiry.status === 'answered' ? '답변 완료' : '답변 대기'}</Badge>
            </dd>
          </div>
          <div>
            <dt>문의 제목</dt>
            <dd>{inquiry.title}</dd>
          </div>
          <div>
            <dt>작성자</dt>
            <dd>{inquiry.writer}</dd>
          </div>
          <div>
            <dt>동/호수</dt>
            <dd>
              {inquiry.building}동 {inquiry.unit}호
            </dd>
          </div>
          <div>
            <dt>차량번호</dt>
            <dd>{inquiry.carNumber}</dd>
          </div>
          <div>
            <dt>작성일</dt>
            <dd>{inquiry.createdAt}</dd>
          </div>
          <div className="detail-wide">
            <dt>문의 내용</dt>
            <dd>{inquiry.content}</dd>
          </div>
        </dl>

        <div className="answer-form">
          <FormField label="답변 입력" error={error}>
            <TextArea
              error={Boolean(error)}
              placeholder="답변 내용을 입력하세요."
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                if (error) {
                  setError('');
                }
              }}
            />
          </FormField>
        </div>

        <div className="detail-actions">
          <Link to="/apartment-manager/resident-inquiries">
            <Button variant="secondary">목록으로</Button>
          </Link>
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? '등록 중...' : '답변 등록'}
          </Button>
        </div>
      </SectionCard>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
