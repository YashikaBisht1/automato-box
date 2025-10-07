import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AgentInterface from '@/components/AgentInterface';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { saveLogo } from '@/lib/db';

export default function Branding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);

  const handleGenerateLogo = async (brandingOutput: string) => {
    setIsGeneratingLogo(true);
    try {
      // Extract company name or use a generic prompt
      const logoPrompt = `Modern minimalist logo for: ${brandingOutput.substring(0, 200)}`;
      
      const { data, error } = await supabase.functions.invoke('generate-logo', {
        body: { prompt: logoPrompt }
      });

      if (error) throw error;
      
      if (data?.imageUrl) {
        setGeneratedLogo(data.imageUrl);
        
        // Convert base64 to blob and save to IndexedDB
        const base64Data = data.imageUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        
        await saveLogo('brand-logo', blob);
        
        toast({
          title: "Logo Generated!",
          description: "Your brand logo has been created and saved."
        });
      }
    } catch (error: any) {
      console.error('Logo generation error:', error);
      toast({
        title: "Logo Generation Failed",
        description: error.message || "Failed to generate logo",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const downloadLogo = () => {
    if (!generatedLogo) return;
    
    const link = document.createElement('a');
    link.href = generatedLogo;
    link.download = 'brand-logo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Logo Downloaded",
      description: "Your logo has been saved to your device."
    });
  };

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

      <div className="space-y-6">
        <AgentInterface
          agentType="branding"
          agentName="🎨 Branding Agent"
          placeholder="Create a brand identity for my eco-friendly SaaS startup targeting small businesses. I want a professional yet approachable tone."
          onOutputGenerated={handleGenerateLogo}
        />

        {generatedLogo && (
          <div className="fixed bottom-8 right-8 z-30 bg-background/95 backdrop-blur border rounded-lg shadow-lg p-4 max-w-sm">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Generated Logo</h3>
              <img 
                src={generatedLogo} 
                alt="Generated brand logo" 
                className="w-full h-auto rounded border"
              />
              <Button 
                onClick={downloadLogo}
                className="w-full"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Logo
              </Button>
            </div>
          </div>
        )}

        {isGeneratingLogo && (
          <div className="fixed bottom-8 right-8 z-30 bg-background/95 backdrop-blur border rounded-lg shadow-lg p-4">
            <p className="text-sm">Generating logo...</p>
          </div>
        )}
      </div>
    </div>
  );
}
