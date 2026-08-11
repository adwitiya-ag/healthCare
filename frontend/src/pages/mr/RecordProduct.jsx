import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { doctorsApi } from '../../api/doctorsApi';
import { productsApi } from '../../api/productsApi';
import { distributionApi } from '../../api/distributionApi';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  doctorId:  z.string().min(1, 'Select a doctor'),
  productId: z.string().min(1, 'Select a product'),
  qty:       z.coerce.number().int().positive('Quantity must be at least 1'),
  date:      z.string().min(1, 'Date is required'),
});

export default function RecordProduct() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [products, setProducts] = useState([]);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { doctorId: '', productId: '', qty: 1, date: new Date().toISOString().split('T')[0] },
  });

  useEffect(() => {
    doctorsApi.getAll({ mrId: user?.id }).then(setDoctors);
    productsApi.getAll().then(setProducts);
  }, [user]);

  const onSubmit = async (data) => {
    const doctor  = doctors.find(d => String(d.id) === data.doctorId);
    const product = products.find(p => String(p.id) === data.productId);
    await distributionApi.record({
      doctorId: Number(data.doctorId),  doctorName:  doctor?.name  || '',
      productId: Number(data.productId), productName: product?.name || '',
      qty: data.qty, date: data.date, mrId: user.id, mrName: user.name,
    });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); reset({ doctorId: '', productId: '', qty: 1, date: new Date().toISOString().split('T')[0] }); }, 2500);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <CheckCircle className="w-20 h-20 text-success mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Recorded!</h2>
        <p className="text-slate-500">Distribution has been logged.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <PageHeader title="Record Product Given" subtitle="Log product distribution to a doctor" />

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="record-product-form">
          <div>
            <label className="form-label">Doctor *</label>
            <select id="rp-doctor" {...register('doctorId')} className={errors.doctorId ? 'form-input-error form-select' : 'form-select'}>
              <option value="">Select doctor…</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.city}</option>)}
            </select>
            {errors.doctorId && <p className="form-error">⚠ {errors.doctorId.message}</p>}
          </div>

          <div>
            <label className="form-label">Product *</label>
            <select id="rp-product" {...register('productId')} className={errors.productId ? 'form-input-error form-select' : 'form-select'}>
              <option value="">Select product…</option>
              {products.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.productId && <p className="form-error">⚠ {errors.productId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Quantity *</label>
              <input id="rp-qty" type="number" min={1} {...register('qty')} className={errors.qty ? 'form-input-error' : 'form-input'} />
              {errors.qty && <p className="form-error">⚠ {errors.qty.message}</p>}
            </div>
            <div>
              <label className="form-label">Date *</label>
              <input id="rp-date" type="date" {...register('date')} className={errors.date ? 'form-input-error' : 'form-input'} />
              {errors.date && <p className="form-error">⚠ {errors.date.message}</p>}
            </div>
          </div>

          <button id="record-product-submit" type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
            {isSubmitting ? 'Recording…' : 'Record Distribution'}
          </button>
        </form>
      </div>
    </div>
  );
}
