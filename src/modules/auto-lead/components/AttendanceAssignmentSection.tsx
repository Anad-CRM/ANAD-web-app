import React from 'react';
import { CalendarCheck, Zap, Users, Star, TrendingUp } from 'lucide-react';
import { Text } from '@/core/components/ui/Text';

interface Props {
  attendanceRequired: boolean;
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

export const AttendanceAssignmentSection: React.FC<Props> = ({ attendanceRequired }) => {
  return (
    <div className="space-y-4">
      {/* Header info card */}
      <div className="rounded-2xl border border-[#1C3A76]/15 bg-gradient-to-br from-[#1C3A76]/5 to-[#2B5299]/5 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1C3A76]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CalendarCheck className="w-5 h-5 text-[#1C3A76]" />
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
  );
};
