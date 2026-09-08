import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, CheckCircle } from 'lucide-react';
import FileUpload from '../../components/FileUpload';
import { doctorsApi } from '../../api/doctorsApi';
import { chemistsApi } from '../../api/chemistsApi';
import { visitsApi } from '../../api/visitsApi';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
    entityType: z.enum(['doctor', 'chemist']),
    entityId: z.string().min(1, 'Select a doctor or chemist'),
    notes: z.string().min(5, 'Notes must be at least 5 characters'),
});

export default function LogVisitForm({ mrId: mrIdProp, onSuccess, onCancel }) {
    const { user } = useAuth();
    const mrId = mrIdProp || user?.id; // falls back to the logged-in MR if none passed in

    const [entityType, setEntityType] = useState('doctor');
    const [doctors, setDoctors] = useState([]);
    const [chemists, setChemists] = useState([]);
    const [photoFile, setPhotoFile] = useState([]);
    const [photoError, setPhotoError] = useState('');
    const [success, setSuccess] = useState(false);
    const [location, setLocation] = useState(null);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { entityType: 'doctor', entityId: '', notes: '', location: '' },
    });

    const getAddress = async (lat, lng) => visitsApi.getAddress({ lat, lng });

    useEffect(() => {

    const fetchEntities = async () => {
        try {
            const [doctorsData, chemistsData] = await Promise.all([
                doctorsApi.getAll(),
                chemistsApi.getAll(),
            ]);

            setDoctors(doctorsData);
            setChemists(chemistsData);
        } catch (error) {
            console.error('Failed to fetch doctors/chemists:', error);
        }
    };

    fetchEntities();
}, [mrId]);

    useEffect(() => {
    if (!navigator.geolocation) {
        console.log('Location not supported');
        return;
    }

    const watchId = navigator.geolocation.watchPosition(
        async (position) => {
            const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
            };

            setLocation(coords);

            try {
                const address = await visitsApi.getAddress({
                    lat: coords.latitude,
                    lng: coords.longitude,
                });

                if (address?.address) {
                    setValue('location', address.address);
                }
            } catch (error) {
                console.error('Failed to get address:', error);
            }
        },
        (err) => {
            console.error('Geolocation error:', err);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
        }
    );

    return () => {
        navigator.geolocation.clearWatch(watchId);
    };
}, [setValue]);

    const watchedType = watch('entityType');
    const entities = watchedType === 'doctor' ? doctors : chemists;

    const onSubmit = async (data) => {
        if (!photoFile || photoFile.length === 0) {
            setPhotoError('Photo proof is required');
            return;
        }
        if (!location) {
            alert('Location not detected');
            return;
        }

        const formData = new FormData();
        if (data.entityType === 'doctor') {
            formData.append('doctorId', data.entityId);
        } else {
            formData.append('chemistId', data.entityId);
        }
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);
        formData.append('accuracy', location.accuracy);
        formData.append('Notes', data.notes);
        photoFile.forEach((file) => formData.append('photos', file));

        await visitsApi.addVisitProof(formData);

        setSuccess(true);
        onSuccess?.(); // let the parent (history page) refetch immediately

        setTimeout(() => {
            setSuccess(false);
            reset();
            setPhotoFile([]);
            setLocation(null);
            onCancel?.(); // auto-close the modal after showing the success state
        }, 1500);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <CheckCircle className="w-16 h-16 text-success mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">Visit Logged!</h3>
                <p className="text-slate-500 text-sm">Your visit has been recorded successfully.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="log-visit-form">
            <div>
                <label className="form-label">Visit Type</label>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                    {['doctor', 'chemist'].map((type) => (
                        <button
                            key={type}
                            type="button"
                            id={`entity-type-${type}`}
                            onClick={() => { setEntityType(type); setValue('entityType', type); setValue('entityId', ''); }}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${entityType === type ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {type === 'doctor' ? '👨‍⚕️ Doctor' : '💊 Chemist'}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="form-label">Select {entityType === 'doctor' ? 'Doctor' : 'Chemist'} *</label>
                <select id="visit-entity" {...register('entityId')} className={errors.entityId ? 'form-input-error form-select' : 'form-select'}>
                    <option value="">Choose {entityType}…</option>
                    {entities.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.city}</option>)}
                </select>
                {errors.entityId && <p className="form-error">⚠ {errors.entityId.message}</p>}
            </div>

            <div>
                <label className="form-label">
                    <MapPin className="w-3.5 h-3.5 inline mr-1 text-primary-500" />
                    Location (auto-detected)
                </label>
                <input id="visit-location" type="text" {...register('location')} className={errors.location ? 'form-input-error' : 'form-input'} readOnly />
                {errors.location && <p className="form-error">⚠ {errors.location.message}</p>}
            </div>

            <div>
                <label className="form-label">Notes *</label>
                <textarea id="visit-notes" rows={4} {...register('notes')} className={errors.notes ? 'form-input-error' : 'form-input'} placeholder="Describe the visit, topics discussed, next steps…" />
                {errors.notes && <p className="form-error">⚠ {errors.notes.message}</p>}
            </div>

            <div>
                <label className="form-label">Photo Proof * (JPG/PNG only)</label>
                <FileUpload
                    id="visit-photo"
                    accept="image"
                    label="Upload Visit Photo"
                    value={photoFile}
                    multiple={true}
                    error={photoError}
                    onFileSelect={(files, err) => {
                        if (files.length === 0) {
                            setPhotoFile([]);
                        } else {
                            setPhotoFile((prev) => [...prev, ...files]);
                        }
                        setPhotoError(err || '');
                    }}
                />
            </div>

            <div className="flex gap-3 pt-1">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn-secondary flex-1 py-3">
                        Cancel
                    </button>
                )}
                <button id="log-visit-submit" type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-3">
                    {isSubmitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</> : 'Submit Visit'}
                </button>
            </div>
        </form>
    );
}