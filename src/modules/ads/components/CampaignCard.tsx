import React from "react";
import Image from "next/image";
import { AdCampaign } from "../types";
import { Text } from "@/core/components/ui/Text";
import { MousePointerClick, Eye, Users, Percent, ArrowRight } from "lucide-react";
import { COLORS } from "@/core/components/theme/colors";

export const CampaignCard = ({ data }: { data?: AdCampaign }) => {
  const ctr = data?.totalImpressions ? ((data.totalClicks / data.totalImpressions) * 100).toFixed(2) : "0";

  return (
    <div 
      className="flex flex-col mb-8 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden group cursor-pointer"
      style={{ borderColor: COLORS.grey }}
    >
      
      {/* Header Area */}
      <div 
        className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 border-b"
        style={{ backgroundColor: COLORS.surface, borderBottomColor: COLORS.grey }}
      >
        <div className="relative">
            {data?.thumbnailUrl ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <Image 
                      src={data.thumbnailUrl} 
                      alt={data?.adName || "Ad"} 
                      width={64} 
                      height={64} 
                      className="w-full h-full object-cover" 
                      unoptimized
                    />
                </div>
            ) : (
                <div 
                  className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white shadow-md"
                  style={{ background: `linear-gradient(to top right, ${COLORS.primaryDark}, ${COLORS.info})` }}
                >
                    <Text size="xl" weight="bold">{data?.platform?.charAt(0) || "A"}</Text>
                </div>
            )}
            <div className="absolute -bottom-2 -right-2 border-2 border-white rounded-full px-2 py-0.5" style={{ backgroundColor: COLORS.light_green }}>
                <Text size="xs" weight="bold" className="uppercase tracking-wider text-[9px]" style={{ color: COLORS.anccent_green }}>
                  {data?.effective_status || "Active"}
                </Text>
            </div>
        </div>

        <div className="flex flex-col flex-1 min-w-0 pt-1">
          <Text as="h2" size="lg" weight="bold" className="leading-tight truncate block mb-1 transition-colors" style={{ color: COLORS.text }}>
            {data?.adName || "Campaign Name"}
          </Text>
          <div className="flex items-center gap-2">
            <Text 
              weight="semibold" 
              className="px-2.5 py-1 rounded-lg" 
              style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primaryDark, fontSize: '12px' }}
            >
              {data?.platform || "Platform"}
            </Text>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primary }}>
            <ArrowRight className="w-5 h-5" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-px p-5" style={{ backgroundColor: COLORS.bg }}>
        
        <div className="bg-white rounded-[20px] p-4 flex flex-col justify-between h-[96px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] mr-2 mb-2">
          <div className="flex items-center gap-2 w-full mb-2">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primary }}>
                <MousePointerClick className="w-4 h-4" />
            </div>
            <Text size="xs" weight="bold" className="uppercase tracking-wider" style={{ color: COLORS.muted }}>Clicks</Text>
          </div>
          <Text size="2xl" weight="bold" style={{ color: COLORS.text }}>{data?.totalClicks?.toLocaleString() || "0"}</Text>
        </div>

        <div className="bg-white rounded-[20px] p-4 flex flex-col justify-between h-[96px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] ml-2 mb-2">
          <div className="flex items-center gap-2 w-full mb-2">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#EEF2FF', color: COLORS.violet }}>
                <Eye className="w-4 h-4" />
            </div>
            <Text size="xs" weight="bold" className="uppercase tracking-wider" style={{ color: COLORS.muted }}>Impressions</Text>
          </div>
          <Text size="2xl" weight="bold" style={{ color: COLORS.text }}>{data?.totalImpressions?.toLocaleString() || "0"}</Text>
        </div>

        <div className="bg-white rounded-[20px] p-4 flex flex-col justify-between h-[96px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] mr-2 mt-2">
          <div className="flex items-center gap-2 w-full mb-2">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#FEF3C7', color: COLORS.warning }}>
                <Users className="w-4 h-4" />
            </div>
            <Text size="xs" weight="bold" className="uppercase tracking-wider" style={{ color: COLORS.muted }}>Leads</Text>
          </div>
          <Text size="2xl" weight="bold" style={{ color: COLORS.text }}>{data?.leadCount?.toLocaleString() || "0"}</Text>
        </div>

        <div className="bg-white rounded-[20px] p-4 flex flex-col justify-between h-[96px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] ml-2 mt-2">
          <div className="flex items-center gap-2 w-full mb-2">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#DCFCE7', color: COLORS.success }}>
                <Percent className="w-4 h-4" />
            </div>
            <Text size="xs" weight="bold" className="uppercase tracking-wider" style={{ color: COLORS.muted }}>CTR</Text>
          </div>
          <Text size="2xl" weight="bold" style={{ color: COLORS.text }}>{ctr}%</Text>
        </div>

      </div>
    </div>
  );
};
