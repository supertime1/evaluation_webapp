export default function Dashboard() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Card - Total Experiments */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Total Experiments</h3>
            <p className="text-3xl font-semibold">12</p>
            <div className="text-sm text-green-600">
              <span>+2 from last week</span>
            </div>
          </div>
        </div>
        
        {/* Stats Card - Active Runs */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Active Runs</h3>
            <p className="text-3xl font-semibold">3</p>
            <div className="text-sm text-gray-600">
              <span>Last run: 2 hours ago</span>
            </div>
          </div>
        </div>
        
        {/* Stats Card - Test Cases */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Test Cases</h3>
            <p className="text-3xl font-semibold">48</p>
            <div className="text-sm text-green-600">
              <span>+5 from last week</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Experiments */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Recent Experiments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  GPT-4 Evaluation
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2 hours ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  92%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  RAG Pipeline Test
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    In Progress
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Running
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  --
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  LLaMA 2 Benchmark
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Failed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  1 day ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  68%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 