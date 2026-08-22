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
import { doctorsApi } from '../../api/doctorsApi';
import { SPECIALISATIONS } from '../../mocks/mockEnums';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  name: z.string().min(3, 'Name is required'),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  specialisation: z.string().min(1, 'Specialisation is required'),
});

const COLUMNS = [
  { key: 'name', label: 'Doctor Name' },
  { key: 'city', label: 'City' },
  { key: 'area', label: 'Area' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'specialisation', label: 'Specialisation' },
  { key: 'active', label: 'Status', render: (v) => <StatusBadge active={v} /> },
  { key: 'actions', label: 'Actions', sortable: false, render: (_, row) => <RowActions row={row} /> },
];

// This needs to be defined after context, so we pass in handlers
function DoctorList() {
  const { isManager } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterQual, setFilterQual] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [CITIES, setCITIES] = useState([])
  const [QUALIFICATIONS, setQUALIFICATIONS] = useState([]);

  useEffect(() => {

    const fetchQualifications = async () => {
      try{
        const response = await doctorsApi.getQualifications();
        setQUALIFICATIONS(response.data);
        console.log("Qualifications:", response.data);
      }
      catch (error) {
        console.error(error);
      }
    }

    const fetchCities = async () => {
      try {
        const response = await doctorsApi.getCities();
        setCITIES(response.data)
        // console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchQualifications();
    fetchCities();
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await doctorsApi.getAll({ search, city: filterCity, qualification: filterQual, specialisation: filterSpec });

    setDoctors(data);
    setLoading(false);
  }, [search, filterCity, filterQual, filterSpec]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleToggle = async (id) => {
    await doctorsApi.toggleActive(id);
    fetch();
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setModalOpen(true); };

  const cols = COLUMNS.map(col => col.key === 'actions'
    ? {
      ...col, render: (_, row) => (
        <div className="flex items-center gap-2">
          {isManager && (
            <>
              <button id={`edit-doctor-${row.id}`} onClick={() => openEdit(row)} className="btn-ghost btn-sm"><Pencil className="w-3.5 h-3.5" /></button>
              <button id={`toggle-doctor-${row.id}`} onClick={() => handleToggle(row.id)} className={`btn-sm ${row.active ? 'btn-secondary text-danger' : 'btn-secondary text-success'}`}>
                {row.active ? 'Deactivate' : 'Activate'}
              </button>
            </>
          )}
        </div>
      )
    }
    : col
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Doctor List"
        subtitle={`${doctors.length} doctors found`}
        action={isManager && (
          <button id="add-doctor-btn" onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Doctor
          </button>
        )}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or city…"
        filters={[
          { id: 'city', label: 'City', value: filterCity, onChange: setFilterCity, options: CITIES.map(c => ({ value: c._id, label: c.cityName })) },
          { id: 'qualification', label: 'Qualification', value: filterQual, onChange: setFilterQual, options: QUALIFICATIONS.map(q => ({ value: q._id, label: q.name })) },
          { id: 'specialisation', label: 'Specialisation', value: filterSpec, onChange: setFilterSpec, options: SPECIALISATIONS.map(s => ({ value: s.label, label: s.label })) },
        ]}
        onClear={() => { setSearch(''); setFilterCity(''); setFilterQual(''); setFilterSpec(''); }}
      />

      <DataTable columns={cols} data={doctors} loading={loading} emptyMessage="No such Doctor found" />

      {isManager && (
        <DoctorFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          editing={editing}
          onSaved={fetch}
        />
      )}
    </div>
  );
}

function DoctorFormModal({ isOpen, onClose, editing, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editing) reset(editing);
    else reset({ name: '', city: '', area: '', qualification: '', specialisation: '' });
  }, [editing, reset]);

  const onSubmit = async (data) => {
    if (editing) await doctorsApi.update(editing.id, data);
    else await doctorsApi.create(data);
    onSaved();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Doctor' : 'Add New Doctor'} id="doctor-modal">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="doctor-form">
        <div>
          <label className="form-label">Doctor Name *</label>
          <input id="doc-name" type="text" {...register('name')} className={errors.name ? 'form-input-error' : 'form-input'} placeholder="Dr. Full Name" autoFocus />
          {errors.name && <p className="form-error">⚠ {errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">City *</label>
            <select id="doc-city" {...register('city')} className={errors.city ? 'form-input-error form-select' : 'form-select'}>
              <option value="">Select City</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.city && <p className="form-error">⚠ {errors.city.message}</p>}
          </div>
          <div>
            <label className="form-label">Area *</label>
            <input id="doc-area" type="text" {...register('area')} className={errors.area ? 'form-input-error' : 'form-input'} placeholder="e.g. Andheri" />
            {errors.area && <p className="form-error">⚠ {errors.area.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Qualification *</label>
            <select id="doc-qualification" {...register('qualification')} className={errors.qualification ? 'form-input-error form-select' : 'form-select'}>
              <option value="">Select</option>
              {QUALIFICATIONS.filter(q => q.active).map(q => <option key={q.id} value={q.label}>{q.label}</option>)}
            </select>
            {errors.qualification && <p className="form-error">⚠ {errors.qualification.message}</p>}
          </div>
          <div>
            <label className="form-label">Specialisation *</label>
            <select id="doc-specialisation" {...register('specialisation')} className={errors.specialisation ? 'form-input-error form-select' : 'form-select'}>
              <option value="">Select</option>
              {SPECIALISATIONS.filter(s => s.active).map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
            </select>
            {errors.specialisation && <p className="form-error">⚠ {errors.specialisation.message}</p>}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button id="doc-cancel" type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="doc-save" type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving…' : editing ? 'Update Doctor' : 'Add Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default DoctorList;
