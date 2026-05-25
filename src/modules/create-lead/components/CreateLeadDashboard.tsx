import React, { useState } from 'react';
import { CreateLeadTabs } from './CreateLeadTabs';
import { SingleLeadForm } from './SingleLeadForm';
import { BulkUploadForm } from './BulkUploadForm';

export const CreateLeadDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  return (
    <div className="flex flex-col w-full h-full font-sans tracking-tight overflow-y-auto custom-scrollbar">
      <div className="w-full pt-4 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto overflow-x-auto custom-scrollbar pb-2">
         <CreateLeadTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="flex justify-center w-full flex-1 mt-3 px-4 pb-6">
        <div className="bg-white w-full max-w-[500px] rounded-3xl p-6 shadow-sm border border-black/5 h-fit">
           {activeTab === 'single' ? <SingleLeadForm /> : <BulkUploadForm />}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.1);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.2);
        }
      `}} />
    </div>
  );
};
