import React from 'react';
import { UserPlus, CloudUpload } from 'lucide-react';

interface Props {
  activeTab: 'single' | 'bulk';
  onTabChange: (tab: 'single' | 'bulk') => void;
}

export const CreateLeadTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-4">
      <button 
        onClick={() => onTabChange('single')}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[15px] font-medium transition-colors shadow-sm ${
          activeTab === 'single' 
            ? 'bg-[#1C3A76] text-white' 
            : 'bg-[#2B5299] text-white/90 hover:bg-[#1C3A76]'
        }`}
      >
        <UserPlus className="w-5 h-5" />
        Single Lead
      </button>

      <button 
        onClick={() => onTabChange('bulk')}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[15px] font-medium transition-colors shadow-sm ${
          activeTab === 'bulk' 
            ? 'bg-[#1C3A76] text-white' 
            : 'bg-[#2B5299] text-white/90 hover:bg-[#1C3A76]'
        }`}
      >
        <CloudUpload className="w-5 h-5" />
        Bulk Upload
      </button>
    </div>
  );
};
