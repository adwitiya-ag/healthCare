import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { doctorsApi } from '../../api/doctorsApi';
import { productsApi } from '../../api/productsApi';
import { preferencesApi } from '../../api/distributionApi';
import { PREFERENCE_LEVELS } from '../../mocks/mockEnums';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  doctorId:        z.string().min(1, 'Select a doctor'),
  productId:       z.string().min(1, 'Select a product'),
  preferenceLevel: z.string().min(1, 'Select preference level'),
  notes:           z.string().optional(),
});

export default function DoctorPreference() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [products, setProducts] = useState([]);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    doctorsApi.getAll({ mrId: user?.id }).then(setDoctors);
    productsApi.getAll().then(setProducts);
  }, [user]);

  const onSubmit = async (data) => {
    const doctor  = doctors.find(d => String(d.id) === data.doctorId);
    const product = products.find(p => String(p.id) === data.productId);
    await preferencesApi.record({
      doctorId: Number(data.doctorId),  doctorName:  doctor?.name  || '',
      productId: Number(data.productId), productName: product?.name || '',
      preferenceLevel: data.preferenceLevel, notes: data.notes || '',
      mrId: user.id, mrName: user.name,
    });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); reset(); }, 2500);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <CheckCircle className="w-20 h-20 text-success mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Preference Recorded!</h2>
        <p className="text-slate-500">Doctor's product preference has been saved.</p>
      </div>
    );
  }

  const prefColors = { High: 'text-green-600', Medium: 'text-amber-500', Low: 'text-red-500', 'No Preference': 'text-slate-400' };

  return (
    <div className="animate-fade-in max-w-lg">
      <PageHeader title="Doctor Product Preference" subtitle="Record a doctor's preference for a product" />

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="doctor-preference-form">
          <div>
            <label className="form-label">Doctor *</label>
            <select id="pref-doctor" {...register('doctorId')} className={errors.doctorId ? 'form-input-error form-select' : 'form-select'}>
              <option value="">Select doctor…</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.city}</option>)}
            </select>
            {errors.doctorId && <p className="form-error">⚠ {errors.doctorId.message}</p>}
          </div>

          <div>
            <label className="form-label">Product *</label>
            <select id="pref-product" {...register('productId')} className={errors.productId ? 'form-input-error form-select' : 'form-select'}>
              <option value="">Select product…</option>
              {products.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.productId && <p className="form-error">⚠ {errors.productId.message}</p>}
          </div>

          <div>
            <label className="form-label">Preference Level *</label>
            <div className="grid grid-cols-2 gap-2">
              {PREFERENCE_LEVELS.map(pref => (
                <label key={pref.id} htmlFor={`pref-level-${pref.id}`} className="cursor-pointer">
                  <input type="radio" id={`pref-level-${pref.id}`} value={pref.label} {...register('preferenceLevel')} className="sr-only peer" />
                  <div className={`p-3 rounded-xl border-2 text-sm font-medium text-center transition-all peer-checked:border-primary-500 peer-checked:bg-primary-50 border-surface-border hover:border-primary-300 ${prefColors[pref.label]}`}>
                    {pref.label}
                  </div>
                </label>
              ))}
            </div>
            {errors.preferenceLevel && <p className="form-error">⚠ {errors.preferenceLevel.message}</p>}
          </div>

          <div>
            <label className="form-label">Notes (optional)</label>
            <textarea id="pref-notes" rows={3} {...register('notes')} className="form-input" placeholder="Additional observations…" />
          </div>

          <button id="pref-submit" type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
            {isSubmitting ? 'Saving…' : 'Save Preference'}
          </button>
        </form>
      </div>
    </div>
  );
}
