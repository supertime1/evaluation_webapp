import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h1 className="font-bold text-xl">FortiEval</h1>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2 px-4">
            <li>
              <Link
                href="/dashboard"
                className="block py-2 px-4 rounded hover:bg-gray-800"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/experiments"
                className="block py-2 px-4 rounded hover:bg-gray-800"
              >
                Experiments
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/test-cases"
                className="block py-2 px-4 rounded hover:bg-gray-800"
              >
                Test Cases
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Notifications</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <Link 
                href="/logout"
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500 hover:bg-gray-600"
              >
                <span className="text-xs font-medium leading-none text-white">
                  LZ
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="py-6 px-4 sm:p-6 md:py-10 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
} 