import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { chemistsApi } from '../../api/chemistsApi';
import { CHEMIST_TYPES, CITIES } from '../../mocks/mockEnums';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  name:        z.string().min(3, 'Name is required'),
  city:        z.string().min(1, 'City is required'),
  area:        z.string().min(1, 'Area is required'),
  chemistType: z.string().min(1, 'Chemist type is required'),
  contact:     z.string().min(10, 'Enter valid contact number').max(10),
});

const COLUMNS = [
  { key: 'name',        label: 'Chemist Name' },
  { key: 'city',        label: 'City' },
  { key: 'area',        label: 'Area' },
  { key: 'chemistType', label: 'Type' },
  { key: 'contact',     label: 'Contact' },
  { key: 'active',      label: 'Status', render: (v) => <StatusBadge active={v} /> },
  { key: 'actions',     label: 'Actions', sortable: false },
];

export default function ChemistList() {
  const { isManager } = useAuth();
  const [chemists, setChemists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await chemistsApi.getAll({ search, city: filterCity, chemistType: filterType });
    setChemists(data);
    setLoading(false);
  }, [search, filterCity, filterType]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleToggle = async (id) => { await chemistsApi.toggleActive(id); fetch(); };

  const cols = COLUMNS.map(col => col.key === 'actions'
    ? { ...col, render: (_, row) => isManager ? (
        <div className="flex items-center gap-2">
          <button id={`edit-chemist-${row.id}`} onClick={() => { setEditing(row); setModalOpen(true); }} className="btn-ghost btn-sm"><Pencil className="w-3.5 h-3.5" /></button>
          <button id={`toggle-chemist-${row.id}`} onClick={() => handleToggle(row.id)} className={`btn-sm ${row.active ? 'btn-secondary text-danger' : 'btn-secondary text-success'}`}>
            {row.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ) : null }
    : col
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Chemist List"
        subtitle={`${chemists.length} chemists found`}
        action={isManager && (
          <button id="add-chemist-btn" onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Chemist
          </button>
        )}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or city…"
        filters={[
          { id: 'city', label: 'City', value: filterCity, onChange: setFilterCity, options: CITIES.map(c => ({ value: c, label: c })) },
          { id: 'chemistType', label: 'Chemist Type', value: filterType, onChange: setFilterType, options: CHEMIST_TYPES.map(t => ({ value: t.label, label: t.label })) },
        ]}
        onClear={() => { setSearch(''); setFilterCity(''); setFilterType(''); }}
      />

      <DataTable columns={cols} data={chemists} loading={loading} emptyMessage="No such Chemist found" />

      {isManager && (
        <ChemistFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          editing={editing}
          onSaved={fetch}
        />
      )}
    </div>
  );
}

function ChemistFormModal({ isOpen, onClose, editing, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editing) reset(editing);
    else reset({ name: '', city: '', area: '', chemistType: '', contact: '' });
  }, [editing, reset]);

  const onSubmit = async (data) => {
    if (editing) await chemistsApi.update(editing.id, data);
    else await chemistsApi.create(data);
    onSaved();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Chemist' : 'Add New Chemist'} id="chemist-modal">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="chemist-form">
        <div>
          <label className="form-label">Chemist/Store Name *</label>
          <input id="chem-name" type="text" {...register('name')} className={errors.name ? 'form-input-error' : 'form-input'} placeholder="Store Name" autoFocus />
          {errors.name && <p className="form-error">⚠ {errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">City *</label>
            <select id="chem-city" {...register('city')} className={errors.city ? 'form-input-error form-select' : 'form-select'}>
              <option value="">Select City</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.city && <p className="form-error">⚠ {errors.city.message}</p>}
          </div>
          <div>
            <label className="form-label">Area *</label>
            <input id="chem-area" type="text" {...register('area')} className={errors.area ? 'form-input-error' : 'form-input'} placeholder="e.g. Andheri" />
            {errors.area && <p className="form-error">⚠ {errors.area.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Chemist Type *</label>
            <select id="chem-type" {...register('chemistType')} className={errors.chemistType ? 'form-input-error form-select' : 'form-select'}>
              <option value="">Select Type</option>
              {CHEMIST_TYPES.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
            </select>
            {errors.chemistType && <p className="form-error">⚠ {errors.chemistType.message}</p>}
          </div>
          <div>
            <label className="form-label">Contact Number *</label>
            <input id="chem-contact" type="tel" {...register('contact')} className={errors.contact ? 'form-input-error' : 'form-input'} placeholder="9876543210" />
            {errors.contact && <p className="form-error">⚠ {errors.contact.message}</p>}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button id="chem-cancel" type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="chem-save" type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving…' : editing ? 'Update Chemist' : 'Add Chemist'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
