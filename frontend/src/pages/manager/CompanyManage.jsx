import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { companiesApi } from '../../api/companiesApi';

/* ── Zod Schema ──────────────────────────────────────────── */
const companySchema = z.object({
  companyName: z.string().min(2, 'Company name is required (min 2 chars)'),
  email: z.string().email('Please enter a valid email'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
});

/* ── Column Definitions ──────────────────────────────────── */
const COLUMNS = [
  { key: 'companyName', label: 'Company Name' },
  { key: 'email', label: 'Email', render: (v) => <span className="text-slate-500 text-xs">{v}</span> },
  { key: 'phoneNumber', label: 'Phone' },
  { key: 'isActive', label: 'Status', render: (v) => <StatusBadge active={v} /> },
  { key: 'actions', label: 'Actions', sortable: false },
];

/* ═══════════════════════════════════════════════════════════
   Company Management Page
   ═══════════════════════════════════════════════════════════ */
export default function CompanyManage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewing, setViewing] = useState(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await companiesApi.getAll({ search, isActive: statusFilter || undefined });
      setCompanies(data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this company?')) return;
    try {
      await companiesApi.delete(id);
      fetchCompanies();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleView = (row) => {
    setViewing(row);
    setViewModalOpen(true);
  };

  const cols = COLUMNS.map(col =>
    col.key === 'actions'
      ? {
          ...col,
          render: (_, row) => (
            <div className="flex items-center gap-2">
              <button
                id={`view-company-${row._id}`}
                onClick={() => handleView(row)}
                className="btn-ghost btn-sm text-primary-600"
                title="View"
              >
                View
              </button>
              <button
                id={`edit-company-${row._id}`}
                onClick={() => { setEditing(row); setModalOpen(true); }}
                className="btn-ghost btn-sm"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                id={`delete-company-${row._id}`}
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
    <div className="animate-fade-in">
      <PageHeader
        title="Company Management"
        subtitle={`${companies.length} companies`}
        action={
          <button id="add-company-btn" onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Company
          </button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search companies…"
        filters={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ],
          },
        ]}
        onClear={() => { setSearch(''); setStatusFilter(''); }}
      />

      <DataTable
        columns={cols}
        data={companies.map(c => ({ ...c, id: c._id }))}
        loading={loading}
        emptyMessage="No companies found"
      />

      <CompanyFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={fetchCompanies}
      />

      <CompanyViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        company={viewing}
      />
    </div>
  );
}

/* ── Company Form Modal ──────────────────────────────────── */
function CompanyFormModal({ isOpen, onClose, editing, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(companySchema),
  });

  useEffect(() => {
    if (editing) {
      reset({
        companyName: editing.companyName,
        email: editing.email,
        phoneNumber: editing.phoneNumber,
      });
    } else {
      reset({ companyName: '', email: '', phoneNumber: '' });
    }
  }, [editing, reset]);

  const onSubmit = async (data) => {
    try {
      if (editing) await companiesApi.update(editing._id, data);
      else await companiesApi.create(data);
      onSaved();
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Company' : 'Add Company'} id="company-modal">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="company-form">
        <div>
          <label className="form-label">Company Name *</label>
          <input
            id="company-name"
            type="text"
            {...register('companyName')}
            className={errors.companyName ? 'form-input-error' : 'form-input'}
            placeholder="e.g. Cipla Ltd."
            autoFocus
          />
          {errors.companyName && <p className="form-error">⚠ {errors.companyName.message}</p>}
        </div>
        <div>
          <label className="form-label">Email *</label>
          <input
            id="company-email"
            type="email"
            {...register('email')}
            className={errors.email ? 'form-input-error' : 'form-input'}
            placeholder="e.g. contact@cipla.com"
          />
          {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
        </div>
        <div>
          <label className="form-label">Phone Number *</label>
          <input
            id="company-phone"
            type="text"
            {...register('phoneNumber')}
            className={errors.phoneNumber ? 'form-input-error' : 'form-input'}
            placeholder="e.g. 9876543210"
          />
          {errors.phoneNumber && <p className="form-error">⚠ {errors.phoneNumber.message}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <button id="company-cancel" type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="company-save" type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Saving…' : editing ? 'Update Company' : 'Add Company'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Company View Modal ──────────────────────────────────── */
function CompanyViewModal({ isOpen, onClose, company }) {
  if (!company) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Company Details" id="company-view-modal">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Company Name</p>
            <p className="text-sm font-semibold text-slate-800">{company.companyName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Status</p>
            <StatusBadge active={company.isActive} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm text-slate-600">{company.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Phone</p>
            <p className="text-sm text-slate-600">{company.phoneNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Created</p>
            <p className="text-sm text-slate-600">
              {company.createdAt ? new Date(company.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Last Updated</p>
            <p className="text-sm text-slate-600">
              {company.updatedAt ? new Date(company.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button id="company-view-close" type="button" onClick={onClose} className="btn-secondary flex-1">Close</button>
        </div>
      </div>
    </Modal>
  );
}
