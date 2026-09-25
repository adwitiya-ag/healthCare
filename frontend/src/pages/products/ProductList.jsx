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
import { productsApi } from '../../api/productsApi';
import { companiesApi } from '../../api/companiesApi';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  companyId: z.string().min(1, 'Company is required'),
  strength: z.string().min(1, 'Strength is required'),
  packSize: z.string().min(1, 'Pack size is required'),
  mrp: z.coerce.number().positive('MRP must be positive'),
});

const COLUMNS = [
  { key: 'name', label: 'Product Name' },
  { key: 'companyName', label: 'Company' },
  { key: 'strength', label: 'Strength' },
  { key: 'packSize', label: 'Pack Size' },
  { key: 'mrp', label: 'MRP (₹)', render: (v) => `₹${Number(v).toFixed(2)}` },
  { key: 'active', label: 'Status', render: (v) => <StatusBadge active={v} /> },
  { key: 'actions', label: 'Actions', sortable: false },
];

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await companiesApi.getAll();
        setCompanies(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCompanies();
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAll({ search });
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleToggle = async (product) => {
    try {
      await productsApi.toggleActive(product);
      fetch();
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
              <button id={`edit-product-${row.id}`} onClick={() => { setEditing(row); setModalOpen(true); }} className="btn-ghost btn-sm">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                id={`toggle-product-${row.id}`}
                onClick={() => handleToggle(row)}
                className={`btn-sm ${row.active ? 'btn-secondary text-danger' : 'btn-secondary text-success'}`}
              >
                {row.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ),
        }
      : col
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Product Catalogue"
        subtitle={`${products.length} products`}
        action={
          <button id="add-product-btn" onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        }
      />

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search products…" filters={[]} onClear={() => setSearch('')} />

      <DataTable columns={cols} data={products} loading={loading} emptyMessage="No products found" />

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={fetch}
        companies={companies}
      />
    </div>
  );
}

function ProductFormModal({ isOpen, onClose, editing, onSaved, companies }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        companyId: editing.companyId,
        strength: editing.strength,
        packSize: editing.packSize,
        mrp: editing.mrp,
      });
    } else {
      reset({ name: '', companyId: '', strength: '', packSize: '', mrp: '' });
    }
  }, [editing, reset]);

  const onSubmit = async (data) => {
    try {
      if (editing) await productsApi.update(editing.id, { ...data, active: editing.active });
      else await productsApi.create(data);
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Product' : 'Add Product'} id="product-modal">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="product-form">
        <div>
          <label className="form-label">Product Name *</label>
          <input id="prod-name" type="text" {...register('name')} className={errors.name ? 'form-input-error' : 'form-input'} placeholder="e.g. Cardiofix 10mg" autoFocus />
          {errors.name && <p className="form-error">⚠ {errors.name.message}</p>}
        </div>
        <div>
          <label className="form-label">Company *</label>
          <select id="prod-company" {...register('companyId')} className={errors.companyId ? 'form-input-error form-select' : 'form-select'}>
            <option value="">Select Company</option>
            {companies.map((c) => <option key={c._id} value={c._id}>{c.companyName}</option>)}
          </select>
          {errors.companyId && <p className="form-error">⚠ {errors.companyId.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Strength *</label>
            <input id="prod-strength" type="text" {...register('strength')} className={errors.strength ? 'form-input-error' : 'form-input'} placeholder="e.g. 10mg" />
            {errors.strength && <p className="form-error">⚠ {errors.strength.message}</p>}
          </div>
          <div>
            <label className="form-label">Pack Size *</label>
            <input id="prod-packsize" type="text" {...register('packSize')} className={errors.packSize ? 'form-input-error' : 'form-input'} placeholder="e.g. 10x10" />
            {errors.packSize && <p className="form-error">⚠ {errors.packSize.message}</p>}
          </div>
        </div>
        <div>
          <label className="form-label">MRP (₹) *</label>
          <input id="prod-mrp" type="number" step="0.01" {...register('mrp')} className={errors.mrp ? 'form-input-error' : 'form-input'} placeholder="100.00" />
          {errors.mrp && <p className="form-error">⚠ {errors.mrp.message}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <button id="prod-cancel" type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="prod-save" type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Add Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}