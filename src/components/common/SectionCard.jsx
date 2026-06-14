export default function SectionCard({ title, headerAction, children, className = '' }) {
  return (
    <section className={`section-card ${className}`.trim()}>
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
