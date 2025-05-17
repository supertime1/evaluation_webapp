import React from 'react';
import { Logo } from '../../components/ui/logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Left side with background image */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-700 opacity-90" />
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white px-12">
          <Logo size="lg" />
          <h1 className="text-4xl font-bold mt-6 mb-2">LLM Evaluation Dashboard</h1>
          <p className="text-xl text-blue-100 text-center">
            Define, run, and visualize your LLM evaluation experiments with ease
          </p>
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
              <FeatureItem 
                icon="📊" 
                title="Comprehensive Analytics" 
                description="Track performance metrics across different models and configurations"
              />
              <FeatureItem 
                icon="🔄" 
                title="Seamless Integration" 
                description="Connect directly to your codebase and CI/CD pipelines"
              />
              <FeatureItem 
                icon="📱" 
                title="Responsive Design" 
                description="Access your evaluation results from any device"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right side with form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className="text-2xl">{icon}</div>
      <div>
        <h3 className="font-medium text-white">{title}</h3>
        <p className="text-blue-100 text-sm">{description}</p>
      </div>
    </div>
  );
} 