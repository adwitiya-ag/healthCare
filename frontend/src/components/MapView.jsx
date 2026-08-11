import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored marker
const createIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    width:16px;height:16px;border-radius:50%;background:${color};
    border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);
    position:relative;
  "><div style="
    position:absolute;top:50%;left:50%;transform:translate(-50%,calc(-100% - 6px));
    width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;
    border-top:8px solid ${color};
  "></div></div>`,
  iconSize: [16, 24],
  iconAnchor: [8, 24],
});

const MR_COLORS = ['#2563eb','#16a34a','#d97706','#dc2626','#7c3aed'];

export default function MapView({ markers = [], center = [20.5937, 78.9629], zoom = 5, height = '400px' }) {
  return (
    <div className="rounded-xl overflow-hidden border border-surface-border" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, i) => (
          <Marker key={m.id || i} position={[m.lat, m.lng]} icon={createIcon(MR_COLORS[i % MR_COLORS.length])}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{m.name}</p>
                {m.city && <p className="text-slate-500">{m.city} · {m.area}</p>}
                {m.lastSeen && <p className="text-slate-400 text-xs mt-1">Last seen: {m.lastSeen}</p>}
              </div>
            </Popup>
            <Circle center={[m.lat, m.lng]} radius={500} pathOptions={{ color: MR_COLORS[i % MR_COLORS.length], fillOpacity: 0.05, weight: 1 }} />
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
