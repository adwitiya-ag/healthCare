import { useState, useEffect } from 'react';
import { ZoomIn, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { visitsApi } from '../../api/visitsApi';

const COLUMNS = [
    { key: 'date', label: 'Date' },
    { key: 'mrName', label: 'MR Name' },
    { key: 'entityName', label: 'Entity' },
    { key: 'entityType', label: 'Type', render: (v) => <span className={`badge ${v === 'doctor' ? 'badge-info' : 'badge-warning'}`}>{v}</span> },
    { key: 'visitType', label: 'Visit Type' },
    { key: 'photo', label: 'Photo Proof', sortable: false, render: (_, row) => <VisitProofCell row={row} /> },
];

// Builds a Google Maps link from stored lat/lng
function mapsLink(lat, lng) {
    if (lat == null || lng == null) return null;
    return `https://www.google.com/maps?q=${lat},${lng}`;
}

function VisitProofCell({ row }) {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    // Support either a single `photo` field or a `photos` array — normalize to an array
    const images = row.photos?.length ? row.photos : row.photo ? [row.photo] : [];

    const goPrev = (e) => {
        e.stopPropagation();
        setIndex((i) => (i - 1 + images.length) % images.length);
    };
    const goNext = (e) => {
        e.stopPropagation();
        setIndex((i) => (i + 1) % images.length);
    };

    const link = mapsLink(row.latitude, row.longitude);

    return (
        <>
            <button
                id={`view-photo-${row.id}`}
                onClick={() => { setIndex(0); setOpen(true); }}
                className="relative group"
            >
                <img
                    src={images[0]}
                    alt="Visit proof"
                    className="w-12 h-10 object-cover rounded-lg border border-surface-border group-hover:opacity-80 transition-opacity"
                />
                {images.length > 1 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] leading-none rounded-full px-1.5 py-0.5">
                        {images.length}
                    </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg">
                    <ZoomIn className="w-4 h-4 text-white" />
                </div>
            </button>

            <Modal
                isOpen={open}
                onClose={() => setOpen(false)}
                title={`Visit Proof — ${row.entityName}`}
                size="lg"
                id={`photo-modal-${row.id}`}
            >
                <div className="space-y-4">
                    {/* Slideshow */}
                    <div className="relative">
                        <img
                            src={images[index]}
                            alt={`Visit proof ${index + 1} of ${images.length}`}
                            className="w-full rounded-xl object-contain max-h-96 bg-black/5"
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={goPrev}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                                    aria-label="Previous photo"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={goNext}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                                    aria-label="Next photo"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {images.map((_, i) => (
                                        <span
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {images.map((src, i) => (
                                <button
                                    key={i}
                                    onClick={() => setIndex(i)}
                                    className={`shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === index ? 'border-primary-500' : 'border-transparent'
                                        }`}
                                >
                                    <img src={src} alt={`Thumbnail ${i + 1}`} className="w-14 h-11 object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-slate-400 text-xs mb-0.5">MR</p>
                            <p className="font-medium">{row.mrName}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs mb-0.5">Entity</p>
                            <p className="font-medium">{row.entityName}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs mb-0.5">Visit Type</p>
                            <p className="font-medium">{row.visitType}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs mb-0.5">Date</p>
                            <p className="font-medium">{row.date}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-slate-400 text-xs mb-0.5">Location</p>
                            {link ? (
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-medium text-primary-500 hover:underline"
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                    {row.address || `${row.latitude}, ${row.longitude}`}
                                </a>
                            ) : (
                                <p className="font-medium text-slate-400">Not available</p>
                            )}
                        </div>
                        <div className="col-span-2">
                            <p className="text-slate-400 text-xs mb-0.5">Notes</p>
                            <p className="font-medium">{row.notes || '—'}</p>
                        </div>
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

    const getAddress = async (lat, lng) => {
        if (!lat || !lng) return "Not available";

        const data = await visitsApi.getAddress({ lat, lng });
        return data;
    };


    const fetchVisits = async () => {
        const data = await visitsApi.getAll();

        const formattedVisits = await Promise.all(
            data.map(async (visit) => {

                const address = await getAddress(
                    visit.Location?.latitude,
                    visit.Location?.longitude
                );

                return {
                    id: visit._id,

                    date: new Date(
                        visit.createdAt
                    ).toLocaleDateString(),

                    mrName: `${visit.MRId?.firstName || ""} ${visit.MRId?.lastName || ""}`,

                    entityName:
                        visit.DoctorId?.doctorName ||
                        visit.ChemistId?.chemistName ||
                        "N/A",

                    entityType:
                        visit.DoctorId
                            ? "doctor"
                            : visit.ChemistId
                                ? "chemist"
                                : "unknown",

                    visitType: "Visit",

                    photos: visit.Photos?.map(photo => photo.url) || [],

                    latitude: visit.Location?.latitude,

                    longitude: visit.Location?.longitude,

                    address: address.address,

                    notes: visit.Notes || "—"
                };
            })
        );

        setVisits(formattedVisits);
        setLoading(false);
    };

    fetchVisits();

}, []);

    return (
        <div className="animate-fade-in">
            <PageHeader title="Visit Review" subtitle={`${visits.length} visits logged`} />
            <DataTable columns={COLUMNS} data={visits} loading={loading} emptyMessage="No visits recorded yet" />
        </div>
    );
}