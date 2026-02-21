import { useContactStats } from '../hooks/useContacts';
import { useCampaigns } from '../hooks/useCampaigns';
import StatsCard from '../components/StatsCard';
import { PageLoader } from '../components/Spinner';
import PageHeader from '../components/PageHeader';

function CallIcon() {
  return (
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

export default function Dashboard() {
  const { data: statsData, isLoading: statsLoading } = useContactStats();
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns();

  const stats = statsData?.data;
  const campaigns = campaignsData?.data ?? [];

  if (statsLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your voice calling campaigns"
      />

      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <StatsCard
            title="Total Contacts"
            value={stats?.totalContacts ?? 0}
            icon={<UsersIcon />}
            colorClass="bg-indigo-50"
          />
          <StatsCard
            title="Total Calls"
            value={stats?.totalCalls ?? 0}
            icon={<CallIcon />}
            colorClass="bg-blue-50"
          />
          <StatsCard
            title="Interested"
            value={stats?.interested ?? 0}
            subtitle="Pressed 1"
            icon={<CheckIcon />}
            colorClass="bg-green-50"
          />
          <StatsCard
            title="Not Interested"
            value={stats?.notInterested ?? 0}
            subtitle="Pressed 2"
            icon={<XIcon />}
            colorClass="bg-red-50"
          />
          <StatsCard
            title="Call Success Rate"
            value={`${stats?.successRate ?? 0}%`}
            subtitle="Answered / Total"
            icon={<ChartIcon />}
            colorClass="bg-purple-50"
          />
        </div>

        {/* Status breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Status Breakdown */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Contact Status Breakdown</h2>
            <div className="space-y-3">
              {[
                { label: 'Not Called', value: (stats?.totalContacts ?? 0) - (stats?.called ?? 0), color: 'bg-gray-400' },
                { label: 'Interested', value: stats?.interested ?? 0, color: 'bg-green-500' },
                { label: 'Not Interested', value: stats?.notInterested ?? 0, color: 'bg-red-500' },
                { label: 'No Answer', value: stats?.noAnswer ?? 0, color: 'bg-yellow-500' },
                { label: 'Failed', value: stats?.failed ?? 0, color: 'bg-orange-500' },
              ].map((item) => {
                const total = stats?.totalContacts || 1;
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.value} <span className="text-gray-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Campaigns</h2>
            {campaignsLoading ? (
              <PageLoader />
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <p className="text-sm text-gray-500">No campaigns yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="badge bg-blue-100 text-blue-700">
                        {c._count?.calls ?? 0} calls
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'No Answer', value: stats?.noAnswer ?? 0, className: 'bg-yellow-50 border-yellow-200' },
            { label: 'Failed Calls', value: stats?.failed ?? 0, className: 'bg-orange-50 border-orange-200' },
            { label: 'Already Called', value: stats?.called ?? 0, className: 'bg-blue-50 border-blue-200' },
            { label: 'Total Campaigns', value: campaigns.length, className: 'bg-purple-50 border-purple-200' },
          ].map((item) => (
            <div key={item.label} className={`card p-4 border ${item.className}`}>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-sm text-gray-600 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
