export default function StatusBadge({ active, activeLabel = 'Active', inactiveLabel = 'Inactive' }) {
  return (
    <span className={`badge ${active ? 'badge-success' : 'badge-danger'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-success' : 'bg-danger'}`} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
