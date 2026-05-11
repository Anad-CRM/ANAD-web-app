"use client";

import { useRouter } from "next/navigation";
import { Circle } from "lucide-react";

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
  onBack: () => void;
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
            className="w-[360px] bg-[#F4F6F8] hover:bg-white flex items-center gap-[16px] px-[24px] py-[14px] rounded-[14px] transition-all duration-200 cursor-pointer text-left shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-transparent hover:border-gray-100"
          >
            <div className="flex items-center justify-center flex-shrink-0">
               <Circle size={20} color="#000000" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#000000] m-0 font-poppins leading-tight">
                {cat.title}
              </p>
              <p className="text-[12px] text-[#000000] opacity-80 m-0 mt-[4px] font-poppins leading-tight">
                {cat.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
