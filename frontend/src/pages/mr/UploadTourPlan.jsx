import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import FileUpload from '../../components/FileUpload';
import { tourPlansApi } from '../../api/visitsApi';
import { useAuth } from '../../context/AuthContext';

export default function UploadTourPlan() {
  const { user } = useAuth();
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState('');
  const [month, setMonth] = useState('');
  const [monthError, setMonthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) { setPdfError('Please select a PDF file'); return; }
    if (!month) { setMonthError('Please select the month'); return; }
    setLoading(true);
    await tourPlansApi.upload({ mrId: user.id, mrName: user.name, month, filename: pdfFile.name, fileSize: `${(pdfFile.size / 1024).toFixed(0)} KB` });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setPdfFile(null); setMonth(''); }, 3000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <CheckCircle className="w-20 h-20 text-success mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Tour Plan Uploaded!</h2>
        <p className="text-slate-500">Your plan has been submitted for review.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <PageHeader title="Upload Tour Plan" subtitle="Submit your monthly field tour plan PDF" />

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5" id="tour-plan-form">
          <div>
            <label className="form-label">Plan Month *</label>
            <input
              id="tour-plan-month"
              type="month"
              value={month}
              onChange={e => { setMonth(e.target.value); setMonthError(''); }}
              className={monthError ? 'form-input-error' : 'form-input'}
            />
            {monthError && <p className="form-error">⚠ {monthError}</p>}
          </div>

          <div>
            <label className="form-label">Tour Plan PDF *</label>
            <FileUpload
              id="tour-plan-pdf"
              accept="pdf"
              label="Upload Tour Plan PDF"
              value={pdfFile}
              error={pdfError}
              onFileSelect={(file, err) => { setPdfFile(file); setPdfError(err || ''); }}
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            📄 Only PDF files are accepted. Maximum size: 5 MB. Ensure the plan covers your full tour schedule for the selected month.
          </div>

          <button id="tour-plan-submit" type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</> : 'Upload Tour Plan'}
          </button>
        </form>
      </div>
    </div>
  );
}
