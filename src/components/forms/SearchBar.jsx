import Button from '../common/Button.jsx';
import TextInput from './TextInput.jsx';

export default function SearchBar({ placeholder, buttonLabel = '검색', value = '', onChange, onSearch }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSearch?.();
    }
  };

  return (
    <div className="search-bar">
      <TextInput
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button variant="secondary" onClick={onSearch}>
        {buttonLabel}
      </Button>
    </div>
  );
}
