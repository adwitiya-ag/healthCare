import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Modal from '../../components/Modal';
import { distributionApi } from '../../api/distributionApi';
import { doctorsApi } from '../../api/doctorsApi';
import { productsApi } from '../../api/productsApi';
import { useAuth } from '../../context/AuthContext';
import {toast} from 'react-toastify'

const schema = z.object({
    doctorId:  z.string().min(1, 'Select a doctor'),
    productId: z.string().min(1, 'Select a product'),
    qty:       z.coerce.number().int().positive('Quantity must be at least 1'),
});

const COLUMNS = [
    { key: 'date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'doctorName', label: 'Doctor', render: (_, row) => row.doctorName || "-"},
    { key: 'productName', label: 'Product', render: (_, row) => row.productName || "-"},
    { key: 'quantity', label: 'Quantity', render: (v) => <span className="font-semibold">{v}</span> },
    { key: 'mrName', label: 'MR/Manager', render: (_, row) =>
        row.id ? row.mrName : "-",},
    { key: 'actions', label: 'Actions', sortable: false },
];

export default function DistributionLog() {
    const { user } = useAuth();
    // const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const [data, setData] = useState([]);


    const fetchRecords = useCallback(async () => {
        setLoading(true);

        try {
            const result = await distributionApi.getAll({
                mrId: user?._id
            });

            console.log("Distribution result: ", result)

            setData(result);
        } finally {
            setLoading(false);
        }
    }, [user?._id]);


    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);


    const records = useMemo(() => {
        if (!search) return data;

        const q = search.toLowerCase();

        return data.filter((d) =>
            d.doctorId?.doctorName?.toLowerCase().includes(q) ||
            d.productId?.productName?.toLowerCase().includes(q)
        );

    }, [data, search]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this distribution record?')) return;
        console.log("Delete id: ", id)
        const response = await distributionApi.deleteRecord(id);
        if(response.statusCode == 200){
            fetchRecords();
            toast.success("Record deleted successfully");
        }
        else{
            toast.error("Record delete failed")
        }
    };

    const cols = COLUMNS.map(col => col.key === 'actions'
        ? {
            ...col, render: (_, row) => (
                <button
                    id={`delete-distribution-${row.id}`}
                    onClick={() => handleDelete(row.id)}
                    className="btn-sm btn-secondary text-danger"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )
        }
        : col
    );

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Distribution Log"
                subtitle={`${records.length} records`}
                action={
                    <button id="add-distribution-btn" onClick={() => setModalOpen(true)} className="btn-primary">
                        <Plus className="w-4 h-4" /> Record Distribution
                    </button>
                }
            />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search distributions…"
                filters={[]}
                onClear={() => setSearch('')}
            />

            <DataTable columns={cols} data={records} loading={loading} emptyMessage="No distribution records found" />

            <DistributionFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchRecords} user={user} />
            
        </div>
    );
}

function DistributionFormModal({ isOpen, onClose, onSaved, user }) {
    const [doctors, setDoctors] = useState([]);
    const [products, setProducts] = useState([]);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { doctorId: '', productId: '', qty: 1 },
    });

    useEffect(() => {
        if (!isOpen) return;
        
        doctorsApi.getAll({ mrId: user?.id }).then(setDoctors);
        productsApi.getAll().then(setProducts);
        console.log(products)
        reset({ doctorId: '', productId: '', qty: 1 });
    }, [isOpen, user, reset]);

    const onSubmit = async (data) => {
        const doctor  = doctors.find(d => String(d.id) === data.doctorId);
        const product = products.find(p => String(p.id) === data.productId);
        const response = await distributionApi.record({
            doctorId:    data.doctorId,
            doctorName:  doctor?.name  || '',
            productId:   data.productId,
            productName: product?.name || '',
            qty:         data.qty,
            date:        new Date().toISOString().split('T')[0],
            mrId:        user.id,
            mrName:      user.name,
        });

        if(response) toast.success("Record added successfully");
        else toast.error("Record could not be added");
        onSaved();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Distribution" id="distribution-modal">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="distribution-form">
                <div>
                    <label className="form-label">Doctor *</label>
                    <select id="dist-doctor" {...register('doctorId')} className={errors.doctorId ? 'form-input-error form-select' : 'form-select'} autoFocus>
                        <option value="">Select doctor…</option>
                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name}{d.city ? ` — ${d.city}` : ''}</option>)}
                    </select>
                    {errors.doctorId && <p className="form-error">⚠ {errors.doctorId.message}</p>}
                </div>

                <div>
                    <label className="form-label">Product *</label>
                    <select id="dist-product" {...register('productId')} className={errors.productId ? 'form-input-error form-select' : 'form-select'}>
                        <option value="">Select product…</option>
                        {products.filter(p => p.active !== false).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {errors.productId && <p className="form-error">⚠ {errors.productId.message}</p>}
                </div>

                <div>
                    <label className="form-label">Quantity *</label>
                    <input id="dist-qty" type="number" min={1} {...register('qty')} className={errors.qty ? 'form-input-error' : 'form-input'} placeholder="1" />
                    {errors.qty && <p className="form-error">⚠ {errors.qty.message}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                    <button id="dist-cancel" type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                    <button id="dist-save" type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                        {isSubmitting ? 'Saving…' : 'Record'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}