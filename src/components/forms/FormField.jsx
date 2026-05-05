export default function FormField({ label, error, helper, children }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {error && <small className="form-error">{error}</small>}
      {!error && helper && <small className="form-helper">{helper}</small>}
    </label>
  );
}
