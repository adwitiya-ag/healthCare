export default function SummaryCard({ icon: Icon, label, value, trend, color = 'blue', id }) {
  const colorMap = {
    blue:   { bg: 'bg-primary-50',  icon: 'bg-primary-600 text-white', trend: 'text-primary-600' },
    green:  { bg: 'bg-green-50',    icon: 'bg-green-600 text-white',   trend: 'text-green-600' },
    orange: { bg: 'bg-orange-50',   icon: 'bg-orange-500 text-white',  trend: 'text-orange-600' },
    purple: { bg: 'bg-purple-50',   icon: 'bg-purple-600 text-white',  trend: 'text-purple-600' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div id={id} className="card-hover p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {trend && <p className={`text-xs font-medium mt-1 ${c.trend}`}>{trend}</p>}
      </div>
    </div>
  );
}
