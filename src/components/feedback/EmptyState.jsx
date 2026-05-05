export default function EmptyState({ title = '데이터가 없습니다.', description = '조건을 변경하거나 새 데이터를 등록하세요.' }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
