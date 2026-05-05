export default function TextInput({ error = false, ...props }) {
  return <input className={`form-control ${error ? 'is-error' : ''}`} {...props} />;
}
