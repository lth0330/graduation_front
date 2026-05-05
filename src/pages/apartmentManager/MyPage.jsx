import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';

export default function MyPage() {
  const { apartmentManagerProfile } = useApartmentManager();
  const [toastMessage, setToastMessage] = useState('');

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(apartmentManagerProfile.apartmentPassword);
      setToastMessage('아파트 비밀번호가 복사되었습니다.');
    } catch {
      setToastMessage(`아파트 비밀번호: ${apartmentManagerProfile.apartmentPassword}`);
    }
  };

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="한빛아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle title="아파트 관리자 정보" description="아파트 관리자 계정과 아파트 인증 정보를 확인합니다." />

      <SectionCard title="기본 정보">
        <dl className="detail-list">
          <div>
            <dt>관리자 아이디</dt>
            <dd>{apartmentManagerProfile.loginId}</dd>
          </div>
          <div>
            <dt>이메일</dt>
            <dd>{apartmentManagerProfile.email}</dd>
          </div>
          <div>
            <dt>아파트 이름</dt>
            <dd>{apartmentManagerProfile.apartmentName}</dd>
          </div>
          <div className="detail-wide">
            <dt>아파트 주소</dt>
            <dd>{apartmentManagerProfile.address}</dd>
          </div>
          <div>
            <dt>아파트 비밀번호</dt>
            <dd className="password-row">
              <strong>{apartmentManagerProfile.apartmentPassword}</strong>
              <Button variant="secondary" size="small" onClick={handleCopyPassword}>
                복사
              </Button>
            </dd>
          </div>
        </dl>

        <div className="info-box">
          <strong>주민에게 이 비밀번호를 전달하세요.</strong>
          <p>
            주민은 회원가입 또는 아파트 인증 과정에서 이 6자리 아파트 비밀번호를 입력해야 합니다.
            외부인에게 노출되지 않도록 관리하세요.
          </p>
        </div>

        <div className="info-box muted">
          <strong>사용 위치</strong>
          <p>주민 회원가입 화면 → 아파트 인증 단계 → 아파트 비밀번호 입력</p>
        </div>
      </SectionCard>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
