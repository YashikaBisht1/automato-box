import { Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const credits = useAppStore((state) => state.credits);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              AI Startup-in-a-Box
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur px-5 py-2.5">
              <span className="text-sm font-medium text-muted-foreground">Credits:</span>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{credits}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110"
            >
              <Settings className="h-5 w-5 transition-transform hover:rotate-90 duration-300" />
            </Button>
          </div>
        </div>
      </header>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </>
  );
};
