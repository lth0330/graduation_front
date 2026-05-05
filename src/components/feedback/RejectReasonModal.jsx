import { useState } from 'react';
import Button from '../common/Button.jsx';
import FormField from '../forms/FormField.jsx';
import TextArea from '../forms/TextArea.jsx';

export default function RejectReasonModal({ open, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!open) {
    return null;
  }

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('반려 사유를 입력하세요.');
      return;
    }

    onConfirm(reason.trim());
    setReason('');
    setError('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
        <h2 id="reject-modal-title">반려 사유 입력</h2>
        <p>반려 사유는 신청자에게 안내됩니다.</p>

        <FormField label="반려 사유" error={error}>
          <TextArea
            error={Boolean(error)}
            placeholder="예: 아파트 주소 확인이 필요합니다."
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              if (error) {
                setError('');
              }
            }}
          />
        </FormField>

        <div className="modal-actions">
          <Button variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            반려 처리
          </Button>
        </div>
      </section>
    </div>
  );
}
