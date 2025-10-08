import { Search, Palette, FileText, Mail, Brain } from 'lucide-react';
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
    icon: Brain,
    title: 'AI Orchestrator',
    description: 'Smart router that coordinates multiple agents',
    route: '/orchestrator',
  },
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
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 -z-10 gradient-hero" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.1),transparent_50%)]" />
          
          <div className="container">
            <div className="mx-auto max-w-3xl text-center animate-fade-in">
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-medium text-primary">AI-Powered Startup Tools</span>
              </div>
              
              <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                Welcome! What would you like to{' '}
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-pulse">
                  accomplish today?
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Choose an AI agent below to automate your business tasks and accelerate growth
              </p>
            </div>
          </div>
        </section>

        {/* Agent Cards Grid */}
        <section className="container -mt-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mb-16 animate-slide-up">
            {agents.map((agent, idx) => (
              <div 
                key={agent.title}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <AgentCard {...agent} />
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="mx-auto max-w-5xl animate-fade-in">
            <h2 className="mb-8 text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Recent Activity
            </h2>
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
