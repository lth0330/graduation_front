export default function SectionCard({ title, headerAction, children }) {
  return (
    <section className="section-card">
      <div className="section-card-header">
        <div>
          <h2>{title}</h2>
        </div>
        {headerAction && <div className="section-card-action">{headerAction}</div>}
      </div>
      {children}
    </section>
  );
}
