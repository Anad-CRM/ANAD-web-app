import { Poppins } from "next/font/google";
import DecorativeSphere from "@/modules/auth/components/DecorativeSphere";

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
        <h1 
          className="mt-12 mb-12 text-white font-bold text-center tracking-normal drop-shadow-md"
          style={{ fontSize: '40px', lineHeight: '36px' }}
        >
          Welcome back!
        </h1>

        {children}

        <div className="mt-14 flex items-center justify-center">
          <p 
            className="text-white font-medium text-center"
            style={{ fontSize: '18px', lineHeight: '18px' }}
          >
            To create a new account.
            <span className="underline cursor-pointer ml-1 hover:text-white/80 transition-colors">
              Click here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}