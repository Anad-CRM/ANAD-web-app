import React from 'react';
import { CloudUpload, AlertCircle } from 'lucide-react';

export const BulkUploadForm: React.FC = () => {
  return (
    <div className="flex flex-col">
      <h2 className="text-[18px] font-semibold text-black mb-6 tracking-wide">File Upload</h2>
      
      <div className="bg-[#1C3A76] rounded-[24px] w-full h-[160px] flex flex-col items-center justify-center shadow-sm cursor-pointer hover:bg-[#11234D] transition-colors relative mb-8 group">
         <div className="bg-[#11234D] w-[54px] h-[40px] rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <CloudUpload className="text-white w-5 h-5" />
         </div>
         <p className="text-white text-[16px] font-light tracking-wide">Upload CSV File</p>
         
         <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>

      <div className="bg-[#D9E4F2] rounded-3xl p-6 flex flex-col shadow-sm">
         <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-black" strokeWidth={1.5} />
            <h3 className="text-[16px] font-semibold text-black tracking-wide">CSV Template Format</h3>
         </div>

         <div className="space-y-2 pl-1">
            <p className="text-[13px] text-[#333333] font-medium tracking-wide mb-1">Ensure Your CSV File Has These Columns In Order :</p>
            <p className="text-[13px] text-[#333333] font-normal tracking-wide">Lead Name : <span className="text-[#4D4D4D]">eg. John Doe</span></p>
            <p className="text-[13px] text-[#333333] font-normal tracking-wide">Lead Email : <span className="text-[#4D4D4D]">eg. john.doe@gmail.com</span></p>
            <p className="text-[13px] text-[#333333] font-normal tracking-wide">Lead Mobile Number : <span className="text-[#4D4D4D]">1234567890</span></p>
            <p className="text-[13px] text-[#333333] font-normal tracking-wide">Lead Source: <span className="text-[#4D4D4D]">eg. Facebook</span></p>
         </div>
      </div>
    </div>
  );
};

