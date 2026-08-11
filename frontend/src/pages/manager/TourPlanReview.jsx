import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { tourPlansApi } from '../../api/visitsApi';

const COLUMNS = [
  { key: 'mrName',     label: 'MR Name' },
  { key: 'month',      label: 'Month' },
  { key: 'uploadedAt', label: 'Uploaded On' },
  { key: 'fileSize',   label: 'File Size' },
  { key: 'filename',   label: 'PDF',  sortable: false, render: (v) => (
    <a id={`view-tour-plan-${v}`} href="#" onClick={e => { e.preventDefault(); alert(`Would open: ${v}`); }} className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium">
      <ExternalLink className="w-3.5 h-3.5" /> View PDF
    </a>
  )},
];

export default function TourPlanReview() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tourPlansApi.getAll().then(p => { setPlans(p); setLoading(false); });
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Tour Plan Review" subtitle={`${plans.length} plans uploaded`} />
      <DataTable columns={COLUMNS} data={plans} loading={loading} emptyMessage="No tour plans uploaded" />
    </div>
  );
}
