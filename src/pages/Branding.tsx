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
  const [showLogoPreview, setShowLogoPreview] = useState(false);

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
        setShowLogoPreview(true);
        
        toast({
          title: "Logo Generated!",
          description: "Review your logo and choose to save or discard."
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

  const handleSaveLogo = async () => {
    if (!generatedLogo) return;
    
    try {
      // Convert base64 to blob and save to IndexedDB
      const base64Data = generatedLogo.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      
      await saveLogo('brand-logo', blob);
      
      toast({
        title: "Logo Saved!",
        description: "Your brand logo has been saved successfully."
      });
      setShowLogoPreview(false);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save the logo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDiscardLogo = () => {
    setGeneratedLogo(null);
    setShowLogoPreview(false);
    toast({
      title: "Logo Discarded",
      description: "The generated logo has been discarded."
    });
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
        className="absolute top-4 left-4 z-20 group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </Button>

      <div className="space-y-6">
        <AgentInterface
          agentType="branding"
          agentName="🎨 Branding Agent"
          placeholder="Create a brand identity for my eco-friendly SaaS startup targeting small businesses. I want a professional yet approachable tone."
          onOutputGenerated={handleGenerateLogo}
        />

        {showLogoPreview && generatedLogo && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-card border rounded-xl shadow-2xl p-6 max-w-2xl w-full space-y-6 animate-scale-in">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Your Generated Logo</h3>
                <p className="text-muted-foreground">Review and decide whether to save or discard</p>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-8 flex items-center justify-center">
                <img 
                  src={generatedLogo} 
                  alt="Generated brand logo" 
                  className="max-w-full max-h-96 h-auto rounded-lg shadow-lg"
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleDiscardLogo}
                  variant="outline"
                  className="flex-1 group"
                >
                  <span className="transition-transform group-hover:scale-105">Discard</span>
                </Button>
                <Button 
                  onClick={downloadLogo}
                  variant="secondary"
                  className="flex-1 group"
                >
                  <Download className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Download
                </Button>
                <Button 
                  onClick={handleSaveLogo}
                  className="flex-1 group gradient-primary"
                >
                  <span className="transition-transform group-hover:scale-105">Save Logo</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {isGeneratingLogo && (
          <div className="fixed bottom-8 right-8 z-30 glass-card rounded-lg shadow-xl p-6 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <p className="text-sm font-medium">Generating your logo...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
