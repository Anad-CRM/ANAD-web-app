import React, { useState, useEffect } from 'react';
import { CalendarCheck, Zap, Users, Star, TrendingUp, UserCheck, Check, Sparkles } from 'lucide-react';
import { Text } from '@/core/components/ui/Text';
import { RoutingStrategy, setRoutingStrategy, toggleManagerAutoAssign } from '../api/autoLeadApi';
import { AutoLeadCampaign } from '../types';

interface Props {
  currentStrategy?: RoutingStrategy;
  attendanceRequired: boolean;
  onStrategyChange?: (strategy: RoutingStrategy) => void;
  campaigns?: AutoLeadCampaign[];
}

const skillLevels = [
  {
    label: 'Expert',
    weight: 3,
    color: '#1C3A76',
    bg: '#EFF3FB',
    icon: Star,
    description: 'Receives 3x leads per cycle',
  },
  {
    label: 'Intermediate',
    weight: 2,
    color: '#2B7A4E',
    bg: '#EDFBF3',
    icon: TrendingUp,
    description: 'Receives 2x leads per cycle',
  },
  {
    label: 'Beginner',
    weight: 1,
    color: '#92400E',
    bg: '#FFFBEB',
    icon: Users,
    description: 'Receives 1x lead per cycle',
  },
];

interface StrategyOption {
  id: RoutingStrategy;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  description: string;
  accentColor: string;
  activeBg: string;
  activeBorder: string;
  radioColor: string;
}

const strategyOptions: StrategyOption[] = [
  {
    id: 'attendance',
    title: 'Attendance-Based',
    subtitle: 'Direct Individual Distribution',
    badge: 'Skill Weighted',
    icon: '🧠',
    description: 'Leads are distributed directly to active present staff based on their skill level (Expert: 3x, Intermediate: 2x, Beginner: 1x). No team setup required.',
    accentColor: '#2563EB',
    activeBg: 'bg-blue-50/70',
    activeBorder: 'border-blue-500 ring-2 ring-blue-500/20',
    radioColor: 'bg-blue-600 border-blue-600',
  },
  {
    id: 'team',
    title: 'Team-Based',
    subtitle: 'Team Hierarchy & Strength',
    badge: 'Team Leaders',
    icon: '👥',
    description: 'Leads are routed to team leaders or members. Supports team strength weighting proportional to team size and active attendance.',
    accentColor: '#1C3A76',
    activeBg: 'bg-[#1C3A76]/5',
    activeBorder: 'border-[#1C3A76] ring-2 ring-[#1C3A76]/20',
    radioColor: 'bg-[#1C3A76] border-[#1C3A76]',
  },
  {
    id: 'manager',
    title: 'Manager-Based',
    subtitle: 'Direct Manager Routing',
    badge: 'Manager Assigned',
    icon: '👤',
    description: 'Leads are routed directly to designated department or campaign managers linked to specific ad campaigns.',
    accentColor: '#9333EA',
    activeBg: 'bg-purple-50/70',
    activeBorder: 'border-purple-500 ring-2 ring-purple-500/20',
    radioColor: 'bg-purple-600 border-purple-600',
  },
];

export const AttendanceAssignmentSection: React.FC<Props> = ({
  currentStrategy = 'attendance',
  attendanceRequired,
  onStrategyChange,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<RoutingStrategy>(currentStrategy);
  const [savedStrategy, setSavedStrategy] = useState<RoutingStrategy>(currentStrategy);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setSelectedStrategy(currentStrategy);
    setSavedStrategy(currentStrategy);
  }, [currentStrategy]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const hasUnsavedChanges = selectedStrategy !== savedStrategy;

  const handleSelectOption = (strategy: RoutingStrategy) => {
    setSelectedStrategy(strategy);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setRoutingStrategy(selectedStrategy);
      // Keep legacy toggle in sync for backward compatibility
      await toggleManagerAutoAssign(selectedStrategy === 'manager').catch(() => {});
      setSavedStrategy(selectedStrategy);
      onStrategyChange?.(selectedStrategy);
      showToast(
        `Successfully saved routing strategy: ${
          strategyOptions.find((s) => s.id === selectedStrategy)?.title || selectedStrategy
        }`,
        'success'
      );
    } catch {
      showToast('Failed to save routing strategy. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Selection Area Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <Text weight="bold" className="text-gray-800 block" style={{ fontSize: '14.5px' }}>
              Choose Lead Routing Strategy
            </Text>
          </div>
          <Text className="text-gray-400 block mt-0.5" style={{ fontSize: '12px' }}>
            Select 1 of the 3 distribution methods, then click Save to apply
          </Text>
        </div>

        {hasUnsavedChanges && (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/60 px-3 py-1 rounded-full text-[11px] font-bold self-start sm:self-auto animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Unsaved Strategy Selection
          </span>
        )}
      </div>

      {/* ── 3 Options (Single Select Radio Cards) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {strategyOptions.map((option) => {
          const isSelected = selectedStrategy === option.id;
          const isSavedActive = savedStrategy === option.id;

          return (
            <div
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              className={`relative rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between select-none ${
                isSelected
                  ? `${option.activeBg} ${option.activeBorder} shadow-md`
                  : 'bg-white border-gray-200/80 hover:border-gray-300 hover:shadow-sm bg-gray-50/30'
              }`}
            >
              <div>
                {/* Top Row: Icon + Badges + Radio Button */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{option.icon}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isSelected
                          ? 'bg-white/80 text-gray-800 border-gray-200 shadow-xs'
                          : 'bg-gray-100 text-gray-500 border-gray-200/60'
                      }`}
                    >
                      {option.badge}
                    </span>
                  </div>

                  {/* Radio Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? `${option.radioColor} text-white shadow-xs`
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <Text weight="bold" className="text-gray-800 block" style={{ fontSize: '14.5px' }}>
                  {option.title}
                </Text>
                <Text className="text-gray-400 block font-medium mt-0.5" style={{ fontSize: '11.5px' }}>
                  {option.subtitle}
                </Text>

                {/* Description */}
                <Text
                  className="text-gray-500 block mt-2.5"
                  style={{ fontSize: '12px', lineHeight: '1.55' }}
                >
                  {option.description}
                </Text>
              </div>

              {/* Card Footer Status */}
              <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center justify-between text-[11px]">
                {isSavedActive ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Currently Active
                  </span>
                ) : isSelected ? (
                  <span className="inline-flex items-center gap-1 font-bold text-blue-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Selected (Pending Save)
                  </span>
                ) : (
                  <span className="text-gray-400">Click to select</span>
                )}

                <span
                  className={`text-[10.5px] font-bold ${
                    isSelected ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Save Strategy Action Bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              hasUnsavedChanges
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {hasUnsavedChanges ? (
              <span className="text-sm">⚠️</span>
            ) : (
              <Check className="w-4 h-4" />
            )}
          </div>
          <div>
            <Text weight="bold" className="text-gray-800 block" style={{ fontSize: '13px' }}>
              {hasUnsavedChanges
                ? `Strategy changed to "${strategyOptions.find((s) => s.id === selectedStrategy)?.title}"`
                : `Active Strategy: ${strategyOptions.find((s) => s.id === savedStrategy)?.title}`}
            </Text>
            <Text className="text-gray-400 block mt-0.5" style={{ fontSize: '11.5px' }}>
              {hasUnsavedChanges
                ? 'Click "Save Routing Strategy" below to apply this change to all incoming leads'
                : 'All incoming leads follow this distribution strategy'}
            </Text>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !hasUnsavedChanges}
          className={`py-2.5 px-6 rounded-xl text-[13px] font-bold transition-all duration-300 flex items-center justify-center gap-2 shrink-0 ${
            isSaving
              ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
              : hasUnsavedChanges
                ? 'bg-[#1C3A76] hover:bg-[#2B5299] text-white shadow-lg shadow-[#1C3A76]/15 hover:shadow-xl hover:shadow-[#1C3A76]/25 cursor-pointer transform active:scale-[0.98]'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 cursor-default opacity-80'
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span>Saving Strategy...</span>
            </>
          ) : hasUnsavedChanges ? (
            <>
              <Check className="w-4 h-4" />
              <span>Save Routing Strategy</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Strategy Saved</span>
            </>
          )}
        </button>
      </div>

      {/* ── Dynamic Strategy Details Panel ── */}
      {selectedStrategy === 'attendance' && (
        <div className="space-y-4 pt-2">
          {/* Header info card */}
          <div className="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-white p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <Text weight="bold" className="text-gray-800 block" style={{ fontSize: '14px' }}>
                  How Attendance-Based Routing Works
                </Text>
                <Text className="text-gray-500 block mt-1.5" style={{ fontSize: '12.5px', lineHeight: '1.6' }}>
                  Leads are distributed directly to individual staff members based on their{' '}
                  <strong className="text-gray-700">daily attendance</strong> and{' '}
                  <strong className="text-gray-700">skill level</strong>. No team or manager
                  configuration is required — just mark attendance and leads flow automatically.
                </Text>
              </div>
            </div>

            {/* Attendance status indicator */}
            <div
              className={`mt-4 flex items-center gap-2.5 rounded-xl px-4 py-3 border ${
                attendanceRequired
                  ? 'bg-green-50 border-green-200/60 text-green-700'
                  : 'bg-amber-50 border-amber-200/60 text-amber-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 flex-shrink-0" />
              <Text className="block" weight="semibold" style={{ fontSize: '12px' }}>
                {attendanceRequired
                  ? 'Attendance check is ON — only staff who have checked in today will receive leads'
                  : 'Attendance check is OFF — all verified staff are eligible to receive leads'}
              </Text>
            </div>
          </div>

          {/* Skill-weight breakdown */}
          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3.5 border-b border-gray-50">
              <Text weight="bold" className="text-gray-700 block" style={{ fontSize: '13.5px' }}>
                Lead Distribution Weights by Skill Level
              </Text>
              <Text className="text-gray-400 block mt-0.5" style={{ fontSize: '11.5px' }}>
                Within each rotation cycle, leads are distributed proportionally
              </Text>
            </div>

            <div className="divide-y divide-gray-50">
              {skillLevels.map((skill) => {
                const Icon = skill.icon;
                const barWidth = (skill.weight / 3) * 100;
                return (
                  <div key={skill.label} className="flex items-center gap-4 px-4 py-3.5">
                    {/* Icon + label */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: skill.bg }}
                    >
                      <Icon className="w-4 h-4" style={{ color: skill.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <Text weight="semibold" className="text-gray-700" style={{ fontSize: '13px' }}>
                          {skill.label}
                        </Text>
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                          style={{ background: skill.bg, color: skill.color }}
                        >
                          ×{skill.weight}
                        </span>
                      </div>
                      {/* Weight bar */}
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%`, background: skill.color, opacity: 0.7 }}
                        />
                      </div>
                      <Text className="text-gray-400 block mt-1" style={{ fontSize: '11px' }}>
                        {skill.description}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cycle explanation */}
            <div className="px-4 py-3.5 bg-gray-50/60 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-[#1C3A76]" style={{ opacity: 0.3 + i * 0.3 }} />
                  ))}
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-[#2B7A4E]" style={{ opacity: 0.4 + i * 0.3 }} />
                  ))}
                  <div className="w-2 h-2 rounded-full bg-[#92400E] opacity-40" />
                </div>
                <Text className="text-gray-500 block" style={{ fontSize: '11px' }}>
                  Example cycle: Expert · Expert · Expert · Intermediate · Intermediate · Beginner → repeats
                </Text>
              </div>
            </div>
          </div>

          {/* No config required note */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-50/60 border border-blue-100/80">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
            <Text className="text-blue-600 block" style={{ fontSize: '12px' }}>
              No team or manager setup needed. Staff just need to be assigned a skill level in their profile.
            </Text>
          </div>
        </div>
      )}

      {selectedStrategy === 'team' && (
        <div className="p-5 rounded-2xl border border-dashed border-[#1C3A76]/30 bg-[#1C3A76]/5 text-center space-y-2">
          <span className="text-3xl">👥</span>
          <Text weight="bold" className="text-[#1C3A76] block" style={{ fontSize: '14px' }}>
            Team-Based Routing Selected
          </Text>
          <Text className="text-gray-500 block max-w-md mx-auto" style={{ fontSize: '12px', lineHeight: '1.55' }}>
            When saved, incoming leads will be distributed among your teams and team leaders. You can customize which campaigns belong to each team in the Team-Based tab.
          </Text>
        </div>
      )}

      {selectedStrategy === 'manager' && (
        <div className="p-5 rounded-2xl border border-dashed border-purple-300 bg-purple-50/50 text-center space-y-2">
          <span className="text-3xl">👤</span>
          <Text weight="bold" className="text-purple-800 block" style={{ fontSize: '14px' }}>
            Manager-Based Routing Selected
          </Text>
          <Text className="text-gray-500 block max-w-md mx-auto" style={{ fontSize: '12px', lineHeight: '1.55' }}>
            When saved, incoming leads will be distributed directly to designated managers. You can customize manager ad assignments in the Manager-Based tab.
          </Text>
        </div>
      )}
    </div>
  );
};
