import { Link } from 'react-router-dom';
import { ClipboardList, BookOpen, Users, Package, Star, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const QUICK_ACTIONS = [
  { to: '/mr/log-visit',     label: 'Log a Visit',        icon: ClipboardList, color: 'bg-blue-500',   desc: 'Record your doctor/chemist visit' },
  { to: '/mr/tour-plan',     label: 'Upload Tour Plan',   icon: BookOpen,      color: 'bg-green-500',  desc: 'Submit your monthly tour plan PDF' },
  { to: '/mr/doctors',       label: 'My Doctors',         icon: Users,         color: 'bg-indigo-500', desc: 'View assigned doctors list' },
  { to: '/mr/record-product',label: 'Record Product',     icon: Package,       color: 'bg-orange-500', desc: 'Log product distribution' },
  { to: '/mr/preference',    label: 'Doctor Preferences', icon: Star,          color: 'bg-purple-500', desc: 'Record product preferences' },
  { to: '/mr/location',      label: 'Location Tracking',  icon: MapPin,        color: 'bg-red-500',    desc: 'Manage live location sharing' },
];

export default function MRDashboard() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-1">Good day, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-primary-200">Welcome to your MR dashboard. What would you like to do today?</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="bg-white/20 rounded-lg px-3 py-1.5 text-sm">
            📍 {user?.city} · {user?.area}
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1.5 text-sm">
            📧 {user?.email}
          </div>
        </div>
      </div>

      {/* Quick actions grid */}
      <h2 className="text-lg font-semibold text-slate-800 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map(action => (
          <Link
            key={action.to}
            to={action.to}
            id={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
            className="card-hover p-5 flex items-start gap-4 group"
          >
            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">{action.label}</p>
              <p className="text-sm text-slate-500 mt-0.5">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
