const statusLabelMap = {
  pending: '승인 대기',
  approved: '승인 완료',
  rejected: '거절',
  answered: '답변 완료',
  active: '활성',
  inactive: '비활성',
};

export default function Badge({ status = 'pending', children }) {
  return <span className={`status-badge badge-${status}`}>{children || statusLabelMap[status]}</span>;
}
