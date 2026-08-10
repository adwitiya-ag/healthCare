import { useState } from 'react';
import { MapPin, Wifi, WifiOff, Navigation } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';

export default function LocationToggle() {
  const { user } = useAuth();
  const [tracking, setTracking] = useState(false);
  const [coords, setCoords] = useState({ lat: user?.lat || 0, lng: user?.lng || 0 });

  const toggle = () => {
    if (!tracking) {
      // Mock: slightly jitter the mock coordinates
      setCoords({
        lat: (user?.lat || 19.1136) + (Math.random() - 0.5) * 0.01,
        lng: (user?.lng || 72.8697) + (Math.random() - 0.5) * 0.01,
      });
    }
    setTracking(v => !v);
  };

  return (
    <div className="animate-fade-in max-w-lg">
      <PageHeader title="Live Location" subtitle="Manage your location sharing with the manager" />

      <div className="card p-6 space-y-6">
        {/* Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-surface-border">
          <div className="flex items-center gap-3">
            {tracking ? <Wifi className="w-5 h-5 text-success" /> : <WifiOff className="w-5 h-5 text-slate-400" />}
            <div>
              <p className="font-medium text-slate-800">Live Location Tracking</p>
              <p className="text-sm text-slate-500">{tracking ? 'Your location is being shared with the manager' : 'Location sharing is off'}</p>
            </div>
          </div>
          <button
            id="location-toggle"
            onClick={toggle}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${tracking ? 'bg-success' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${tracking ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Status indicators */}
        {tracking && (
          <div className="space-y-3 animate-slide-in">
            <div className="flex items-center gap-2 text-success text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live — broadcasting every 30 seconds
            </div>
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Navigation className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Current Position</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-green-600 text-xs">Latitude</p>
                  <p className="font-mono text-green-900">{coords.lat.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-green-600 text-xs">Longitude</p>
                  <p className="font-mono text-green-900">{coords.lng.toFixed(6)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-green-600 text-xs">City / Area</p>
                  <p className="font-medium text-green-900">{user?.city}, {user?.area}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!tracking && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">Enable location tracking to let your manager see your current field position on the live map.</p>
          </div>
        )}

        {/* Privacy note */}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
          🔒 Your location is only shared with your direct manager during active tracking. It is not stored permanently.
        </div>
      </div>
    </div>
  );
}
