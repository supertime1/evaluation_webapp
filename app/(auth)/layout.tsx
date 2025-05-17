import { Logo } from "@/components/ui/logo";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side with background - 50% width */}
      <div className="hidden lg:block lg:w-1/2 relative">
        {/* Fortinet logo at left top */}
        <div className="absolute top-8 left-8 z-30">
          <Image 
            src="/logo.svg"
            alt="Fortinet"
            width={120}
            height={30}
          />
        </div>
        
        {/* Background illustration - smaller size */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="w-4/5 h-4/5 relative">
            <Image 
              src="/images/auth-background.png"
              alt="Background" 
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
      </div>
      
      {/* Right side with auth form - 50% width */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-md mx-auto w-full">
          {/* FortiEval branding */}
          <div className="w-full mb-8">
            <h1 className="text-2xl font-bold text-slate-800">
              FortiEval
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Define, run, and visualize your LLM evaluation experiments with ease
            </p>
          </div>
          
          {/* Auth form */}
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 