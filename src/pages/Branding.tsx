import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Copy, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { generateBrandIdentity, generateLogoPrompts } from '@/lib/groq';
import { saveLogo } from '@/lib/db';
import ReactMarkdown from 'react-markdown';

const industries = [
  'SaaS',
  'E-commerce',
  'FinTech',
  'Healthcare',
  'EdTech',
  'Marketing',
  'Real Estate',
  'Manufacturing',
];

const personalities = [
  'Professional',
  'Playful',
  'Bold',
  'Minimalist',
  'Luxury',
  'Trustworthy',
];

export default function Branding() {
  const navigate = useNavigate();
  const { credits, deductCredit, groqApiKey, addActivity, sharedContext, updateSharedContext } = useAppStore();

  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('');
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [logos, setLogos] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (sharedContext.marketAnalysis) {
      const { company: marketCompany, industry: marketIndustry } = sharedContext.marketAnalysis;
      if (marketCompany) setCompany(marketCompany);
      if (marketIndustry) setIndustry(marketIndustry);
      toast.success('✨ Using insights from Market Analyst');
    }
  }, [sharedContext]);

  const togglePersonality = (personality: string) => {
    setSelectedPersonalities((prev) =>
      prev.includes(personality)
        ? prev.filter((p) => p !== personality)
        : [...prev, personality]
    );
  };

  const generateLogos = async (prompts: string[]) => {
    const logoUrls: string[] = [];
    
    for (const prompt of prompts) {
      try {
        const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              negative_prompt: 'blurry, text, watermark, low quality, complex, cluttered, photo, realistic',
              num_inference_steps: 30,
            },
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const logoId = await saveLogo(company, blob);
          const url = URL.createObjectURL(blob);
          logoUrls.push(url);
        }
      } catch (error) {
        console.error('Logo generation error:', error);
      }
    }
    
    return logoUrls;
  };

  const handleGenerate = async () => {
    if (!company || !description || !audience || selectedPersonalities.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!groqApiKey) {
      toast.error('Please add your Groq API key in Settings');
      return;
    }

    if (!deductCredit()) {
      toast.error('Not enough credits! Reset your credits in Settings.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setResult('');
    setLogos([]);

    addActivity({
      agent: 'branding',
      title: `Creating brand identity for ${company}`,
      status: 'in-progress',
    });

    try {
      setProgress(20);
      setProgress(40);
      const brandContent = await generateBrandIdentity(
        groqApiKey,
        company,
        description,
        audience,
        selectedPersonalities,
        industry
      );
      
      setResult(brandContent);
      setProgress(60);

      const logoPrompts = generateLogoPrompts(company, selectedPersonalities, industry);
      const generatedLogos = await generateLogos(logoPrompts);
      setLogos(generatedLogos);

      setProgress(100);

      addActivity({
        agent: 'branding',
        title: `Brand identity created for ${company}`,
        status: 'completed',
      });

      updateSharedContext('brandIdentity', {
        company,
        description,
        audience,
        personality: selectedPersonalities,
        content: brandContent,
      });

      toast.success('Brand identity complete!');
    } catch (error: any) {
      console.error('Error generating brand identity:', error);
      addActivity({
        agent: 'branding',
        title: `Failed to create brand for ${company}`,
        status: 'failed',
      });
      toast.error(error.message || 'Failed to generate brand identity');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company}-brand-identity.txt`;
    a.click();
    toast.success('Downloaded successfully');
  };

  const handleDownloadLogo = (logoUrl: string, index: number) => {
    const a = document.createElement('a');
    a.href = logoUrl;
    a.download = `${company}-logo-${index + 1}.png`;
    a.click();
    toast.success('Logo downloaded');
  };

  const handleShareWithContent = () => {
    updateSharedContext('brandIdentity', {
      company,
      description,
      audience,
      personality: selectedPersonalities,
      content: result,
    });
    toast.success('Shared with Content Agent');
    navigate('/content');
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-2xl">🎨</span>
          </div>
          <h1 className="text-3xl font-bold">Branding Agent</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <h2 className="mb-6 text-xl font-semibold">Brand Parameters</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    placeholder="Your company name"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Company Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your company in 2-3 sentences..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="audience">Target Audience *</Label>
                  <Input
                    id="audience"
                    placeholder="e.g., Tech-savvy millennials"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label>Brand Personality * (Select at least one)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {personalities.map((personality) => (
                      <div key={personality} className="flex items-center space-x-2">
                        <Checkbox
                          id={personality}
                          checked={selectedPersonalities.includes(personality)}
                          onCheckedChange={() => togglePersonality(personality)}
                          disabled={loading}
                        />
                        <Label
                          htmlFor={personality}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {personality}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || credits === 0}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Generating...' : 'Generate Brand Identity'}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass-card rounded-xl p-6 min-h-[600px]">
              {!result && !loading && (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="max-w-md">
                    <div className="mb-4 text-6xl">🎨</div>
                    <h3 className="mb-2 text-xl font-semibold">Ready to Brand</h3>
                    <p className="text-muted-foreground">
                      Fill in the form and click Generate to create your brand identity
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="mb-6 flex gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-3 w-3 rounded-full transition-colors ${
                          progress > i * 25 ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-lg font-medium">
                    {progress < 40 ? 'Understanding your brand...' :
                     progress < 60 ? 'Crafting taglines...' :
                     'Generating logos...'}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This may take up to 90 seconds
                  </p>
                </div>
              )}

              {result && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex gap-2">
                    <Button onClick={handleCopy} variant="outline" size="sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button onClick={handleDownload} variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button onClick={handleShareWithContent} variant="outline" size="sm">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Share with Content
                    </Button>
                  </div>

                  {logos.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Generated Logos</h3>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {logos.map((logo, index) => (
                          <div key={index} className="glass-card p-3 rounded-lg">
                            <img
                              src={logo}
                              alt={`Logo ${index + 1}`}
                              className="w-full aspect-square object-cover rounded mb-2"
                            />
                            <Button
                              onClick={() => handleDownloadLogo(logo, index)}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Download className="mr-2 h-3 w-3" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="prose prose-slate max-w-none dark:prose-invert">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
