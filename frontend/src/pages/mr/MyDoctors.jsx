import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusBadge from '../../components/StatusBadge';
import { doctorsApi } from '../../api/doctorsApi';
import { QUALIFICATIONS, SPECIALISATIONS } from '../../mocks/mockEnums';
import { useAuth } from '../../context/AuthContext';

const COLUMNS = [
  { key: 'name',          label: 'Doctor Name' },
  { key: 'city',          label: 'City' },
  { key: 'area',          label: 'Area' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'specialisation',label: 'Specialisation' },
  { key: 'active',        label: 'Status', render: (v) => <StatusBadge active={v} /> },
];

export default function MyDoctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterQual, setFilterQual] = useState('');
  const [filterSpec, setFilterSpec] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await doctorsApi.getAll({ mrId: user?.id, search, qualification: filterQual, specialisation: filterSpec });
    setDoctors(data);
    setLoading(false);
  }, [user, search, filterQual, filterSpec]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Doctors" subtitle={`${doctors.length} doctors assigned to your territory`} />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name…"
        filters={[
          { id: 'qualification', label: 'Qualification', value: filterQual, onChange: setFilterQual, options: QUALIFICATIONS.map(q => ({ value: q.label, label: q.label })) },
          { id: 'specialisation', label: 'Specialisation', value: filterSpec, onChange: setFilterSpec, options: SPECIALISATIONS.map(s => ({ value: s.label, label: s.label })) },
        ]}
        onClear={() => { setSearch(''); setFilterQual(''); setFilterSpec(''); }}
      />

      <DataTable columns={COLUMNS} data={doctors} loading={loading} emptyMessage="No doctors assigned to your area" />
    </div>
  );
}
