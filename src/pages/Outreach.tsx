import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Outreach() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-12">
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-2xl">📧</span>
          </div>
          <h1 className="text-3xl font-bold">Outreach Agent</h1>
        </div>

        <div className="glass-card rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">
            The Outreach Agent is currently under development. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
}
