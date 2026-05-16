import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import FormField from '../../components/forms/FormField.jsx';
import SelectBox from '../../components/forms/SelectBox.jsx';
import TextArea from '../../components/forms/TextArea.jsx';
import TextInput from '../../components/forms/TextInput.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';

const defaultCategory = '서비스 요청';

export default function InquiryWrite() {
  const { createManagerInquiry } = useApartmentManager();
  const [form, setForm] = useState({ title: '', category: defaultCategory, content: '' });
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm({ title: '', category: defaultCategory, content: '' });
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setToastMessage('문의 제목과 내용을 입력하세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createManagerInquiry({
        title: form.title.trim(),
        category: form.category,
        content: form.content.trim(),
      });
      resetForm();
      setToastMessage('문의가 등록되었습니다.');
    } catch (error) {
      setToastMessage('문의 등록에 실패했습니다. 잠시 후 다시 시도하세요.');
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
      <PageTitle
        title="문의 작성"
        description="서비스 요청, 문제 발생, 가격 문의 등을 웹 관리자에게 전달합니다."
      />

      <SectionCard title="웹 관리자에게 문의하기" description="문의 등록 후 답변 상태는 답변 대기로 표시됩니다.">
        <div className="form-grid">
          <FormField label="문의 제목">
            <TextInput value={form.title} onChange={(event) => handleChange('title', event.target.value)} />
          </FormField>
          <FormField label="문의 카테고리">
            <SelectBox value={form.category} onChange={(event) => handleChange('category', event.target.value)}>
              <option value="서비스 요청">서비스 요청</option>
              <option value="서비스 문제">서비스 문제</option>
              <option value="가격 문의">가격 문의</option>
              <option value="계정 문의">계정 문의</option>
            </SelectBox>
          </FormField>
        </div>
        <div className="answer-form">
          <FormField label="문의 내용">
            <TextArea value={form.content} onChange={(event) => handleChange('content', event.target.value)} />
          </FormField>
        </div>
        <div className="detail-actions">
          <Button variant="secondary" onClick={resetForm}>
            취소
          </Button>
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? '등록 중...' : '문의 등록'}
          </Button>
        </div>
      </SectionCard>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
