import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Building2, Shield, Camera,
  Save, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profileApi';

/* ───────── helper: generate avatar gradient from name ───────── */
function avatarGradient(name = '') {
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
  ];
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % gradients.length;
  return gradients[idx];
}

/* ───────── toast component ───────── */
function Toast({ type, message, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);

  return (
    <div className={`
      fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium
      animate-slide-in
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}
    `}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      {message}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   ProfilePage — shared between Manager and MR layouts
   ═════════════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { user, role } = useAuth();

  /* ── profile form state ── */
  const [form, setForm] = useState({
    name:  '',
    email: '',
    phone: '',
    city:  '',
    area:  '',
  });
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  /* ── password form state ── */
  const [pw, setPw]           = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw]   = useState({ current: false, new: false, confirm: false });
  const [changingPw, setChangingPw] = useState(false);

  /* ── active tab ── */
  const [tab, setTab] = useState('info');

  /* Initialise form from auth context */
  useEffect(() => {
    if (user) {
      setForm({
        name:  user.name  || '',
        email: user.email || '',
        phone: user.phone || '',
        city:  user.city  || '',
        area:  user.area  || '',
      });
    }
  }, [user]);

  /* ── handlers ── */
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileApi.updateProfile(user?.id, form);

      // Update the stored auth data so sidebar & header reflect changes
      const stored = localStorage.getItem('mr_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = { ...parsed, ...form };
        localStorage.setItem('mr_auth', JSON.stringify(updated));
      }

      setToast({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pw.new !== pw.confirm) {
      setToast({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (pw.new.length < 6) {
      setToast({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    setChangingPw(true);
    try {
      await profileApi.changePassword(user?.id, { currentPassword: pw.current, newPassword: pw.new });
      setToast({ type: 'success', message: 'Password changed successfully!' });
      setPw({ current: '', new: '', confirm: '' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to change password.' });
    } finally {
      setChangingPw(false);
    }
  };

  const toggleShowPw = (field) => setShowPw(prev => ({ ...prev, [field]: !prev[field] }));

  const accentColor = role === 'manager' ? 'primary' : 'green';
  const gradient    = avatarGradient(user?.name);

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Toast */}
      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}

      {/* ── Hero card ── */}
      <div className="card overflow-hidden mb-6">
        {/* Banner gradient */}
        <div className={`h-36 bg-gradient-to-br ${
          role === 'manager'
            ? 'from-primary-600 via-primary-700 to-indigo-800'
            : 'from-emerald-500 via-green-600 to-teal-700'
        } relative`}>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute bottom-4 left-6 w-24 h-24 rounded-full bg-white/5" />
        </div>

        <div className="px-6 pb-6 relative">
          {/* Avatar */}
          <div className="-mt-14 mb-4 flex items-end gap-5">
            <div className={`
              w-28 h-28 rounded-2xl bg-gradient-to-br ${gradient}
              flex items-center justify-center text-white text-4xl font-bold
              shadow-lg ring-4 ring-white shrink-0 select-none
            `}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="pb-1 flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 truncate">{user?.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`badge ${role === 'manager' ? 'badge-info' : 'badge-success'}`}>
                  <Shield className="w-3 h-3" />
                  {role === 'manager' ? 'Manager' : 'Medical Representative'}
                </span>
                {user?.city && (
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {user.city}{user.area ? ` · ${user.area}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            {[
              { icon: Mail,      label: 'Email',    value: user?.email || '—' },
              { icon: Phone,     label: 'Phone',    value: user?.phone || '—' },
              { icon: Building2, label: 'City',     value: user?.city  || '—' },
              { icon: Briefcase, label: 'Role',     value: role === 'manager' ? 'Manager' : 'MR' },
            ].map(stat => (
              <div key={stat.label}
                className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 border border-surface-border"
              >
                <stat.icon className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{stat.label}</p>
                  <p className="text-sm font-medium text-slate-700 truncate">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-surface-border shadow-card">
        {[
          { key: 'info',     label: 'Personal Info',    icon: User },
          { key: 'password', label: 'Change Password',  icon: Lock },
        ].map(t => (
          <button
            key={t.key}
            id={`profile-tab-${t.key}`}
            onClick={() => setTab(t.key)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200 cursor-pointer
              ${tab === t.key
                ? `bg-${accentColor}-600 text-white shadow-sm`
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }
            `}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="card p-6 animate-fade-in">

        {/* ─── Personal Info Tab ─── */}
        {tab === 'info' && (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-800">Personal Information</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label htmlFor="profile-name" className="form-label">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input id="profile-name" name="name" value={form.name} onChange={handleChange}
                    className="form-input pl-10" placeholder="Your name" />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label htmlFor="profile-email" className="form-label">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input id="profile-email" name="email" value={form.email}
                    className="form-input pl-10 bg-slate-50 cursor-not-allowed" readOnly disabled />
                </div>
                <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="profile-phone" className="form-label">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input id="profile-phone" name="phone" value={form.phone} onChange={handleChange}
                    className="form-input pl-10" placeholder="Phone" />
                </div>
              </div>

              {/* City */}
              <div>
                <label htmlFor="profile-city" className="form-label">City</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input id="profile-city" name="city" value={form.city} onChange={handleChange}
                    className="form-input pl-10" placeholder="City" />
                </div>
              </div>

              {/* Area */}
              <div className="sm:col-span-2">
                <label htmlFor="profile-area" className="form-label">Area / Territory</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input id="profile-area" name="area" value={form.area} onChange={handleChange}
                    className="form-input pl-10" placeholder="Area" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button id="profile-save" type="submit" disabled={saving}
                className={`btn ${role === 'manager' ? 'btn-primary' : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm active:scale-95'} min-w-[140px]`}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ─── Change Password Tab ─── */}
        {tab === 'password' && (
          <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
            </div>

            {[
              { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
              { key: 'new',     label: 'New Password',     placeholder: 'At least 6 characters' },
              { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
            ].map(field => (
              <div key={field.key}>
                <label htmlFor={`pw-${field.key}`} className="form-label">{field.label}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id={`pw-${field.key}`}
                    type={showPw[field.key] ? 'text' : 'password'}
                    value={pw[field.key]}
                    onChange={e => setPw(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="form-input pl-10 pr-10"
                    placeholder={field.placeholder}
                    required
                  />
                  <button type="button" onClick={() => toggleShowPw(field.key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPw[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            {/* Strength hint */}
            {pw.new && (
              <div className="flex items-center gap-2 text-xs">
                <div className="flex gap-1 flex-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      pw.new.length >= i * 3 ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} />
                  ))}
                </div>
                <span className="text-slate-400">
                  {pw.new.length < 6 ? 'Too short' : pw.new.length < 9 ? 'Fair' : pw.new.length < 12 ? 'Good' : 'Strong'}
                </span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button id="pw-save" type="submit" disabled={changingPw}
                className={`btn ${role === 'manager' ? 'btn-primary' : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm active:scale-95'} min-w-[180px]`}
              >
                {changingPw ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Changing…
                  </span>
                ) : (
                  <><Lock className="w-4 h-4" /> Update Password</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
