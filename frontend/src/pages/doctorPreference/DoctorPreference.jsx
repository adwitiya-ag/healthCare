import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { doctorsApi } from '../../api/doctorsApi';
import { productsApi } from '../../api/productsApi';
import { preferencesApi } from '../../api/distributionApi';

const schema = z.object({
  productId: z.string().min(1, 'Select a product'),
  preferenceOrder: z.coerce.number().int().positive('Order must be a positive number'),
  notes: z.string().optional(),
});

const COLUMNS = [
  { key: 'productName', label: 'Product Name' },
  { key: 'preferenceOrder', label: 'Order' },
  { key: 'actions', label: 'Actions', sortable: false },
];

export default function DoctorPreference() {
  const [doctors, setDoctors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoadingDoctors(true);
      try {
        const [doctorData, productData] = await Promise.all([
          doctorsApi.getAll(),
          productsApi.getAll(),
        ]);
        setDoctors(doctorData);
        setProducts(productData.filter((p) => p.active));
      } catch (error) {
        console.error(error);
        alert(error.message || 'Failed to load doctors/products');
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchInitial();
  }, []);

  const fetchPreferences = useCallback(async () => {
    if (!selectedDoctorId) {
      setPreferences([]);
      return;
    }
    setLoadingPrefs(true);
    try {
      const { preferences: prefs } = await preferencesApi.getByDoctor(selectedDoctorId);
      setPreferences(prefs);
    } catch (error) {
      console.error(error);
      alert(error.message || 'Failed to load preferences');
    } finally {
      setLoadingPrefs(false);
    }
  }, [selectedDoctorId]);

  useEffect(() => { fetchPreferences(); }, [fetchPreferences]);

  const handleDelete = async (pref) => {
    if (!window.confirm(`Delete preference for "${pref.productName}"?`)) return;
    try {
      await preferencesApi.remove(pref.id);
      fetchPreferences();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const cols = COLUMNS.map((col) =>
    col.key === 'actions'
      ? {
          ...col,
          render: (_, row) => (
            <div className="flex items-center gap-2">
              <button
                id={`edit-pref-${row.id}`}
                onClick={() => { setEditing(row); setModalOpen(true); }}
                className="btn-ghost btn-sm"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                id={`delete-pref-${row.id}`}
                onClick={() => handleDelete(row)}
                className="btn-secondary btn-sm text-danger"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ),
        }
      : col
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Doctor Product Preference"
        subtitle="Manage a doctor's ranked product preferences"
        action={
          <button
            id="add-preference-btn"
            onClick={() => { setEditing(null); setModalOpen(true); }}
            disabled={!selectedDoctorId}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> Add Preference
          </button>
        }
      />

      <div className="card p-4 mb-4">
        <label className="form-label">Select Doctor *</label>
        <select
          id="pref-doctor-select"
          value={selectedDoctorId}
          onChange={(e) => setSelectedDoctorId(e.target.value)}
          disabled={loadingDoctors}
          className="form-select"
        >
          <option value="">{loadingDoctors ? 'Loading doctors…' : 'Select doctor…'}</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name} — {d.city}</option>
          ))}
        </select>
      </div>

      {selectedDoctorId ? (
        <DataTable
          columns={cols}
          data={preferences}
          loading={loadingPrefs}
          emptyMessage="No preferences recorded for this doctor"
        />
      ) : (
        <p className="text-slate-500 text-sm px-1">Select a doctor above to view and manage their product preferences.</p>
      )}

      {selectedDoctorId && (
        <PreferenceFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          editing={editing}
          doctorId={selectedDoctorId}
          products={products}
          onSaved={fetchPreferences}
        />
      )}
    </div>
  );
}

function PreferenceFormModal({ isOpen, onClose, editing, doctorId, products, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editing) {
      reset({
        productId: editing.productId,
        preferenceOrder: editing.preferenceOrder,
        notes: editing.notes || '',
      });
    } else {
      reset({ productId: '', preferenceOrder: '', notes: '' });
    }
  }, [editing, reset]);

  const onSubmit = async (data) => {
    const payload = { doctorId, ...data };
    try {
      if (editing) {
        await preferencesApi.update(editing.id, payload);
      } else {
        await preferencesApi.create(payload);
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Preference' : 'Add Preference'} id="preference-modal">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="preference-form">
        <div>
          <label className="form-label">Product *</label>
          <select id="pref-product" {...register('productId')} className={errors.productId ? 'form-input-error form-select' : 'form-select'}>
            <option value="">Select product…</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {errors.productId && <p className="form-error">⚠ {errors.productId.message}</p>}
        </div>

        <div>
          <label className="form-label">Preference Order *</label>
          <input id="pref-order" type="number" min="1" {...register('preferenceOrder')} className={errors.preferenceOrder ? 'form-input-error' : 'form-input'} placeholder="1" />
          {errors.preferenceOrder && <p className="form-error">⚠ {errors.preferenceOrder.message}</p>}
        </div>

        <div>
          <label className="form-label">Notes (optional)</label>
          <textarea id="pref-notes" rows={3} {...register('notes')} className="form-input" placeholder="Additional observations…" />
        </div>

        <div className="flex gap-3 pt-2">
          <button id="pref-cancel" type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="pref-save" type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Save Preference'}
          </button>
        </div>
      </form>
    </Modal>
  );
}