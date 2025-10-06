import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AgentInterface from '@/components/AgentInterface';

export default function Content() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-20"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <AgentInterface
        agentType="content"
        agentName="✍️ Content Agent"
        placeholder="Create LinkedIn posts about AI productivity tools for B2B SaaS companies. Include engagement hooks and call-to-actions."
      />
    </div>
  );
}
