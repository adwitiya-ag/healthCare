import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPw, setShowPw] = useState(false);
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        setLoading(true);
        setApiError('');
        try {
            const user = await login(data.email, data.password);
            navigate(user.role === 'manager' ? '/manager' : '/mr');
        } catch (err) {
            setApiError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg mb-4">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">MR Manager</h1>
                    <p className="text-primary-300 mt-1">Pharma Field Tracking System</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-modal p-8 animate-scale-in">
                    <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign in to your account</h2>

                    {apiError && (
                        <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger flex items-center gap-2">
                            <span>⚠️</span> {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="login-form">
                        <div>
                            <label className="form-label">Email Address</label>
                            <input id="email" type="email" {...register('email')} className={errors.email ? 'form-input-error' : 'form-input'} placeholder="you@example.com" autoFocus />
                            {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="form-label">Password</label>
                            <div className="relative">
                                <input id="password" type={showPw ? 'text' : 'password'} {...register('password')} className={`${errors.password ? 'form-input-error' : 'form-input'} pr-10`} placeholder="••••••••" />
                                <button type="button" id="toggle-password" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="form-error">⚠ {errors.password.message}</p>}
                        </div>

                        <div className="flex justify-end">
                            <Link to="/reset-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                            {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</span> : <><LogIn className="w-4 h-4" /> Sign In</>}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-surface-border">
                        <p className="text-center text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Create account</Link>
                        </p>
                    </div>

                    {/* Demo hint */}
                    <div className="mt-4 p-3 bg-primary-50 rounded-lg text-xs text-primary-700 space-y-1">
                        <p className="font-semibold">Demo Credentials:</p>
                        <p>🔵 Manager: <span className="font-mono">manager@mr.com / admin123</span></p>
                        <p>🟢 MR: <span className="font-mono">amit@mr.com / password123</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
