import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import useUIStore from '../../store/useUIStore';
import './UI.css';

function SearchBar({ className = '' }) {
  const inputRef = useRef(null);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const clearSearch = useUIStore((s) => s.clearSearch);

  const handleClear = () => {
    clearSearch();
    inputRef.current?.focus();
  };

  return (
    <div className={`search-bar ${className}`}>
      <Search className="search-bar__icon" size={18} />
      <input
        ref={inputRef}
        type="text"
        className="search-bar__input"
        placeholder="Buscar no portfólio..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button
          className="search-bar__clear"
          onClick={handleClear}
          aria-label="Limpar busca"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
