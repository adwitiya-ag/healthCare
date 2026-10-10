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
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
    name: z.string().min(3, 'Name is required'),
    cityId: z.string().min(1, 'City is required'),
    areaId: z.string().min(1, 'Area is required'),
    chemistType: z.string().min(1, 'Chemist type is required'),
});

const COLUMNS = [
    { key: 'name', label: 'Chemist Name' },
    { key: 'city', label: 'City' },
    { key: 'area', label: 'Area' },
    { key: 'chemistType', label: 'Type' },
    { key: 'active', label: 'Status', render: (v) => <StatusBadge active={v} /> },
];

const CHEMIST_TYPES = ['RETAIL', 'WHOLESALE', 'HOSPITAL', 'ONLINE'];

export default function ChemistList() {
    const { isManager } = useAuth();
    const [chemists, setChemists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCityId, setFilterCityId] = useState('');
    const [filterAreaId, setFilterAreaId] = useState('');
    const [filterType, setFilterType] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [CITIES, setCITIES] = useState([]);
    const [AREAS, setAREAS] = useState([]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await chemistsApi.getCities();
                setCITIES(response.data);
            } catch (error) { console.error(error); }
        };
        fetchCities();
    }, []);

    // Cascading: refetch areas whenever the FILTER city changes; reset area filter
    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await chemistsApi.getAreas(filterCityId || undefined);
                setAREAS(response.data);
            } catch (error) { console.error(error); }
        };
        fetchAreas();
        setFilterAreaId('');
    }, [filterCityId]);

    const fetch = useCallback(async () => {
        setLoading(true);
        const data = await chemistsApi.getAll({
            search,
            cityId: filterCityId,
            areaId: filterAreaId,
            chemistType: filterType,
        });
        setChemists(data);
        setLoading(false);
    }, [search, filterCityId, filterAreaId, filterType]);

    useEffect(() => { fetch(); }, [fetch]);

    const handleToggle = async (id) => { await chemistsApi.toggleActive(id); fetch(); };

    // const cols = COLUMNS.map((col) =>
    //     col.key === 'actions'
    //         ? {
    //             ...col,
    //             render: (_, row) =>
    //                 isManager ? (
    //                     <div className="flex items-center gap-2">
    //                         <button id={`edit-chemist-${row.id}`} onClick={() => { setEditing(row); setModalOpen(true); }} className="btn-ghost btn-sm">
    //                             <Pencil className="w-3.5 h-3.5" />
    //                         </button>
    //                         {/* <button
    //                             id={`toggle-chemist-${row.id}`}
    //                             onClick={() => handleToggle(row.id)}
    //                             className={`btn-sm ${row.active ? 'btn-secondary text-danger' : 'btn-secondary text-success'}`}
    //                         >
    //                             {row.Active ? 'Deactivate' : 'Activate'}
    //                         </button> */}
    //                     </div>
    //                 ) : null,
    //         }
    //         : col
    // );

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Chemist List"
                subtitle={`${chemists.length} chemists found`}
                action={
                    isManager && (
                        <button id="add-chemist-btn" onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">
                            <Plus className="w-4 h-4" /> Add Chemist
                        </button>
                    )
                }
            />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by name or city…"
                filters={[
                    { id: 'city', label: 'City', value: filterCityId, onChange: setFilterCityId, options: CITIES.map((c) => ({ value: c._id, label: c.cityName })) },
                    { id: 'area', label: 'Area', value: filterAreaId, onChange: setFilterAreaId, options: AREAS.map((a) => ({ value: a._id, label: a.areaName })) },
                    { id: 'chemistType', label: 'Chemist Type', value: filterType, onChange: setFilterType, options: CHEMIST_TYPES.map((t) => ({ value: t, label: t })) },
                ]}
                onClear={() => { setSearch(''); setFilterCityId(''); setFilterAreaId(''); setFilterType(''); }}
            />

            <DataTable columns={COLUMNS} data={chemists} loading={loading} emptyMessage="No such Chemist found" />

            {isManager && (
                <ChemistFormModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    editing={editing}
                    onSaved={fetch}
                    CITIES={CITIES}
                />
            )}
        </div>
    );
}

function ChemistFormModal({ isOpen, onClose, editing, onSaved, CITIES }) {
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
    const [formAreas, setFormAreas] = useState([]);
    const selectedCityId = watch('cityId');

    useEffect(() => {
        if (editing) reset({ name: editing.name, cityId: editing.cityId, areaId: editing.areaId, chemistType: editing.chemistType });
        else reset({ name: '', cityId: '', areaId: '', chemistType: '' });
    }, [editing, reset]);

    useEffect(() => {
        if (!selectedCityId) { setFormAreas([]); return; }
        chemistsApi.getAreas(selectedCityId).then((res) => setFormAreas(res.data)).catch(console.error);
    }, [selectedCityId]);

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
                        <select id="chem-city" {...register('cityId')} className={errors.cityId ? 'form-input-error form-select' : 'form-select'}>
                            <option value="">Select City</option>
                            {CITIES.map((c) => <option key={c._id} value={c._id}>{c.cityName}</option>)}
                        </select>
                        {errors.cityId && <p className="form-error">⚠ {errors.cityId.message}</p>}
                    </div>
                    <div>
                        <label className="form-label">Area *</label>
                        <select id="chem-area" {...register('areaId')} disabled={!selectedCityId} className={errors.areaId ? 'form-input-error form-select' : 'form-select'}>
                            <option value="">{selectedCityId ? 'Select Area' : 'Select City first'}</option>
                            {formAreas.map((a) => <option key={a._id} value={a._id}>{a.areaName}</option>)}
                        </select>
                        {errors.areaId && <p className="form-error">⚠ {errors.areaId.message}</p>}
                    </div>
                </div>
                <div>
                    <label className="form-label">Chemist Type *</label>
                    <select id="chem-type" {...register('chemistType')} className={errors.chemistType ? 'form-input-error form-select' : 'form-select'}>
                        <option value="">Select Type</option>
                        {CHEMIST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.chemistType && <p className="form-error">⚠ {errors.chemistType.message}</p>}
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