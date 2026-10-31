import EmptyState from '../feedback/EmptyState.jsx';
import LoadingState from '../feedback/LoadingState.jsx';

export default function DataTable({
  columns,
  rows,
  rowKey = 'id',
  emptyMessage = '표시할 데이터가 없습니다.',
  loading = false,
  startIndex = 0,
}) {
  // key가 'id'인 열은 실제 DB 번호가 아니라 화면 목록의 순번(startIndex + 1부터)을 보여 준다.
  // 그래서 열 이름은 '번호'로 쓴다 (예전 'OO ID'는 실제 번호로 오해할 수 있었음)
  const getColumnClassName = (column) =>
    [column.key === 'id' ? 'table-index-column' : '', column.className || ''].filter(Boolean).join(' ') || undefined;

  if (loading) {
    return <LoadingState />;
  }

  if (!rows.length) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th className={getColumnClassName(column)} key={column.key}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row[rowKey] || rowIndex}>
              {columns.map((column) => (
                <td className={getColumnClassName(column)} key={column.key}>
                  {column.render ? column.render(row) : column.key === 'id' ? startIndex + rowIndex + 1 : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
