import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, ChartLine, Settings } from 'lucide-react';

interface AgentActivity {
  id: number;
  agentId: string;
  action: string;
  articleId?: number;
  amount?: string;
  status: string;
  createdAt: string;
}

export function AIAgentSimulator() {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const queryClient = useQueryClient();

  const { data: agentActivities } = useQuery<AgentActivity[]>({
    queryKey: ['/api/agent-activity'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const simulateActivityMutation = useMutation({
    mutationFn: () =>
      fetch('/api/agent-activity/simulate', {
        method: 'POST',
        credentials: 'include',
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-activity'] });
    },
  });

  useEffect(() => {
    if (agentActivities) {
      setActivities(agentActivities);
    }
  }, [agentActivities]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getActionColor = (action: string) => {
    if (action.includes('Payment')) return 'text-accent';
    if (action.includes('Scanning')) return 'text-blue-400';
    if (action.includes('Evaluating')) return 'text-yellow-400';
    return 'text-purple-400';
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral mb-4">AI 代理即時活動</h2>
          <p className="text-gray-600">觀看自主代理即時發現並購買內容的過程</p>
        </div>

        <Card className="bg-neutral text-green-400 font-mono text-sm mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">區塊勢 AI 協議終端</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <Badge variant="outline" className="text-green-400 border-green-400">
                  LIVE
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="flex justify-between text-xs">
                  <span>[{formatTimestamp(activity.createdAt)}] {activity.agentId}:</span>
                  <span className={getActionColor(activity.action)}>
                    {activity.action}
                  </span>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No agent activity yet. Click "Simulate Activity" to start.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-light-gray">
            <CardContent className="p-6 text-center">
              <Bot className="mx-auto text-3xl text-primary mb-3" />
              <h4 className="font-semibold text-neutral mb-2">Deploy Agent</h4>
              <p className="text-gray-600 text-sm mb-4">
                Create your own autonomous content discovery agent
              </p>
              <Button 
                onClick={() => simulateActivityMutation.mutate()}
                disabled={simulateActivityMutation.isPending}
                className="w-full bg-primary text-white hover:bg-indigo-700"
              >
                {simulateActivityMutation.isPending ? 'Launching...' : 'Launch Agent'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-light-gray">
            <CardContent className="p-6 text-center">
              <ChartLine className="mx-auto text-3xl text-secondary mb-3" />
              <h4 className="font-semibold text-neutral mb-2">Agent Analytics</h4>
              <p className="text-gray-600 text-sm mb-4">
                Monitor your agent's performance and spending
              </p>
              <Button 
                variant="secondary"
                className="w-full bg-secondary text-white hover:bg-purple-700"
              >
                View Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-light-gray">
            <CardContent className="p-6 text-center">
              <Settings className="mx-auto text-3xl text-accent mb-3" />
              <h4 className="font-semibold text-neutral mb-2">Configure Rules</h4>
              <p className="text-gray-600 text-sm mb-4">
                Set spending limits and content preferences
              </p>
              <Button 
                variant="outline"
                className="w-full bg-accent text-white hover:bg-emerald-700 border-accent"
              >
                Manage Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
