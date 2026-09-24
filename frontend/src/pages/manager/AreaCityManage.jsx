import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, MapPin, Building2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { citiesApi } from '../../api/citiesApi';
import { areasApi } from '../../api/areasApi';

/* ── Zod Schemas ─────────────────────────────────────────── */
const citySchema = z.object({
  cityName: z.string().min(2, 'City name is required (min 2 chars)'),
});

const areaSchema = z.object({
  areaName: z.string().min(2, 'Area name is required (min 2 chars)'),
  cityId: z.string().min(1, 'Please select a city'),
});

/* ── Column Definitions ──────────────────────────────────── */
const CITY_COLUMNS = [
  { key: 'cityCode', label: 'Code' },
  { key: 'cityName', label: 'City Name' },
  { key: 'isActive', label: 'Status', render: (v) => <StatusBadge active={v} /> },
  { key: 'actions', label: 'Actions', sortable: false },
];

const AREA_COLUMNS = [
  { key: 'areaCode', label: 'Code' },
  { key: 'areaName', label: 'Area Name' },
  { key: 'cityName', label: 'City', render: (_, row) => row.cityId?.cityName || '—' },
  { key: 'isActive', label: 'Status', render: (v) => <StatusBadge active={v} /> },
  { key: 'actions', label: 'Actions', sortable: false },
];

/* ═══════════════════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════════════════ */
export default function AreaCityManage() {
  const [activeTab, setActiveTab] = useState('cities');

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Area & City Management"
        subtitle="Manage cities and their areas"
      />

      {/* Tab Pills */}
      <div className="flex gap-2 mb-5">
        <button
          id="tab-cities"
          onClick={() => setActiveTab('cities')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === 'cities'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-surface-border'
          }`}
        >
          <Building2 className="w-4 h-4" /> Cities
        </button>
        <button
          id="tab-areas"
          onClick={() => setActiveTab('areas')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === 'areas'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-surface-border'
          }`}
        >
          <MapPin className="w-4 h-4" /> Areas
        </button>
      </div>

      {/* Panels */}
      {activeTab === 'cities' ? <CityPanel /> : <AreaPanel />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   City Panel
   ═══════════════════════════════════════════════════════════ */
function CityPanel() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await citiesApi.getAll({ search });
      setCities(data);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchCities(); }, [fetchCities]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this city?')) return;
    try {
      await citiesApi.delete(id);
      fetchCities();
    } catch (err) {
      alert(err.message);
    }
  };

  const cols = CITY_COLUMNS.map(col =>
    col.key === 'actions'
      ? {
          ...col,
          render: (_, row) => (
            <div className="flex items-center gap-2">
              <button
                id={`edit-city-${row._id}`}
                onClick={() => { setEditing(row); setModalOpen(true); }}
                className="btn-ghost btn-sm"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                id={`delete-city-${row._id}`}
                onClick={() => handleDelete(row._id)}
                className="btn-sm btn-secondary text-danger"
                title="Deactivate"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ),
        }
      : col
  );

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <button
          id="add-city-btn"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Add City
        </button>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search cities…"
        filters={[]}
        onClear={() => setSearch('')}
      />

      <DataTable
        columns={cols}
        data={cities.map(c => ({ ...c, id: c._id }))}
        loading={loading}
        emptyMessage="No cities found"
      />

      <CityFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={fetchCities}
      />
    </>
  );
}

/* ── City Form Modal ─────────────────────────────────────── */
function CityFormModal({ isOpen, onClose, editing, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(citySchema),
  });

  useEffect(() => {
    if (editing) reset({ cityName: editing.cityName });
    else reset({ cityName: '' });
  }, [editing, reset]);

  const onSubmit = async (data) => {
    try {
      if (editing) await citiesApi.update(editing._id, data);
      else await citiesApi.create(data);
      onSaved();
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit City' : 'Add City'} id="city-modal">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="city-form">
        <div>
          <label className="form-label">City Name *</label>
          <input
            id="city-name"
            type="text"
            {...register('cityName')}
            className={errors.cityName ? 'form-input-error' : 'form-input'}
            placeholder="e.g. Mumbai"
            autoFocus
          />
          {errors.cityName && <p className="form-error">⚠ {errors.cityName.message}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <button id="city-cancel" type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="city-save" type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving…' : editing ? 'Update City' : 'Add City'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════
   Area Panel
   ═══════════════════════════════════════════════════════════ */
function AreaPanel() {
  const [areas, setAreas] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Fetch cities for dropdown filter
  useEffect(() => {
    citiesApi.getAll().then(setCities).catch(console.error);
  }, []);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await areasApi.getAll({ search, cityId: cityFilter || undefined });
      setAreas(data);
    } catch (err) {
      console.error('Failed to fetch areas:', err);
    }
    setLoading(false);
  }, [search, cityFilter]);

  useEffect(() => { fetchAreas(); }, [fetchAreas]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this area?')) return;
    try {
      await areasApi.delete(id);
      fetchAreas();
    } catch (err) {
      alert(err.message);
    }
  };

  const cols = AREA_COLUMNS.map(col =>
    col.key === 'actions'
      ? {
          ...col,
          render: (_, row) => (
            <div className="flex items-center gap-2">
              <button
                id={`edit-area-${row._id}`}
                onClick={() => { setEditing(row); setModalOpen(true); }}
                className="btn-ghost btn-sm"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                id={`delete-area-${row._id}`}
                onClick={() => handleDelete(row._id)}
                className="btn-sm btn-secondary text-danger"
                title="Deactivate"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ),
        }
      : col
  );

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <button
          id="add-area-btn"
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Add Area
        </button>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search areas…"
        filters={[
          {
            id: 'city',
            label: 'City',
            value: cityFilter,
            onChange: setCityFilter,
            options: cities.map(c => ({ value: c._id, label: c.cityName })),
          },
        ]}
        onClear={() => { setSearch(''); setCityFilter(''); }}
      />

      <DataTable
        columns={cols}
        data={areas.map(a => ({ ...a, id: a._id }))}
        loading={loading}
        emptyMessage="No areas found"
      />

      <AreaFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={fetchAreas}
        cities={cities}
      />
    </>
  );
}

/* ── Area Form Modal ─────────────────────────────────────── */
function AreaFormModal({ isOpen, onClose, editing, onSaved, cities }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(areaSchema),
  });

  useEffect(() => {
    if (editing) {
      reset({
        areaName: editing.areaName,
        cityId: editing.cityId?._id || editing.cityId || '',
      });
    } else {
      reset({ areaName: '', cityId: '' });
    }
  }, [editing, reset]);

  const onSubmit = async (data) => {
    try {
      if (editing) await areasApi.update(editing._id, data);
      else await areasApi.create(data);
      onSaved();
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Area' : 'Add Area'} id="area-modal">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="area-form">
        <div>
          <label className="form-label">Area Name *</label>
          <input
            id="area-name"
            type="text"
            {...register('areaName')}
            className={errors.areaName ? 'form-input-error' : 'form-input'}
            placeholder="e.g. Andheri West"
            autoFocus
          />
          {errors.areaName && <p className="form-error">⚠ {errors.areaName.message}</p>}
        </div>
        <div>
          <label className="form-label">City *</label>
          <select
            id="area-city"
            {...register('cityId')}
            className={errors.cityId ? 'form-input-error form-select' : 'form-select'}
          >
            <option value="">Select a city</option>
            {cities.map(c => (
              <option key={c._id} value={c._id}>{c.cityName}</option>
            ))}
          </select>
          {errors.cityId && <p className="form-error">⚠ {errors.cityId.message}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <button id="area-cancel" type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="area-save" type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving…' : editing ? 'Update Area' : 'Add Area'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
