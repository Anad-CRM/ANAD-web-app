import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  subLabel?: string;
}

interface SearchableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = options.filter(opt => {
    const labelMatch = (opt.label || '').toLowerCase().includes(searchTerm.toLowerCase());
    const subLabelMatch = opt.subLabel ? opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    return labelMatch || subLabelMatch;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1 w-full" ref={dropdownRef}>
      {label && <label className="text-[13px] font-semibold text-[#0D1B3E] px-1 block">{label}</label>}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full h-[48px] flex items-center justify-between bg-white text-[#0D1B3E] rounded-[14px] px-4 text-[15px] text-left transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.99]'}`}
          style={{ boxShadow: error ? '0 0 0 2px #ef4444' : undefined }}
        >
          <span className={selectedOption ? 'text-[#0D1B3E]' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-[100] mt-1.5 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none text-[13px] text-gray-700 placeholder:text-gray-400 py-1"
                autoFocus
              />
            </div>

            <div className="max-h-[220px] overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-gray-200">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors hover:bg-gray-50 group border-b border-gray-50 last:border-none my-0.5 ${value === option.id ? 'bg-[#F0F4FF]' : ''}`}
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className={`font-medium ${value === option.id ? 'text-[#163172]' : 'text-gray-700'}`}>
                        {option.label}
                      </span>
                      {option.subLabel && (
                        <span className="text-[11px] text-gray-400 group-hover:text-gray-500">
                          {option.subLabel}
                        </span>
                      )}
                    </div>
                    {value === option.id && <Check className="w-4 h-4 text-[#163172]" />}
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-400 text-[12px]">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && <span className="text-xs px-1 text-red-500 mt-1 block">{error}</span>}
    </div>
  );
};
