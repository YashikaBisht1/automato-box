import { ArrowRight, LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AgentCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  route: string;
  gradient?: string;
}

export const AgentCard = ({ icon: Icon, title, description, route, gradient }: AgentCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="group glass-card glass-card-hover rounded-xl p-6 cursor-pointer relative overflow-hidden"
      onClick={() => navigate(route)}
    >
      <div className="absolute inset-0 gradient-glass opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Icon className="h-7 w-7" />
        </div>

        <h3 className="mb-2 text-xl font-bold">{title}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>

        <Button
          variant="ghost"
          className="group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 w-full justify-between"
        >
          Start
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};
