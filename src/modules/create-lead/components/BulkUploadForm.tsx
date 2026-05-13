import React, { useState, useRef } from 'react';
import { CloudUpload, AlertCircle, CheckCircle, XCircle, FileText } from 'lucide-react';
import { createBulkLeads } from '../api/createLeadApi';
import { useFeedback } from '@/core/contexts/FeedbackContext';

export const BulkUploadForm: React.FC = () => {
  const { showToast } = useFeedback();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        setStatus({ type: 'error', message: 'Please select a valid CSV file' });
        return;
      }
      setFile(selected);
      setStatus({ type: null, message: '' });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await createBulkLeads(file, skipDuplicates);
      showToast("Leads uploaded successfully!", "success");
      setStatus({ type: 'success', message: response.data.message || 'Leads uploaded successfully!' });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'An error occurred during upload';
      setStatus({ type: 'error', message });
      showToast(message, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-[18px] font-semibold text-black mb-6 tracking-wide">File Upload</h2>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`bg-[#1C3A76] rounded-[24px] w-full h-[160px] flex flex-col items-center justify-center shadow-sm cursor-pointer hover:bg-[#11234D] transition-colors relative mb-6 group ${file ? 'border-2 border-green-400' : ''}`}
      >
         <div className="bg-[#11234D] w-[54px] h-[40px] rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            {file ? <FileText className="text-green-400 w-5 h-5" /> : <CloudUpload className="text-white w-5 h-5" />}
         </div>
         <p className="text-white text-[16px] font-light tracking-wide">
           {file ? file.name : "Upload CSV File"}
         </p>
         
         <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv" 
            className="hidden" 
         />
      </div>

      {file && (
        <div className="flex flex-col gap-4 mb-8">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div 
              onClick={() => setSkipDuplicates(!skipDuplicates)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${skipDuplicates ? 'bg-[#1C3A76] border-[#1C3A76]' : 'border-gray-300 group-hover:border-[#1C3A76]'}`}
            >
              {skipDuplicates && <CheckCircle className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-[14px] text-gray-700 font-medium">Skip duplicate check</span>
          </label>

          <div className="flex justify-center">
            <button 
               onClick={handleUpload}
               disabled={uploading}
               className="bg-[#1C3A76] text-white text-[14px] font-semibold px-12 py-3 rounded-xl hover:bg-[#11234D] disabled:opacity-70 transition-all shadow-md min-w-[200px] flex justify-center items-center h-[48px]"
            >
              {uploading ? (
                 <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                 "Upload & Create Leads"
              )}
            </button>
          </div>
        </div>
      )}

      {status.type && (
        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border ${
          status.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <p className="text-[14px] font-medium">{status.message}</p>
        </div>
      )}

      <div className="bg-[#D9E4F2] rounded-3xl p-6 flex flex-col shadow-sm">
         <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-black" strokeWidth={1.5} />
            <h3 className="text-[16px] font-semibold text-black tracking-wide">CSV Template Format</h3>
         </div>

         <div className="space-y-2 pl-1">
            <p className="text-[13px] text-[#333333] font-medium tracking-wide mb-1">Ensure Your CSV File Has These Columns In Order :</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <p className="text-[13px] text-[#333333] font-normal tracking-wide">Lead Name : <span className="text-[#4D4D4D]">eg. John Doe</span></p>
              <p className="text-[13px] text-[#333333] font-normal tracking-wide">Lead Email : <span className="text-[#4D4D4D]">eg. john.doe@gmail.com</span></p>
              <p className="text-[13px] text-[#333333] font-normal tracking-wide">Lead Mobile Number : <span className="text-[#4D4D4D]">1234567890</span></p>
              <p className="text-[13px] text-[#333333] font-normal tracking-wide">Lead Source: <span className="text-[#4D4D4D]">eg. Facebook</span></p>
              <p className="text-[13px] text-[#333333] font-normal tracking-wide">Lead Ad: <span className="text-[#4D4D4D]">eg. Summer Deal</span></p>
              <p className="text-[13px] text-[#333333] font-normal tracking-wide">Assigned To: <span className="text-[#4D4D4D]">eg. staff@mail.com</span></p>
              <p className="text-[13px] text-[#333333] font-normal tracking-wide">Date: <span className="text-[#4D4D4D]">DD/MM/YYYY</span></p>
            </div>
         </div>
      </div>
    </div>
  );
};

