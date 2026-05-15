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
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';

export default function ResidentInquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { findResidentParkingInquiryById, answerResidentParkingInquiry } = useApartmentManager();
  const inquiry = findResidentParkingInquiryById(id);
  const [answer, setAnswer] = useState(inquiry?.answer || '');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  if (!inquiry) {
    return (
      <AdminLayout
        roleLabel="아파트 관리자"
        consoleTitle="아파트 관리자 콘솔"
        userName="한빛아파트 관리자"
        menus={apartmentManagerMenus}
      >
        <PageTitle title="주민 문의 상세" description="요청한 주민 문의 정보를 찾을 수 없습니다." />
        <SectionCard title="데이터 없음">
          <Link className="text-link" to="/apartment-manager/resident-inquiries">
            목록으로 돌아가기
          </Link>
        </SectionCard>
      </AdminLayout>
    );
  }

  const handleSubmit = () => {
    if (!answer.trim()) {
      setError('답변 내용을 입력하세요.');
      return;
    }

    answerResidentParkingInquiry(inquiry.id, answer.trim());
    setToastMessage('주민 문의 답변이 등록되었습니다.');
    navigate('/apartment-manager/resident-inquiries');
  };

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="한빛아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle title="주민 문의 상세 및 답변" description="주민이 앱에서 보낸 문의를 확인하고 답변을 등록합니다." />

      <SectionCard title="주민 문의 상세" description="문의 정보와 차량 정보를 확인한 뒤 답변을 작성합니다.">
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
          <Button onClick={handleSubmit}>답변 등록</Button>
        </div>
      </SectionCard>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
