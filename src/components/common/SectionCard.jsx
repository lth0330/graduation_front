export default function SectionCard({ title, description, headerAction, children }) {
  return (
    <section className="section-card">
      <div className="section-card-header">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {headerAction && <div className="section-card-action">{headerAction}</div>}
      </div>
      {children}
    </section>
  );
}
