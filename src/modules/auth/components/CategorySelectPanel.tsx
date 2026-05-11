"use client";

import { useRouter } from "next/navigation";
import { Circle } from "lucide-react";
import { Text } from "@/core/components/ui/Text";
import { COLORS } from "@/core/components/theme/colors";

type Category = "organization" | "individual" | "student";

const CATEGORIES: {
  id: Category;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "organization",
    title: "Organization",
    subtitle: "Register as a company Administrator",
  },
  {
    id: "individual",
    title: "Individual",
    subtitle: "Register as a Staff, Team Leader or Manager",
  },
  {
    id: "student",
    title: "Student",
    subtitle: "Register as a Student",
  },
];

interface CategorySelectPanelProps {
  onBack?: () => void;
}

export default function CategorySelectPanel({
  onBack,
}: CategorySelectPanelProps) {
  const router = useRouter();

  function handleSelect(id: Category) {
    router.push(`/signup?role=${id}`);
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full pb-2">
      <div className="flex flex-col items-center gap-[12px] w-full">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleSelect(cat.id)}
            className="w-[360px] flex items-center gap-[16px] px-[24px] py-[14px] rounded-[14px] transition-all duration-200 cursor-pointer text-left shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-transparent hover:border-gray-100"
            style={{ backgroundColor: COLORS.surface }}
          >
            <div className="flex items-center justify-center flex-shrink-0">
               <Circle size={20} color={COLORS.text} strokeWidth={1.5} />
            </div>
            <div>
              <Text 
                as="p" 
                weight="bold" 
                className="font-poppins m-0 leading-tight"
                style={{ fontSize: '15px', color: COLORS.text }}
              >
                {cat.title}
              </Text>
              <Text 
                as="p" 
                weight="normal" 
                className="font-poppins m-0 mt-[4px] leading-tight"
                style={{ fontSize: '12px', color: COLORS.muted }}
              >
                {cat.subtitle}
              </Text>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
