import { Search, Palette, FileText, Mail } from 'lucide-react';
import { AgentCard } from '@/components/AgentCard';
import { RecentActivity } from '@/components/RecentActivity';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const agents = [
  {
    icon: Search,
    title: 'Market Analyst',
    description: 'Research competitors and analyze market trends',
    route: '/market-analyst',
  },
  {
    icon: Palette,
    title: 'Branding Agent',
    description: 'Create brand identity and visual assets',
    route: '/branding',
  },
  {
    icon: FileText,
    title: 'Content Agent',
    description: 'Generate engaging content and copy',
    route: '/content',
  },
  {
    icon: Mail,
    title: 'Outreach Agent',
    description: 'Launch personalized email campaigns',
    route: '/outreach',
  },
];

export default function Dashboard() {
  const [showWelcome, setShowWelcome] = useState(false);
  const credits = useAppStore((state) => state.credits);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }

    if (credits <= 10 && credits > 0) {
      toast.warning(`You have ${credits} credits remaining`, {
        description: 'Reset your credits in Settings when you run out',
      });
    }
  }, [credits]);

  return (
    <>
      <div className="min-h-screen pb-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 -z-10 gradient-glass" />
          
          <div className="container">
            <div className="mx-auto max-w-3xl text-center animate-fade-in">
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Welcome! What would you like to{' '}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  accomplish today?
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Choose an AI agent below to automate your business tasks
              </p>
            </div>
          </div>
        </section>

        {/* Agent Cards Grid */}
        <section className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 mb-12 animate-slide-up">
            {agents.map((agent) => (
              <AgentCard key={agent.title} {...agent} />
            ))}
          </div>

          {/* Recent Activity */}
          <div className="mx-auto max-w-4xl animate-fade-in">
            <h2 className="mb-6 text-2xl font-bold">Recent Activity</h2>
            <RecentActivity />
          </div>
        </section>
      </div>

      {/* Welcome Dialog */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Welcome to AI Startup-in-a-Box! 🚀</DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <p>You have <strong className="text-primary">50 free credits</strong> to get started.</p>
              <p>Each agent request costs 1 credit. When you run out, you can reset your credits in Settings.</p>
              <p className="text-sm">
                <strong>Pro tip:</strong> Get your free Groq API key from{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Groq Console
                </a>{' '}
                and add it in Settings to start using the agents.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
