import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, BookOpen, Users, Package,
  Star, MapPin, LogOut, Menu, X, Activity, ChevronRight, UserCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/mr',               label: 'Dashboard',        icon: LayoutDashboard, end: true },
  { to: '/mr/log-visit',     label: 'Log a Visit',      icon: ClipboardList },
  { to: '/mr/tour-plan',     label: 'Tour Plan',         icon: BookOpen },
  { to: '/mr/doctors',       label: 'My Doctors',        icon: Users },
  { to: '/mr/record-product',label: 'Record Product',    icon: Package },
  { to: '/mr/preference',    label: 'Dr. Preferences',   icon: Star },
  { to: '/mr/location',      label: 'Live Location',     icon: MapPin },
];

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-sidebar flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MR Manager</p>
            <p className="text-sidebar-text text-xs">MR Portal</p>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-sidebar-text hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <NavLink
            to="/mr/profile"
            onClick={onClose}
            id="mr-profile-link"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 mb-2 rounded-lg transition-colors ${isActive ? 'bg-green-600/20 ring-1 ring-green-500/30' : 'bg-white/5 hover:bg-white/10'}`
            }
          >
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.firstName?.charAt(0)?.toUpperCase() || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.firstName || 'MR User'}</p>
              <p className="text-sidebar-text text-xs truncate">{user?.email}</p>
            </div>
            <UserCircle className="w-4 h-4 text-sidebar-text shrink-0" />
          </NavLink>
          <button id="mr-logout" onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default function MRLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface-muted overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-surface-border px-4 py-3 flex items-center gap-3 shrink-0 lg:hidden">
          <button id="mr-menu-toggle" onClick={() => setSidebarOpen(true)} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="font-bold text-slate-800">MR Manager</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
