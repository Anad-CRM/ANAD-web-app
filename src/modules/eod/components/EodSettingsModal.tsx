import React, { useState, useEffect } from "react";
import { 
  setEodMode, 
  getEodFields, 
  createEodField, 
  updateEodField, 
  deleteEodField 
} from "../api/eodApi";

interface EodSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: 'auto' | 'manual';
  onModeChange: (mode: 'auto' | 'manual') => void;
}

export const EodSettingsModal: React.FC<EodSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  currentMode, 
  onModeChange 
}) => {
  const [mode, setMode] = useState<'auto' | 'manual'>(currentMode);
  const [fields, setFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingMode, setIsSavingMode] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  
  // Form state for adding/editing fields
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [requiredRoles, setRequiredRoles] = useState<string[]>(["Staff Member", "Team Leader"]);

  useEffect(() => {
    if (isOpen) {
      setMode(currentMode);
      fetchFields();
    }
  }, [isOpen, currentMode]);

  const fetchFields = async () => {
    setIsLoading(true);
    const data = await getEodFields();
    setFields(data);
    setIsLoading(false);
  };

  const handleToggleMode = async (newMode: 'auto' | 'manual') => {
    if (newMode === mode || isSavingMode) return;
    setIsSavingMode(true);
    const success = await setEodMode(newMode);
    if (success) {
      setMode(newMode);
      onModeChange(newMode);
    }
    setIsSavingMode(false);
  };

  const handleAddField = async () => {
    if (!fieldLabel) return;
    setIsLoading(true);
    const success = await createEodField({
      label: fieldLabel,
      fieldType: fieldType,
      requiredForRoles: requiredRoles
    });
    if (success) {
      resetFieldForm();
      fetchFields();
    } else {
      setIsLoading(false);
    }
  };

  const handleUpdateField = async () => {
    if (!editingField || !fieldLabel) return;
    setIsLoading(true);
    const success = await updateEodField(editingField.id, {
      label: fieldLabel,
      fieldType: fieldType,
      requiredForRoles: requiredRoles
    });
    if (success) {
      resetFieldForm();
      fetchFields();
    } else {
      setIsLoading(false);
    }
  };

  const handleDeleteField = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this custom field?")) return;
    setIsLoading(true);
    const success = await deleteEodField(id);
    if (success) {
      fetchFields();
    } else {
      setIsLoading(false);
    }
  };

  const resetFieldForm = () => {
    setFieldLabel("");
    setFieldType("text");
    setRequiredRoles(["Staff Member", "Team Leader"]);
    setShowAddField(false);
    setEditingField(null);
  };

  const startEdit = (field: any) => {
    setEditingField(field);
    setFieldLabel(field.label);
    setFieldType(field.fieldType);
    setRequiredRoles(Array.isArray(field.requiredForRoles) ? field.requiredForRoles : []);
    setShowAddField(true);
  };

  const toggleRole = (role: string) => {
    setRequiredRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">EOD Settings</h2>
            <p className="text-sm text-gray-500 mt-0.5">Configure how daily reporting works</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-8 py-6 space-y-8">
          {/* EOD Mode Section */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">EOD Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => handleToggleMode('manual')}
                className={`p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                  mode === 'manual' 
                    ? 'border-[#233A78] bg-[#233A78]/5 ring-4 ring-[#233A78]/5' 
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${mode === 'manual' ? 'bg-[#233A78] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${mode === 'manual' ? 'text-[#233A78]' : 'text-gray-900'}`}>Manual</span>
                    {mode === 'manual' && (
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#233A78]"><path d="M20 6L9 17l-5-5"/></svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Staff submit EOD reports manually with custom data.</p>
                </div>
              </button>

              <button 
                onClick={() => handleToggleMode('auto')}
                className={`p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                  mode === 'auto' 
                    ? 'border-[#233A78] bg-[#233A78]/5 ring-4 ring-[#233A78]/5' 
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${mode === 'auto' ? 'bg-[#233A78] text-white' : 'bg-gray-100 text-gray-500'}`}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                </div>
                <div className="flex-1">
                 <div className="flex items-center justify-between">
                    <span className={`font-bold ${mode === 'auto' ? 'text-[#233A78]' : 'text-gray-900'}`}>Automatic</span>
                    {mode === 'auto' && (
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#233A78]"><path d="M20 6L9 17l-5-5"/></svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Reports are generated daily from system activity.</p>
                </div>
              </button>
            </div>
          </section>

          {/* Custom Fields Section */}
          <section className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Custom EOD Fields</h3>
              {mode === 'manual' && !showAddField && (
                <button 
                  onClick={() => { resetFieldForm(); setShowAddField(true); }}
                  className="text-xs font-bold text-[#233A78] px-3 py-1.5 bg-[#233A78]/5 rounded-lg hover:bg-[#233A78]/10 transition-colors flex items-center gap-1.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                  Add Field
                </button>
              )}
            </div>

            {mode === 'auto' ? (
              <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl flex gap-4 items-start">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-800">Fields Hidden in Auto Mode</p>
                  <p className="text-xs text-orange-700/80 mt-0.5">Switch to Manual mode to define custom questions for your staff.</p>
                </div>
              </div>
            ) : showAddField ? (
              <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl space-y-4 animate-in zoom-in-95 duration-200">
                <h4 className="text-sm font-bold text-gray-900">{editingField ? 'Edit Field' : 'New Custom Field'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 ml-1">Field Label</label>
                    <input 
                      type="text" 
                      value={fieldLabel}
                      onChange={(e) => setFieldLabel(e.target.value)}
                      placeholder="e.g. Sales Achieved"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#233A78]/20 focus:border-[#233A78] outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 ml-1">Field Type</label>
                    <select 
                      value={fieldType}
                      onChange={(e) => setFieldType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#233A78]/20 focus:border-[#233A78] outline-none transition-all text-sm appearance-none"
                    >
                      <option value="text">Text Input</option>
                      <option value="number">Numeric Value</option>
                      <option value="boolean">Yes / No Toggle</option>
                      <option value="date">Date Picker</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">Required for Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {["Staff Member", "Team Leader", "Manager"].map(role => (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          requiredRoles.includes(role)
                            ? 'bg-[#233A78] text-white border-[#233A78]'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    onClick={editingField ? handleUpdateField : handleAddField}
                    disabled={isLoading || !fieldLabel}
                    className="flex-1 bg-[#233A78] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#3561A5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : editingField ? 'Update Field' : 'Create Field'}
                  </button>
                  <button 
                    onClick={resetFieldForm}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : fields.length === 0 ? (
              <div className="p-10 border-2 border-dashed border-gray-100 rounded-2xl text-center space-y-2">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <p className="text-sm font-semibold text-gray-400">No custom fields defined</p>
                <p className="text-xs text-gray-300">Staff will only provide notes and work stats.</p>
              </div>
            ) : (
              <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                {fields.map((field) => (
                  <div key={field.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#233A78]/5 text-[#233A78] rounded-lg">
                        {field.fieldType === 'number' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 22V2M19 22V2M2 7h20M2 17h20"/></svg>}
                        {field.fieldType === 'boolean' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 12l2 2 4-4"/></svg>}
                        {field.fieldType === 'text' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>}
                        {field.fieldType === 'date' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{field.label}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                          {field.fieldType} • Required: {Array.isArray(field.requiredForRoles) ? field.requiredForRoles.join(', ') : 'None'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => startEdit(field)}
                        className="p-2 text-gray-400 hover:text-[#233A78] hover:bg-[#233A78]/5 rounded-lg transition-all"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteField(field.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-[#233A78] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#233A78]/20 hover:bg-[#3561A5] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
