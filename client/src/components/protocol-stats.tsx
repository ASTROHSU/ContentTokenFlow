import { useQuery } from '@tanstack/react-query';
import { formatUSDC } from '@/lib/web3';

interface Stats {
  totalPayments: number;
  totalUSDC: string;
  activeAgents: number;
  totalArticles: number;
}

export function ProtocolStats() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (!stats) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-gray-300 animate-pulse">--</div>
                <div className="text-gray-600 mt-1">Loading...</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {stats.totalPayments.toLocaleString()}
            </div>
            <div className="text-gray-600 mt-1">AI Payments Made</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">
              ${formatUSDC(stats.totalUSDC)}
            </div>
            <div className="text-gray-600 mt-1">USDC Transacted</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary">
              {stats.activeAgents}
            </div>
            <div className="text-gray-600 mt-1">Active AI Agents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral">
              {stats.totalArticles}
            </div>
            <div className="text-gray-600 mt-1">Premium Articles</div>
          </div>
        </div>
      </div>
    </section>
  );
}
