export default function PageTitle({ title, description }) {
  return (
    <div className="page-title">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
