import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
//firstName, lastName, email, phoneNo, password, role, manager
const schema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters'),
  lastName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phoneNo: z.string().min(10, 'Enter a valid 10-digit phone number').max(10),
  role: z.enum(['MANAGER', 'MR'], { required_error: 'Select a role' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  manager: z.string().optional()
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const { confirmPassword: _, ...payload } = data;
      const user = await registerUser(payload);
      navigate('/');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">MR Manager</h1>
          <p className="text-primary-300 mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-modal p-8 animate-scale-in">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Register</h2>

          {apiError && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger">
              ⚠️ {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
            <div>
              <label className="form-label">First Name</label>
              <input id="reg-first-name" type="text" {...register('firstName')} className={errors.firstName ? 'form-input-error' : 'form-input'} placeholder="John" autoFocus />
              {errors.firstName && <p className="form-error">⚠ {errors.firstName.message}</p>}
            </div>

            <div>
              <label className="form-label">Last Name</label>
              <input id="reg-last-name" type="text" {...register('lastName')} className={errors.lastName ? 'form-input-error' : 'form-input'} placeholder="Doe" autoFocus />
              {errors.lastName && <p className="form-error">⚠ {errors.lastName.message}</p>}
            </div>


            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Email</label>
                <input id="reg-email" type="email" {...register('email')} className={errors.email ? 'form-input-error' : 'form-input'} placeholder="you@example.com" />
                {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input id="reg-phoneNo" type="tel" {...register('phoneNo')} className={errors.phoneNo ? 'form-input-error' : 'form-input'} placeholder="9XXXXXXXXX" />
                {errors.phoneNo && <p className="form-error">⚠ {errors.phoneNo.message}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Role</label>
              <select id="reg-role" {...register('role')} className={errors.role ? 'form-input-error form-select' : 'form-select'}>
                <option value="">Select your role</option>
                <option value="MANAGER">Manager</option>
                <option value="MR">Medical Representative (MR)</option>
              </select>
              {errors.role && <p className="form-error">⚠ {errors.role.message}</p>}
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input id="reg-password" type={showPw ? 'text' : 'password'} {...register('password')} className={`${errors.password ? 'form-input-error' : 'form-input'} pr-10`} placeholder="••••••••" />
                <button type="button" id="toggle-reg-password" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="form-error">⚠ {errors.password.message}</p>}
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <input id="reg-confirm-password" type="password" {...register('confirmPassword')} className={errors.confirmPassword ? 'form-input-error' : 'form-input'} placeholder="••••••••" />
              {errors.confirmPassword && <p className="form-error">⚠ {errors.confirmPassword.message}</p>}
            </div>

            <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</span> : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-surface-border">
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
