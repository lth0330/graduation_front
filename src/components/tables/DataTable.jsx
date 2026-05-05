import EmptyState from '../feedback/EmptyState.jsx';
import LoadingState from '../feedback/LoadingState.jsx';

export default function DataTable({
  columns,
  rows,
  rowKey = 'id',
  emptyMessage = '표시할 데이터가 없습니다.',
  loading = false,
}) {
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
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row[rowKey] || rowIndex}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
