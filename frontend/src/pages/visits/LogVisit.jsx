import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import FileUpload from '../../components/FileUpload';
import { doctorsApi } from '../../api/doctorsApi';
import { chemistsApi } from '../../api/chemistsApi';
import { visitsApi } from '../../api/visitsApi';
import { VISIT_TYPES } from '../../mocks/mockEnums';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
    entityType: z.enum(['doctor', 'chemist']),
    entityId: z.string().min(1, 'Select a doctor or chemist'),
    notes: z.string().min(5, 'Notes must be at least 5 characters'),
});

export default function LogVisit() {
    const { user } = useAuth();
    const [entityType, setEntityType] = useState('doctor');
    const [doctors, setDoctors] = useState([]);
    const [chemists, setChemists] = useState([]);
    const [photoFile, setPhotoFile] = useState([]);
    const [photoError, setPhotoError] = useState('');
    const [success, setSuccess] = useState(false);

    const [location, setLocation] = useState(null)

    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { entityType: 'doctor', entityId: '', visitType: '', notes: '', location: '' },
    });

    const getAddress = async(lat,lng)=>{
        const data = await visitsApi.getAddress({lat, lng})
        return data;
    };

    useEffect(() => {
        doctorsApi.getAll({ mrId: user?.id }).then(setDoctors);
        chemistsApi.getAll({ mrId: user?.id }).then(setChemists);

        if(!navigator.geolocation){
            console.log("Location not supported");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
        async (position) => {

            const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };

            setLocation(coords);
            console.log(coords.accuracy)

            // convert coordinates to address
            const address = await getAddress(
                coords.latitude,
                coords.longitude
            );


            if(address){

                setValue(
                    "location",
                    address.address
                );
            }
        },
        (err) => {
            console.log(err.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
        }
    )
    return () => {
        navigator.geolocation.clearWatch(watchId);
    };
    }, []);

    const watchedType = watch('entityType');
    const entities = watchedType === 'doctor' ? doctors : chemists;

    const onSubmit = async (data) => {
        if (!photoFile || photoFile.length === 0) {
            setPhotoError("Photo proof is required");
            return;
        }

        if(!location){
            alert("Location not detected")
            return;
        }

        const formData = new FormData()

        if(data.entityType === "doctor"){
            formData.append("doctorId", data.entityId)
        }else{
            formData.append("chemistId", data.entityId)
        }

        // Location
        formData.append("latitude", location.latitude);
        formData.append("longitude", location.longitude);
        formData.append("accuracy", location.accuracy);

        // Notes
        formData.append("Notes", data.notes);

        // Photos
        photoFile.forEach((file) => {
            formData.append("photos", file);
        });

        await visitsApi.addVisitProof(formData);

        setSuccess(true);

        setTimeout(() => {
            setSuccess(false);
            reset();
            setPhotoFile([]);
            setLocation(null);
        }, 3000);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <CheckCircle className="w-20 h-20 text-success mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Visit Logged!</h2>
                <p className="text-slate-500">Your visit has been recorded successfully.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-2xl">
            <PageHeader title="Log a Visit" subtitle="Record your field visit details" />

            <div className="card p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="log-visit-form">
                    {/* Entity type tabs */}
                    <div>
                        <label className="form-label">Visit Type</label>
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                            {['doctor', 'chemist'].map(type => (
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
                            {entities.map(e => <option key={e.id} value={e.id}>{e.name} — {e.city}</option>)}
                        </select>
                        {errors.entityId && <p className="form-error">⚠ {errors.entityId.message}</p>}
                    </div>

                    {/* <div>
                        <label className="form-label">Visit Category *</label>
                        <select id="visit-type" {...register('visitType')} className={errors.visitType ? 'form-input-error form-select' : 'form-select'}>
                            <option value="">Select visit type</option>
                            {VISIT_TYPES.map(v => <option key={v.id} value={v.label}>{v.label}</option>)}
                        </select>
                        {errors.visitType && <p className="form-error">⚠ {errors.visitType.message}</p>}
                    </div> */}

                    <div>
                        <label className="form-label">
                            <MapPin className="w-3.5 h-3.5 inline mr-1 text-primary-500" />
                            Location (auto-detected)
                        </label>
                        <input id="visit-location" type="text" {...register('location')} className={errors.location ? 'form-input-error' : 'form-input'} />
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
                                    // Remove all case
                                    setPhotoFile([]);
                                } else {
                                    // Add new files
                                    setPhotoFile(prev => [
                                        ...prev,
                                        ...files
                                    ]);
                                }

                                setPhotoError(err || '');
                            }}
                        />
                    </div>

                    <button id="log-visit-submit" type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
                        {isSubmitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</> : 'Submit Visit'}
                    </button>
                </form>
            </div>
        </div>
    );
}
