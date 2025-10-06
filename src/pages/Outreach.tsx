import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AgentInterface from '@/components/AgentInterface';

export default function Outreach() {
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
        agentType="outreach"
        agentName="📧 Outreach Agent"
        placeholder="Write a cold email to SaaS founders about partnership opportunities for a marketing automation platform."
      />
    </div>
  );
}
