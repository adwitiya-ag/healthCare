import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { distributionApi } from '../../api/distributionApi';

const COLUMNS = [
  { key: 'date',        label: 'Date' },
  { key: 'doctorName',  label: 'Doctor' },
  { key: 'productName', label: 'Product' },
  { key: 'qty',         label: 'Quantity', render: (v) => <span className="font-semibold">{v}</span> },
  { key: 'mrName',      label: 'MR' },
];

export default function DistributionLog() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await distributionApi.getAll({ dateFrom, dateTo });
    setRecords(data);
    setLoading(false);
  }, [dateFrom, dateTo]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Distribution Log" subtitle={`${records.length} records`} />

      {/* Date range filter */}
      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3 items-end">
        <div>
          <label className="form-label">From Date</label>
          <input id="dist-date-from" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="form-input" />
        </div>
        <div>
          <label className="form-label">To Date</label>
          <input id="dist-date-to" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="form-input" />
        </div>
        {(dateFrom || dateTo) && (
          <button id="dist-clear" onClick={() => { setDateFrom(''); setDateTo(''); }} className="btn-secondary">Clear</button>
        )}
      </div>

      <DataTable columns={COLUMNS} data={records} loading={loading} emptyMessage="No distribution records found" />
    </div>
  );
}
