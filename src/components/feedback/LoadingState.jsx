export default function LoadingState({ message = '목록을 불러오는 중' }) {
  return (
    <div className="loading-state">
      <div className="loading-line" />
      <div className="loading-line short" />
      <p>{message}</p>
    </div>
  );
}
