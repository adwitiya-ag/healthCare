import { useState, useEffect } from 'react';
import { ZoomIn } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { visitsApi } from '../../api/visitsApi';

const COLUMNS = [
  { key: 'date',        label: 'Date' },
  { key: 'mrName',      label: 'MR Name' },
  { key: 'entityName',  label: 'Entity' },
  { key: 'entityType',  label: 'Type',   render: (v) => <span className={`badge ${v === 'doctor' ? 'badge-info' : 'badge-warning'}`}>{v}</span> },
  { key: 'visitType',   label: 'Visit Type' },
  { key: 'photo',       label: 'Photo Proof', sortable: false, render: (_, row) => <PhotoThumb row={row} /> },
];

function PhotoThumb({ row }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button id={`view-photo-${row.id}`} onClick={() => setOpen(true)} className="relative group">
        <img src={row.photo} alt="Visit proof" className="w-12 h-10 object-cover rounded-lg border border-surface-border group-hover:opacity-80 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg">
          <ZoomIn className="w-4 h-4 text-white" />
        </div>
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title={`Visit Proof — ${row.entityName}`} size="lg" id={`photo-modal-${row.id}`}>
        <div className="space-y-3">
          <img src={row.photo} alt="Visit proof" className="w-full rounded-xl object-contain max-h-96" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-slate-400 text-xs mb-0.5">MR</p><p className="font-medium">{row.mrName}</p></div>
            <div><p className="text-slate-400 text-xs mb-0.5">Entity</p><p className="font-medium">{row.entityName}</p></div>
            <div><p className="text-slate-400 text-xs mb-0.5">Visit Type</p><p className="font-medium">{row.visitType}</p></div>
            <div><p className="text-slate-400 text-xs mb-0.5">Date</p><p className="font-medium">{row.date}</p></div>
            <div className="col-span-2"><p className="text-slate-400 text-xs mb-0.5">Notes</p><p className="font-medium">{row.notes}</p></div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function VisitReview() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    visitsApi.getAll().then(v => { setVisits(v); setLoading(false); });
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Visit Review" subtitle={`${visits.length} visits logged`} />
      <DataTable columns={COLUMNS} data={visits} loading={loading} emptyMessage="No visits recorded yet" />
    </div>
  );
}
