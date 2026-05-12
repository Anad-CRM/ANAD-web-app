"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Building2, User, GraduationCap } from "lucide-react";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";

type Category = "organization" | "individual" | "student";

const CATEGORIES: {
  id: Category;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "organization",
    title: "Organization",
    subtitle: "Register as a company Administrator",
    icon: <Building2 size={20} color="#5E5E5E" strokeWidth={2} />,
  },
  {
    id: "individual",
    title: "Individual",
    subtitle: "Register as a Staff, Team Leader or Manager",
    icon: <User size={20} color="#5E5E5E" strokeWidth={2} />,
  },
  {
    id: "student",
    title: "Student",
    subtitle: "Register as a Student",
    icon: <GraduationCap size={20} color="#5E5E5E" strokeWidth={2} />,
  },
];

interface CategorySelectPanelProps {
  onBack?: () => void;
}

export default function CategorySelectPanel({
  onBack,
}: CategorySelectPanelProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = React.useState<Category | null>(null);

  function handleSelect(id: Category) {
    setSelectedId(id);
    setTimeout(() => {
      router.push(`/signup?role=${id}`);
    }, 400);
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full pb-2">
      <div className="flex flex-col items-center gap-[12px] w-full">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedId === cat.id;
          
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.id)}
              disabled={!!selectedId}
              className={`
                w-full max-w-[360px] flex items-center gap-[16px] px-[20px] sm:px-[24px] py-[14px] 
                rounded-[14px] transition-all duration-200 cursor-pointer text-left 
                shadow-[0_4px_12px_rgba(0,0,0,0.06)] 
                hover:shadow-[0_6px_20px_rgba(30,86,160,0.12)]
                active:scale-[0.98]
                border-2
                ${isSelected 
                  ? "border-[#1E56A0] bg-[#EEF4FB]" 
                  : "border-transparent hover:border-[#D6E4F0]"}
              `}
              style={{ 
                backgroundColor: isSelected ? COLORS.primaryXlight : COLORS.surface,
              }}
            >
              <div 
                className={`flex items-center justify-center flex-shrink-0 p-2 rounded-xl transition-colors duration-200
                  ${isSelected ? "bg-[#1E56A0]/10" : "bg-gray-50"}
                `}
              >
                {React.cloneElement(cat.icon as React.ReactElement<{ color?: string }>, {
                  color: isSelected ? COLORS.primary : "#5E5E5E"
                })}
              </div>
              <div>
                <Text 
                  as="p" 
                  weight="bold" 
                  className="font-poppins m-0 leading-tight"
                  style={{ 
                    fontSize: '15px', 
                    color: isSelected ? COLORS.primary : COLORS.text 
                  }}
                >
                  {cat.title}
                </Text>
                <Text 
                  as="p" 
                  weight="normal" 
                  className="font-poppins m-0 mt-[4px] leading-tight"
                  style={{ 
                    fontSize: '12px', 
                    color: isSelected ? COLORS.primary : COLORS.muted 
                  }}
                >
                  {cat.subtitle}
                </Text>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
