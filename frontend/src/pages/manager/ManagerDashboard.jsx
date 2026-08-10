import { useEffect, useState } from 'react';
import { Users, FlaskConical, UserCheck, CalendarCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SummaryCard from '../../components/SummaryCard';
import MapView from '../../components/MapView';
import { mockDoctors } from '../../mocks/mockDoctors';
import { mockChemists } from '../../mocks/mockChemists';
import { mockMRs } from '../../mocks/mockMRs';
import { visitsApi } from '../../api/visitsApi';

const chartData = [
  { day: 'Mon', visits: 8 }, { day: 'Tue', visits: 12 }, { day: 'Wed', visits: 6 },
  { day: 'Thu', visits: 15 }, { day: 'Fri', visits: 10 }, { day: 'Sat', visits: 4 }, { day: 'Sun', visits: 2 },
];

export default function ManagerDashboard() {
  const [recentVisits, setRecentVisits] = useState([]);

  useEffect(() => {
    visitsApi.getAll().then(v => setRecentVisits(v.slice(0, 5)));
  }, []);

  const mrMarkers = mockMRs.filter(m => m.active).map(m => ({
    id: m.id, name: m.name, lat: m.lat, lng: m.lng,
    city: m.city, area: m.area, lastSeen: 'Just now',
  }));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Manager Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's your team overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard id="kpi-doctors"  icon={Users}        label="Total Doctors"   value={mockDoctors.length}         trend="+3 this week"  color="blue"   />
        <SummaryCard id="kpi-chemists" icon={FlaskConical} label="Total Chemists"  value={mockChemists.length}        trend="Stable"        color="green"  />
        <SummaryCard id="kpi-mrs"      icon={UserCheck}    label="Active MRs"      value={mockMRs.filter(m=>m.active).length} trend="4 of 5 online" color="orange" />
        <SummaryCard id="kpi-visits"   icon={CalendarCheck}label="Visits This Week" value={57}                        trend="+12% vs last"  color="purple" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Visits Chart */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Weekly Visit Activity</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="visits" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Visits */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Recent Visits</h2>
          <div className="space-y-3">
            {recentVisits.map(v => (
              <div key={v.id} className="flex items-center gap-3">
                <img src={v.photo} alt="visit" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{v.entityName}</p>
                  <p className="text-xs text-slate-400">{v.mrName} · {v.date}</p>
                </div>
                <span className="badge badge-info text-xs">{v.visitType}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Map */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          Live MR Locations
          <span className="ml-2 badge badge-success">● Live</span>
        </h2>
        <MapView markers={mrMarkers} zoom={5} height="350px" />
      </div>
    </div>
  );
}
