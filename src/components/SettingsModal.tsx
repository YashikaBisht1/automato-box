import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { toast } from 'sonner';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { userName, groqApiKey, setUserName, setGroqApiKey, resetCredits } = useAppStore();
  const [localName, setLocalName] = useState(userName);
  const [localApiKey, setLocalApiKey] = useState(groqApiKey);

  const handleSave = () => {
    setUserName(localName);
    setGroqApiKey(localApiKey);
    toast.success('Settings saved successfully');
    onOpenChange(false);
  };

  const handleResetCredits = () => {
    resetCredits();
    toast.success('Credits reset to 50');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your AI Startup-in-a-Box experience
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Your Name (Optional)</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="apiKey">Groq API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Groq API key"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your free API key from{' '}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Groq Console
              </a>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleResetCredits} variant="outline">
              Reset Credits to 50
            </Button>
            <Button onClick={handleClearData} variant="destructive">
              Clear All Data
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
