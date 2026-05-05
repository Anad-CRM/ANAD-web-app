import React from 'react';
import { Users, UserCheck } from 'lucide-react';

interface Props {
  isManagerMode: boolean;
  onSwitch: (isManager: boolean) => void;
}

export const RoutingStrategySelector: React.FC<Props> = ({ isManagerMode, onSwitch }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-50">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          isManagerMode ? 'bg-purple-100' : 'bg-[#1C3A76]/10'
        }`}>
          {isManagerMode
            ? <UserCheck className="w-5 h-5 text-purple-600" />
            : <Users className="w-5 h-5 text-[#1C3A76]" />
          }
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold text-gray-800">Routing Strategy</p>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {isManagerMode ? 'Manager-based distribution' : 'Team-based distribution'}
          </p>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
          isManagerMode ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-700'
        }`}>
          Active
        </span>
      </div>

      {/* Toggle */}
      <div className="p-4">
        <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <button
            onClick={() => onSwitch(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[14px] font-semibold transition-all ${
              !isManagerMode
                ? 'bg-[#1C3A76] text-white shadow-md'
                : 'bg-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Team-Based
          </button>
          <div className="w-px bg-gray-200" />
          <button
            onClick={() => onSwitch(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[14px] font-semibold transition-all ${
              isManagerMode
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Manager-Based
          </button>
        </div>
      </div>
    </div>
  );
};
