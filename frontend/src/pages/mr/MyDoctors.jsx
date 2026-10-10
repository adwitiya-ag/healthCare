import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StatusBadge from '../../components/StatusBadge';
import { doctorsApi } from '../../api/doctorsApi';
import { useAuth } from '../../context/AuthContext';

const COLUMNS = [
    { key: 'name', label: 'Doctor Name' },
    { key: 'city', label: 'City' },
    { key: 'area', label: 'Area' },
    { key: 'qualification', label: 'Qualification' },
    { key: 'specialisation', label: 'Specialisation' },
    { key: 'active', label: 'Status', render: (v) => <StatusBadge active={v} /> },
];

export default function MyDoctors() {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterQualId, setFilterQualId] = useState('');
    const [filterSpecId, setFilterSpecId] = useState('');
    const [filterCityId, setFilterCityId] = useState('');
    const [filterAreaId, setFilterAreaId] = useState('');

    const [CITIES, setCITIES] = useState([]);
    const [AREAS, setAREAS] = useState([]);
    const [QUALIFICATIONS, setQUALIFICATIONS] = useState([]);
    const [SPECIALIZATIONS, setSPECIALIZATIONS] = useState([]);

    const fetch = useCallback(async () => {
        setLoading(true);
        const data = await doctorsApi.getAll({ 
            mrId: user?.id, 
            search, 
            qualificationId: filterQualId, 
            specialisationId: filterSpecId,
            cityId: filterCityId,
            areaId: filterAreaId,
        });
        setDoctors(data);
        setLoading(false);
    }, [user, search, filterQualId, filterSpecId, filterCityId, filterAreaId]);

    const fetchCities = async () => {
        try {
            const response = await doctorsApi.getCities();
            setCITIES(response.data);
        } catch (error) { console.error(error); }
    };

    const fetchAreas = async () => {
        try {
            const response = await doctorsApi.getAreas(filterCityId || undefined);
            setAREAS(response.data);
        } catch (error) { console.error(error); }
    };
    
    const fetchSpecialization = async () => {
        try {
            const response = await doctorsApi.getSpecialization();
            const activeItems = response.data.filter((s) => s.isActive);
            setSPECIALIZATIONS(activeItems);
        } catch (error) { console.error(error); }
    };
    const fetchQualifications = async () => {
        try {
            const response = await doctorsApi.getQualifications();
            const activeItems = response.data.filter((s) => s.isActive);
            setQUALIFICATIONS(activeItems);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetch();
    },[fetch]);

    useEffect(() => {
        fetchCities();
        fetchSpecialization();
        fetchQualifications();
    }, []);

    useEffect(() => {
            fetchAreas();
            setFilterAreaId('');
        }, [filterCityId]);

    return (
        <div className="animate-fade-in">
            <PageHeader title="My Doctors" subtitle={`${doctors.length} doctors assigned to your territory`} />

            <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by name…"
                filters={[
                    { id: 'city', label: 'City', value: filterCityId, onChange: setFilterCityId, options: CITIES.map((c) => ({ value: c._id, label: c.cityName })) },
                    { id: 'area', label: 'Area', value: filterAreaId, onChange: setFilterAreaId, options: AREAS.map((a) => ({ value: a._id, label: a.areaName })) },
                    { id: 'qualification', label: 'Qualification', value: filterQualId, onChange: setFilterQualId, options: QUALIFICATIONS.map((q) => ({ value: q._id, label: q.name })) },
                    { id: 'specialisation', label: 'Specialisation', value: filterSpecId, onChange: setFilterSpecId, options: SPECIALIZATIONS.map((s) => ({ value: s._id, label: s.name })) },
                ]}
                onClear={() => { setSearch(''); setFilterQualId(''); setFilterSpecId(''); setFilterCityId(''); setFilterAreaId('');}}
            />

            <DataTable columns={COLUMNS} data={doctors} loading={loading} emptyMessage="No doctors assigned to your area" />
        </div>
    );
}
