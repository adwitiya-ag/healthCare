import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters = [], // [{ id, label, value, options: [{value, label}], onChange }]
  onClear,
}) {
  const hasActive = searchValue || filters.some(f => f.value);

  return (
    <div className="card p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="filter-search"
            type="text"
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="form-input pl-9"
          />
          {searchValue && (
            <button id="clear-search" onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown filters */}
        {filters.map(f => (
          <select
            key={f.id}
            id={`filter-${f.id}`}
            value={f.value}
            onChange={e => f.onChange(e.target.value)}
            className="form-select w-full sm:w-48"
          >
            <option value="">All {f.label}s</option>
            {f.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ))}

        {/* Clear */}
        {hasActive && (
          <button id="filter-clear" onClick={onClear} className="btn-secondary flex items-center gap-2 shrink-0">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {hasActive && (
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Active filters:</span>
          {searchValue && <span className="badge badge-info">Search: "{searchValue}"</span>}
          {filters.filter(f => f.value).map(f => (
            <span key={f.id} className="badge badge-info">{f.label}: {f.value}</span>
          ))}
        </div>
      )}
    </div>
  );
}
