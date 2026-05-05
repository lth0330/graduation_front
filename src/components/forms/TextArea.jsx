export default function TextArea({ error = false, rows = 5, ...props }) {
  return <textarea className={`form-control textarea ${error ? 'is-error' : ''}`} rows={rows} {...props} />;
}
