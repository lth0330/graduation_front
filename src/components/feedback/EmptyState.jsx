// 설명은 넘겼을 때만 보여 준다. 예전 기본 문구("조건을 변경하거나 새 데이터를 등록하세요.")는
// 번호판 보정·알림처럼 사용자가 등록할 수 없는 목록에서도 나와 어색했음
export default function EmptyState({ title = '데이터가 없습니다.', description = '' }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {description && <p>{description}</p>}
    </div>
  );
}
