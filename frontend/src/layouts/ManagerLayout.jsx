import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FlaskConical, ClipboardList, Package,
  BarChart3, MapPin, LogOut, Menu, X, Activity, ChevronRight,
  Settings, BookOpen, UserCircle, Building2, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/manager',               label: 'Dashboard',        icon: LayoutDashboard, end: true },
  { to: '/manager/doctors',       label: 'Doctors',          icon: Users },
  { to: '/manager/chemists',      label: 'Chemists',         icon: FlaskConical },
  { to: '/manager/visits',        label: 'Visit Review',     icon: ClipboardList },
  { to: '/manager/tour-plans',    label: 'Tour Plans',       icon: BookOpen },
  { to: '/manager/products',      label: 'Products',         icon: Package },
  { to: '/manager/distribution',  label: 'Distribution',     icon: BarChart3 },
  { to: '/manager/tracking',      label: 'Live Tracking',    icon: MapPin },
  { to: '/manager/qualifications',label: 'Qualifications',   icon: Settings },
  { to: '/manager/specialisations',label: 'Specialisations', icon: Settings },
  { to: '/manager/areas-cities',  label: 'Areas & Cities',   icon: Globe },
  { to: '/manager/companies',     label: 'Companies',        icon: Building2 },
];

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-sidebar flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MR Manager</p>
            <p className="text-sidebar-text text-xs">Manager Portal</p>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-sidebar-text hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
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
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <NavLink
            to="/manager/profile"
            onClick={onClose}
            id="manager-profile-link"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 mb-2 rounded-lg transition-colors ${isActive ? 'bg-primary-600/20 ring-1 ring-primary-500/30' : 'bg-white/5 hover:bg-white/10'}`
            }
          >
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.firstName?.charAt(0)?.toUpperCase() || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.firstName || 'Manager'}</p>
              <p className="text-sidebar-text text-xs truncate">{user?.email}</p>
            </div>
            <UserCircle className="w-4 h-4 text-sidebar-text shrink-0" />
          </NavLink>
          <button id="manager-logout" onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default function ManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface-muted overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-surface-border px-4 py-3 flex items-center gap-3 shrink-0 lg:hidden">
          <button id="manager-menu-toggle" onClick={() => setSidebarOpen(true)} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-slate-800">MR Manager</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
