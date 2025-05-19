import SideNav from '@/components/dashboard/sidenav';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white">
      <div className="w-full flex-none md:w-64 border-r border-slate-200">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-8">{children}</div>
    </div>
  );
}