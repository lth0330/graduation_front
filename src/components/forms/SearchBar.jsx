import Button from '../common/Button.jsx';
import TextInput from './TextInput.jsx';

export default function SearchBar({ placeholder, buttonLabel = '검색', value = '', onChange }) {
  return (
    <div className="search-bar">
      <TextInput placeholder={placeholder} value={value} onChange={(event) => onChange?.(event.target.value)} />
      <Button variant="secondary">{buttonLabel}</Button>
    </div>
  );
}
