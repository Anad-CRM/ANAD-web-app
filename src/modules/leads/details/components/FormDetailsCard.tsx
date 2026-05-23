import React from 'react';
import { Copy } from 'lucide-react';
import { Text } from '@/core/components/ui/Text';
import { useFeedback } from '@/core/contexts/FeedbackContext';

interface Props {
  formData?: Record<string, unknown>;
}

export const FormDetailsCard: React.FC<Props> = ({ formData }) => {
  const { showToast } = useFeedback();

  if (!formData || Object.keys(formData).length === 0) return null;

  const skipFields = ['full_name', 'phone_number', 'mobileNumber', 'userName', 'email'];

  const filteredData = Object.entries(formData).filter(([key]) => {
    return !skipFields.some(field => key.toLowerCase().includes(field.toLowerCase()));
  });

  if (filteredData.length === 0) return null;

  const formatKey = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      + '?';
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  return (
    <div className="bg-[#F8F7F3] rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-black/5 flex flex-col relative h-fit">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">

        <Text weight="bold" className="text-slate-800" size="xl" >
          Form Details
        </Text>
      </div>

      <div className="flex flex-col gap-4 sm:gap-5">
        {filteredData.map(([key, value], index) => {
          const displayValue = Array.isArray(value) ? value[0] : value;
          const isLast = index === filteredData.length - 1;

          return (
            <div key={key} className="flex flex-col gap-1.5">
              <Text weight="semibold" className="text-slate-500 uppercase tracking-wider" style={{ fontSize: '11px' }}>
                {formatKey(key)}
              </Text>
              <div
                className="flex items-center justify-between group cursor-pointer"
                onClick={() => handleCopy(displayValue?.toString() || '')}
              >
                <Text weight="medium" className="text-slate-900 leading-relaxed break-words pr-3" style={{ fontSize: '14px' }}>
                  {displayValue?.toString() || 'N/A'}
                </Text>
                <Copy size={14} className="text-slate-300 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              {!isLast && <div className="h-px bg-slate-50 mt-1" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
