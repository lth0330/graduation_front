import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import FormField from '../../components/forms/FormField.jsx';
import TextArea from '../../components/forms/TextArea.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useWebAdmin } from '../../contexts/WebAdminContext.jsx';
import { webAdminMenus } from '../../data/navigation.js';

export default function WebAdminInquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { findWebAdminInquiryById, answerWebAdminInquiry } = useWebAdmin();
  const inquiry = findWebAdminInquiryById(id);
  const [answer, setAnswer] = useState(inquiry?.answer || '');
  const [status, setStatus] = useState(inquiry?.status);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  if (!inquiry) {
    return (
      <AdminLayout
        roleLabel="웹 관리자"
        consoleTitle="웹 관리자 콘솔"
        userName="웹 관리자"
        menus={webAdminMenus}
      >
        <PageTitle title="문의 상세" description="요청한 문의 정보를 찾을 수 없습니다." />
        <SectionCard title="데이터 없음">
          <Link className="text-link" to="/web-admin/inquiries">
            목록으로 돌아가기
          </Link>
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
      await answerWebAdminInquiry(inquiry.id, answer.trim());
      setStatus('answered');
      setToastMessage('답변이 등록되었습니다.');
      navigate('/web-admin/inquiries');
    } catch (error) {
      setToastMessage('답변 등록에 실패했습니다. 잠시 후 다시 시도하세요.');
    }
  };

  return (
    <AdminLayout
      roleLabel="웹 관리자"
      consoleTitle="웹 관리자 콘솔"
      userName="웹 관리자"
      menus={webAdminMenus}
    >
      <PageTitle
        title="문의 상세 및 답변"
        description="서비스 신청, 문제 발생, 가격 문의 내용을 확인하고 답변을 등록합니다."
      />

      <SectionCard title="문의 정보" description="문의 정보를 확인한 뒤 하단 답변 입력 영역에 답변을 작성합니다.">
        <dl className="detail-list">
          <div>
            <dt>문의 ID</dt>
            <dd>{inquiry.id}</dd>
          </div>
          <div>
            <dt>답변 상태</dt>
            <dd>
              <Badge status={status}>{status === 'answered' ? '답변 완료' : '답변 대기'}</Badge>
            </dd>
          </div>
          <div>
            <dt>문의 제목</dt>
            <dd>{inquiry.title}</dd>
          </div>
          <div>
            <dt>문의 카테고리</dt>
            <dd>{inquiry.category}</dd>
          </div>
          <div>
            <dt>작성자</dt>
            <dd>{inquiry.writer}</dd>
          </div>
          <div>
            <dt>아파트 이름</dt>
            <dd>{inquiry.apartmentName}</dd>
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
          <Link to="/web-admin/inquiries">
            <Button variant="secondary">목록으로</Button>
          </Link>
          <Button onClick={handleSubmit}>답변 등록</Button>
        </div>
      </SectionCard>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
