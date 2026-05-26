import React, { useState } from 'react';
import { Pencil, History } from 'lucide-react';
import { COLORS } from '@/core/components/theme/colors';
import { Text } from '@/core/components/ui/Text';
import { Activity } from '../types/activity.types';
import { ActivityTimeline } from './ActivityTimeline';
import { ActivityDetailModal } from './ActivityModals/ActivityDetailModal';
import { AddActivityModal } from './ActivityModals/AddActivityModal';
import { CreateActivityModal } from './ActivityModals/CreateActivityModal';

interface Props {
  activities: Activity[];
  leadId: string;
  onRefresh?: () => void;
}

export const LeadActivityLog: React.FC<Props> = ({ activities, leadId, onRefresh }) => {
  const [selected, setSelected] = useState<Activity | null>(null);
  const [showAddSheet, setAddSheet] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState<string | null>(null);

  return (
    <div className="bg-[#F8F7F3] rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-black/5 flex flex-col relative h-[360px] sm:h-[420px] lg:h-[500px] overflow-hidden">
      <div className="flex justify-between items-center mb-4 sm:mb-6 flex-shrink-0">
        <Text size="xl" weight="semibold" className="text-black">Activity Log</Text>
        <button
          id="add-activity-btn"
          onClick={() => setAddSheet(true)}
          className="absolute top-4 sm:top-5 right-4 sm:right-6 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 hover:opacity-90 z-20"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-scroll pr-1 sm:pr-2 pb-14 sm:pb-16 custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarGutter: 'stable' }}>
        {activities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10 h-full">
            <History size={52} strokeWidth={1.3} className="text-slate-300" />
            <div className="text-center">
              <Text weight="semibold" className="text-slate-500" style={{ fontSize: '15px' }}>No Activities Yet</Text>
              <Text className="text-slate-400 mt-1 max-w-[200px] mx-auto" style={{ fontSize: '13px' }}>
                Start tracking your interactions with this lead
              </Text>
            </div>
          </div>
        ) : (
          <ActivityTimeline activities={activities} onSelect={setSelected} />
        )}
      </div>

      {selected && <ActivityDetailModal activity={selected} onClose={() => setSelected(null)} />}

      {showAddSheet && (
        <AddActivityModal
          onClose={() => setAddSheet(false)}
          onSelectType={setSelectedActivityType}
        />
      )}

      {selectedActivityType && (
        <CreateActivityModal
          leadId={leadId}
          activityType={selectedActivityType}
          onClose={() => setSelectedActivityType(null)}
          onSuccess={() => {
            setSelectedActivityType(null);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
};
