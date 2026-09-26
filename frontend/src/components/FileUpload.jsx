import { useRef, useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';

export default function FileUpload({
    accept,           // 'image' | 'pdf'
    label = 'Upload File',
    onFileSelect,
    value = [],
    error = '',
    id = 'file-upload',
    multiple = false
}) {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [preview, setPreview] = useState(null);

        const ACCEPT_MAP = {
        image: '.jpg,.jpeg,.png',
        pdf: '.pdf',
        excel: '.xlsx,.xls',
    };
    const acceptAttr = ACCEPT_MAP[accept] || accept;

    const EXCEL_MIME_TYPES = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
    ];

    const validate = (file) => {
        if (accept === 'image') {
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                return 'Only .jpg and .png files are allowed';
            }
        } else if (accept === 'pdf') {
            if (file.type !== 'application/pdf') {
                return 'Only PDF files are allowed';
            }
        } else if (accept === 'excel') {
            if (!EXCEL_MIME_TYPES.includes(file.type)) {
                return 'Only .xlsx or .xls files are allowed';
            }
        }
        return null;
    };

    const handleFile = (file) => {
        if (!file) return;
        const err = validate(file);
        if (err) { onFileSelect(null, err); return; }

        if (accept === 'image') {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
        onFileSelect([file], null);
    };

    const handleFiles = (files) => {

        const validFiles = [];

        for(const file of files){
            const err = validate(file);
            if(err){
                onFileSelect([], err);
                return;
            }
            validFiles.push(file);
        }
        onFileSelect(validFiles, null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);

        const files = Array.from(e.dataTransfer.files);

        if(multiple){
            handleFiles(files);
        }
        else{
            handleFile(files[0]);
        }
    };

    const handleClear = () => {
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
        onFileSelect([], null);
    };

    return (
        <div className="space-y-2">
            {/* Drop zone */}
            <div
                    id={id}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
            ${dragOver ? 'border-primary-400 bg-primary-50' : error ? 'border-danger bg-danger/5' : 'border-surface-border bg-slate-50 hover:border-primary-300 hover:bg-primary-50/50'}`}
                >
                    <div className="flex flex-col items-center gap-2">
                        {accept === 'image' ? <Image className="w-8 h-8 text-slate-400" /> : <FileText className="w-8 h-8 text-slate-400" />}
                        <div>
                            <p className="text-sm font-medium text-slate-700">{label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">Drag & drop or click to browse</p>
                            <p className="text-xs text-slate-400">
                                {accept === 'image' ? 'JPG, PNG only' : accept === 'excel' ? 'XLSX, XLS only' : 'PDF only'}
                            </p>
                        </div>
                    </div>
                </div>

            <input
                ref={inputRef}
                type="file"
                id={`${id}-input`}
                accept={acceptAttr}
                multiple={multiple}
                className="hidden"
                onChange={e => {

                    const files = Array.from(e.target.files);

                    if(multiple){
                        handleFiles(files);
                    }
                    else{
                        handleFile(files[0]);
                    }

                }}
            />

            {/* Preview */}
            
            
                {value.length > 0 && (
                <div className="space-y-3">

                    {value.map((file, index) => (
                        <div 
                            key={index}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${
                                error 
                                ? 'border-danger bg-danger/5' 
                                : 'border-surface-border bg-slate-50'
                            }`}
                        >

                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                <Image className="w-6 h-6 text-slate-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        </div>
                    ))}


            <button
            type="button"
            onClick={handleClear}
            className="text-sm text-danger"
            >
            Remove all
            </button>

            </div>
            )}


            {error && <p className="form-error">⚠ {error}</p>}
        </div>
    );
}
