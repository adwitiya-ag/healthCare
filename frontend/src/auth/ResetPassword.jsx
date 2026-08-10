import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Shield, KeyRound, ArrowLeft, Activity, CheckCircle } from 'lucide-react';
import { authApi } from '../api/authApi';

const emailSchema = z.object({ email: z.string().email('Enter a valid email') });
const otpSchema   = z.object({ otp: z.string().length(6, 'OTP must be 6 digits') });
const pwSchema    = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

function StepIndicator({ step }) {
  const steps = [
    { label: 'Email', icon: Mail },
    { label: 'OTP',   icon: Shield },
    { label: 'Reset', icon: KeyRound },
  ];
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const done = i < step;
        const active = i === step;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-success text-white' : active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {done ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
            </div>
            <span className={`text-xs font-medium ${active ? 'text-primary-600' : done ? 'text-success' : 'text-slate-400'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 ${done ? 'bg-success' : 'bg-slate-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const otpForm   = useForm({ resolver: zodResolver(otpSchema) });
  const pwForm    = useForm({ resolver: zodResolver(pwSchema) });

  const handleEmail = async (data) => {
    setLoading(true); setApiError('');
    try { await authApi.requestOtp(data.email); setEmail(data.email); setStep(1); }
    catch (e) { setApiError(e.message); }
    finally { setLoading(false); }
  };

  const handleOtp = async (data) => {
    setLoading(true); setApiError('');
    try { await authApi.verifyOtp(email, data.otp); setStep(2); }
    catch (e) { setApiError(e.message); }
    finally { setLoading(false); }
  };

  const handleReset = async (data) => {
    setLoading(true); setApiError('');
    try { await authApi.resetPassword(email, data.newPassword); setDone(true); }
    catch (e) { setApiError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">MR Manager</h1>
          <p className="text-primary-300 mt-1">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-modal p-8 animate-scale-in">
          <StepIndicator step={step} />

          {apiError && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger">
              ⚠️ {apiError}
            </div>
          )}

          {done ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Password Reset!</h3>
              <p className="text-sm text-slate-500 mb-6">Your password has been successfully updated.</p>
              <button id="goto-login" onClick={() => navigate('/login')} className="btn-primary w-full">Back to Login</button>
            </div>
          ) : step === 0 ? (
            <form onSubmit={emailForm.handleSubmit(handleEmail)} className="space-y-4" id="reset-email-form">
              <div>
                <label className="form-label">Registered Email</label>
                <input id="reset-email" type="email" {...emailForm.register('email')} className={emailForm.formState.errors.email ? 'form-input-error' : 'form-input'} placeholder="you@example.com" autoFocus />
                {emailForm.formState.errors.email && <p className="form-error">⚠ {emailForm.formState.errors.email.message}</p>}
              </div>
              <button id="send-otp" type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? 'Sending…' : <><Mail className="w-4 h-4" /> Send OTP</>}
              </button>
            </form>
          ) : step === 1 ? (
            <form onSubmit={otpForm.handleSubmit(handleOtp)} className="space-y-4" id="reset-otp-form">
              <div className="p-3 bg-primary-50 rounded-lg text-xs text-primary-700">
                OTP sent to <strong>{email}</strong>. For demo, use: <strong>123456</strong>
              </div>
              <div>
                <label className="form-label">Enter OTP</label>
                <input id="otp-input" type="text" maxLength={6} {...otpForm.register('otp')} className={otpForm.formState.errors.otp ? 'form-input-error' : 'form-input'} placeholder="123456" />
                {otpForm.formState.errors.otp && <p className="form-error">⚠ {otpForm.formState.errors.otp.message}</p>}
              </div>
              <button id="verify-otp" type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? 'Verifying…' : <><Shield className="w-4 h-4" /> Verify OTP</>}
              </button>
            </form>
          ) : (
            <form onSubmit={pwForm.handleSubmit(handleReset)} className="space-y-4" id="reset-pw-form">
              <div>
                <label className="form-label">New Password</label>
                <input id="new-password" type="password" {...pwForm.register('newPassword')} className={pwForm.formState.errors.newPassword ? 'form-input-error' : 'form-input'} placeholder="••••••••" autoFocus />
                {pwForm.formState.errors.newPassword && <p className="form-error">⚠ {pwForm.formState.errors.newPassword.message}</p>}
              </div>
              <div>
                <label className="form-label">Confirm New Password</label>
                <input id="confirm-new-password" type="password" {...pwForm.register('confirmPassword')} className={pwForm.formState.errors.confirmPassword ? 'form-input-error' : 'form-input'} placeholder="••••••••" />
                {pwForm.formState.errors.confirmPassword && <p className="form-error">⚠ {pwForm.formState.errors.confirmPassword.message}</p>}
              </div>
              <button id="reset-password-submit" type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? 'Resetting…' : <><KeyRound className="w-4 h-4" /> Reset Password</>}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
