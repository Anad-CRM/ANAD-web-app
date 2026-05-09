import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-poppins",
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`relative min-h-screen overflow-hidden flex items-center justify-center bg-[linear-gradient(90deg,#C7D8E9_0%,#255BA3_100%)] ${poppins.variable} font-poppins`}>
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-white/20 blur-[100px]" />
      <div className="absolute bottom-[-150px] left-[-100px] w-[450px] h-[450px] rounded-full bg-[#A9C8F3]/30 blur-[120px]" />

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
            style={{ fontSize: '20px', lineHeight: '20px' }}
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