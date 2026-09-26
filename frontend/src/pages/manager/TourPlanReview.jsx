import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { tourPlansApi } from '../../api/visitsApi';

const COLUMNS = [
  {
    key: 'salespersonId',
    label: 'MR Name',
    render: (v) => (v ? `${v.firstName} ${v.lastName}` : '—'),
  },
  { key: 'originalFileName', label: 'File Name' },
  {
    key: 'createdAt',
    label: 'Uploaded On',
    render: (v) => new Date(v).toLocaleDateString(),
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (v) => (
      <span className={v ? 'text-green-600 font-medium' : 'text-gray-400'}>
        {v ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'fileUrl',
    label: 'File',
    sortable: false,
    render: (v) => (
      
      <a href={v}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
      >
        <ExternalLink className="w-3.5 h-3.5" /> View File
      </a>
    ),
  },
];

export default function TourPlanReview() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    tourPlansApi
      .getAll()
      .then((p) => setPlans(p))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Tour Plan Review" subtitle={`${plans.length} plans uploaded`} />
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <DataTable
        columns={COLUMNS}
        data={plans}
        loading={loading}
        emptyMessage="No tour plans uploaded"
      />
    </div>
  );
}