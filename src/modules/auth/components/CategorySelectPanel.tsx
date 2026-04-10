"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [selected, setSelected] = useState<Category>("organization");

  function handleNext() {
    router.push(`/signup?role=${selected}`);
  }

  return (
    <>
      <div className="px-[30px] pt-[50px] pb-[20px]">
        <h2 className="text-[26px] font-bold italic text-[#0D1B3E] mb-[4px]">
          Welcome !
        </h2>
        <p className="text-[14px] text-[#5A7190] font-medium">
          Please Choose Your Category
        </p>
      </div>

      <div className="w-full h-[1px] bg-[#C8D6E5]" />

      <div className="bg-[#D6E4F0] px-[30px] pt-[24px] pb-[30px] flex flex-col items-center gap-[16px]">
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelected(cat.id)}
              className={`w-full flex items-center gap-[14px] px-[20px] py-[16px] rounded-[14px] border-2 transition-all duration-200 cursor-pointer text-left ${
                isSelected
                  ? "bg-[#DAE5F0] border-[#163172]"
                  : "bg-white border-transparent"
              }`}
            >
              <div
                className={`w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "border-[#163172]" : "border-[#B0BEC5]"
                }`}
              >
                {isSelected && (
                  <div className="w-[12px] h-[12px] rounded-full bg-[#163172]" />
                )}
              </div>
              <div>
                <p className="text-[16px] font-bold text-[#0D1B3E] m-0">
                  {cat.title}
                </p>
                <p className="text-[13px] text-[#5A7190] m-0 mt-[2px]">
                  {cat.subtitle}
                </p>
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleNext}
          className="w-[200px] h-[44px] rounded-full bg-[#163172] text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(22,49,114,0.3)] mt-[8px] border-none cursor-pointer"
        >
          Next
        </button>

        <button
          type="button"
          onClick={onBack}
          className="text-[13px] font-semibold text-[#163172] bg-transparent border-none cursor-pointer mt-[4px]"
        >
          Back to Login
        </button>
      </div>
    </>
  );
}
