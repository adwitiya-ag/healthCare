import PageHeader from '../../components/PageHeader';
import MapView from '../../components/MapView';
import { mockMRs } from '../../mocks/mockMRs';

export default function LiveTracking() {
  const markers = mockMRs.filter(m => m.active).map(m => ({
    id: m.id, name: m.name, lat: m.lat, lng: m.lng,
    city: m.city, area: m.area, lastSeen: 'Just now',
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Live MR Tracking"
        subtitle="Real-time field representative locations"
        action={
          <span className="badge badge-success text-sm px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            {markers.length} MRs Online
          </span>
        }
      />

      {/* MR Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {markers.map((m, i) => {
          const colors = ['#2563eb','#16a34a','#d97706','#dc2626','#7c3aed'];
          return (
            <div key={m.id} className="card px-3 py-2 flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full" style={{ background: colors[i % colors.length] }} />
              <span className="font-medium">{m.name}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{m.city}, {m.area}</span>
            </div>
          );
        })}
      </div>

      <MapView markers={markers} zoom={5} height="500px" />
    </div>
  );
}
