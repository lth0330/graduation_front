export default function SelectBox({ children, error = false, ...props }) {
  return (
    <select className={`form-control ${error ? 'is-error' : ''}`} {...props}>
      {children}
    </select>
  );
}
