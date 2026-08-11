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

const schema = z.object({
  name:        z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 chars'),
  price:       z.coerce.number().positive('Price must be positive'),
  category:    z.string().min(1, 'Category is required'),
});

const CATEGORIES = ['Cardiovascular','Diabetology','Neurology','Dermatology','Pulmonology','Orthopaedic','Gynaecology','Paediatrics','Gastro'];

const COLUMNS = [
  { key: 'name',        label: 'Product Name' },
  { key: 'category',    label: 'Category' },
  { key: 'description', label: 'Description', render: (v) => <span className="text-slate-500 text-xs">{v}</span> },
  { key: 'price',       label: 'Price (₹)', render: (v) => `₹${Number(v).toFixed(2)}` },
  { key: 'active',      label: 'Status', render: (v) => <StatusBadge active={v} /> },
  { key: 'actions',     label: 'Actions', sortable: false },
];

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await productsApi.getAll({ search });
    setProducts(data);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleToggle = async (id) => { await productsApi.toggleActive(id); fetch(); };

  const cols = COLUMNS.map(col => col.key === 'actions'
    ? { ...col, render: (_, row) => (
        <div className="flex items-center gap-2">
          <button id={`edit-product-${row.id}`} onClick={() => { setEditing(row); setModalOpen(true); }} className="btn-ghost btn-sm"><Pencil className="w-3.5 h-3.5" /></button>
          <button id={`toggle-product-${row.id}`} onClick={() => handleToggle(row.id)} className={`btn-sm ${row.active ? 'btn-secondary text-danger' : 'btn-secondary text-success'}`}>
            {row.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )}
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

      <ProductFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} editing={editing} onSaved={fetch} />
    </div>
  );
}

function ProductFormModal({ isOpen, onClose, editing, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editing) reset(editing);
    else reset({ name: '', description: '', price: '', category: '' });
  }, [editing, reset]);

  const onSubmit = async (data) => {
    if (editing) await productsApi.update(editing.id, data);
    else await productsApi.create(data);
    onSaved(); onClose();
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
          <label className="form-label">Description *</label>
          <textarea id="prod-desc" rows={3} {...register('description')} className={errors.description ? 'form-input-error' : 'form-input'} placeholder="Brief product description" />
          {errors.description && <p className="form-error">⚠ {errors.description.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Price (₹) *</label>
            <input id="prod-price" type="number" step="0.01" {...register('price')} className={errors.price ? 'form-input-error' : 'form-input'} placeholder="100.00" />
            {errors.price && <p className="form-error">⚠ {errors.price.message}</p>}
          </div>
          <div>
            <label className="form-label">Category *</label>
            <select id="prod-category" {...register('category')} className={errors.category ? 'form-input-error form-select' : 'form-select'}>
              <option value="">Select</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="form-error">⚠ {errors.category.message}</p>}
          </div>
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
