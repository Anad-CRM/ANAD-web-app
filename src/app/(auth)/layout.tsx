import { Poppins } from "next/font/google";
import DecorativeSphere from "@/modules/auth/components/DecorativeSphere";
import AuthHeader from "@/modules/auth/components/AuthHeader";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`relative min-h-screen overflow-hidden flex items-center justify-center bg-[linear-gradient(90deg,#C7D8E9_0%,#255BA3_100%)] ${poppins.variable} font-poppins`}>
      <DecorativeSphere 
        size="132px" 
        className="top-[95px] left-[1157px]" 
        color="linear-gradient(0deg, rgba(94, 94, 94, 0.1), rgba(94, 94, 94, 0.1)), linear-gradient(90deg, #D6E4F0 0%, #1E56A0 100%)"
        backdropBlur="7px"
      />
      <DecorativeSphere 
        size="450px" 
        className="bottom-[-150px] left-[-100px]" 
        color="rgba(169, 200, 243, 0.25)"
        blur="60px"
        backdropBlur="10px"
      />

      <div className="relative z-10 flex flex-col items-center w-full px-4">
        <AuthHeader />

        {children}
      </div>
    </div>
  );
}