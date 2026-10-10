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
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
    name: z.string().min(3, 'Name is required'),
    cityId: z.string().min(1, 'City is required'),
    areaId: z.string().min(1, 'Area is required'),
    qualificationId: z.string().min(1, 'Qualification is required'),
    specializationId: z.string().min(1, 'Specialisation is required'),
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

function DoctorList() {
    const { isManager } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCityId, setFilterCityId] = useState('');
    const [filterAreaId, setFilterAreaId] = useState('');
    const [filterQualId, setFilterQualId] = useState('');
    const [filterSpecId, setFilterSpecId] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [CITIES, setCITIES] = useState([]);
    const [AREAS, setAREAS] = useState([]);
    const [QUALIFICATIONS, setQUALIFICATIONS] = useState([]);
    const [SPECIALIZATIONS, setSPECIALIZATIONS] = useState([]);

    useEffect(() => {
        const fetchSpecialization = async () => {
            try {
                const response = await doctorsApi.getSpecialization();
                const activeItems = response.data.filter((s) => s.isActive);
                setSPECIALIZATIONS(activeItems);
            } catch (error) { console.error(error); }
        };
        const fetchQualifications = async () => {
            try {
                const response = await doctorsApi.getQualifications();
                const activeItems = response.data.filter((s) => s.isActive);
                setQUALIFICATIONS(activeItems);
            } catch (error) { console.error(error); }
        };
        const fetchCities = async () => {
            try {
                const response = await doctorsApi.getCities();
                setCITIES(response.data);
            } catch (error) { console.error(error); }
        };
        fetchSpecialization();
        fetchQualifications();
        fetchCities();
    }, []);

    // Cascading: refetch areas whenever the FILTER city changes; reset area filter
    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await doctorsApi.getAreas(filterCityId || undefined);
                setAREAS(response.data);
            } catch (error) { console.error(error); }
        };
        fetchAreas();
        setFilterAreaId('');
    }, [filterCityId]);

    const fetch = useCallback(async () => {
        setLoading(true);
        const data = await doctorsApi.getAll({
            search,
            cityId: filterCityId,
            areaId: filterAreaId,
            qualificationId: filterQualId,
            specializationId: filterSpecId,
        });
        setDoctors(data);
        setLoading(false);
    }, [search, filterCityId, filterAreaId, filterQualId, filterSpecId]);

    useEffect(() => { fetch(); }, [fetch]);

    const handleToggle = async (id) => { await doctorsApi.toggleDoctor(id); fetch(); };

    const openAdd = () => { setEditing(null); setModalOpen(true); };
    const openEdit = (row) => { setEditing(row); setModalOpen(true); };

    const cols = COLUMNS.map((col) =>
        col.key === 'actions'
            ? {
                ...col,
                render: (_, row) => (
                    <div className="flex items-center gap-2">
                        {isManager && (
                            <>
                                <button id={`edit-doctor-${row.id}`} onClick={() => openEdit(row)} className="btn-ghost btn-sm">
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    id={`toggle-doctor-${row.id}`}
                                    onClick={() => handleToggle(row.id)}
                                    className={`btn-sm ${row.active ? 'btn-secondary text-danger' : 'btn-secondary text-success'}`}
                                >
                                    {row.active ? 'Deactivate' : 'Activate'}
                                </button>
                            </>
                        )}
                    </div>
                ),
            }
            : col
    );

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Doctor List"
                subtitle={`${doctors.length} doctors found`}
                action={
                    isManager && (
                        <button id="add-doctor-btn" onClick={openAdd} className="btn-primary">
                            <Plus className="w-4 h-4" /> Add Doctor
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
                    { id: 'qualification', label: 'Qualification', value: filterQualId, onChange: setFilterQualId, options: QUALIFICATIONS.map((q) => ({ value: q._id, label: q.name })) },
                    { id: 'specialisation', label: 'Specialisation', value: filterSpecId, onChange: setFilterSpecId, options: SPECIALIZATIONS.map((s) => ({ value: s._id, label: s.name })) },
                ]}
                onClear={() => { setSearch(''); setFilterCityId(''); setFilterAreaId(''); setFilterQualId(''); setFilterSpecId(''); }}
            />

            <DataTable columns={cols} data={doctors} loading={loading} emptyMessage="No such Doctor found" />

            {isManager && (
                <DoctorFormModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    editing={editing}
                    onSaved={fetch}
                    CITIES={CITIES}
                    QUALIFICATIONS={QUALIFICATIONS}
                    SPECIALIZATIONS={SPECIALIZATIONS}
                />
            )}
        </div>
    );
}

function DoctorFormModal({ isOpen, onClose, editing, onSaved, CITIES, QUALIFICATIONS, SPECIALIZATIONS }) {
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
    const [formAreas, setFormAreas] = useState([]);
    const selectedCityId = watch('cityId');

    useEffect(() => {
        if (editing) reset({ name: editing.name, cityId: editing.cityId, areaId: editing.areaId, qualificationId: editing.qualificationId, specializationId: editing.specializationId });
        else reset({ name: '', cityId: '', areaId: '', qualificationId: '', specializationId: '' });
    }, [editing, reset]);

    // cascading: whenever chosen city changes, load its areas
    useEffect(() => {
        if (!selectedCityId) { setFormAreas([]); return; }
        doctorsApi.getAreas(selectedCityId).then((res) => setFormAreas(res.data)).catch(console.error);
    }, [selectedCityId]);

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
                        <select id="doc-city" {...register('cityId')} className={errors.cityId ? 'form-input-error form-select' : 'form-select'}>
                            <option value="">Select City</option>
                            {CITIES.map((c) => <option key={c._id} value={c._id}>{c.cityName}</option>)}
                        </select>
                        {errors.cityId && <p className="form-error">⚠ {errors.cityId.message}</p>}
                    </div>
                    <div>
                        <label className="form-label">Area *</label>
                        <select id="doc-area" {...register('areaId')} disabled={!selectedCityId} className={errors.areaId ? 'form-input-error form-select' : 'form-select'}>
                            <option value="">{selectedCityId ? 'Select Area' : 'Select City first'}</option>
                            {formAreas.map((a) => <option key={a._id} value={a._id}>{a.areaName}</option>)}
                        </select>
                        {errors.areaId && <p className="form-error">⚠ {errors.areaId.message}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="form-label">Qualification *</label>
                        <select id="doc-qualification" {...register('qualificationId')} className={errors.qualificationId ? 'form-input-error form-select' : 'form-select'}>
                            <option value="">Select</option>
                            {QUALIFICATIONS.map((q) => <option key={q._id} value={q._id}>{q.name}</option>)}
                        </select>
                        {errors.qualificationId && <p className="form-error">⚠ {errors.qualificationId.message}</p>}
                    </div>
                    <div>
                        <label className="form-label">Specialisation *</label>
                        <select id="doc-specialisation" {...register('specializationId')} className={errors.specializationId ? 'form-input-error form-select' : 'form-select'}>
                            <option value="">Select</option>
                            {SPECIALIZATIONS.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        {errors.specializationId && <p className="form-error">⚠ {errors.specializationId.message}</p>}
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