import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AgentInterface from '@/components/AgentInterface';

export default function MarketAnalyst() {
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
        agentType="market-analyst"
        agentName="🔍 Market Analyst Agent"
        placeholder="Analyze competitors for my SaaS startup in the project management space. Main competitors are Asana, Monday.com, and Notion."
      />
    </div>
  );
}
