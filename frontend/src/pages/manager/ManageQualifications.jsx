import { useState } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { QUALIFICATIONS as INIT_QUALS } from '../../mocks/mockEnums';

const schema = z.object({ label: z.string().min(1, 'Label is required') });

export default function ManageQualifications() {
  const [items, setItems] = useState(INIT_QUALS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const openAdd = () => { setEditing(null); reset({ label: '' }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); reset({ label: item.label }); setModalOpen(true); };

  const onSubmit = async (data) => {
    // await doctorsapi.addQualification(name)
    await new Promise(r => setTimeout(r, 200));
    if (editing) {
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...data } : i));
    } else {
      setItems(prev => [...prev, { id: Date.now(), label: data.label, active: true }]);
    }
    setModalOpen(false);
  };

  const toggle = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, active: !i.active } : i));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Manage Qualifications"
        subtitle="Add, edit and toggle doctor qualifications"
        action={
          <button id="add-qualification-btn" onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Qualification
          </button>
        }
      />

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Qualification</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td className="font-medium">{item.label}</td>
                  <td><StatusBadge active={item.active} /></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button id={`edit-qual-${item.id}`} onClick={() => openEdit(item)} className="btn-ghost btn-sm">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button id={`toggle-qual-${item.id}`} onClick={() => toggle(item.id)} className="btn-ghost btn-sm">
                        {item.active
                          ? <ToggleRight className="w-5 h-5 text-success" />
                          : <ToggleLeft className="w-5 h-5 text-slate-400" />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Qualification' : 'Add Qualification'} id="qual-modal">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="qualification-form">
          <div>
            <label className="form-label">Qualification Label *</label>
            <input id="qual-label" type="text" {...register('label')} className={errors.label ? 'form-input-error' : 'form-input'} placeholder="e.g. MBBS" autoFocus />
            {errors.label && <p className="form-error">⚠ {errors.label.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button id="qual-cancel" type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button id="qual-save" type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
