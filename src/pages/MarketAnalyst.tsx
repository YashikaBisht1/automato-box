import { useState } from 'react';
import { ArrowLeft, Download, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { generateMarketAnalysis } from '@/lib/groq';
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

export default function MarketAnalyst() {
  const navigate = useNavigate();
  const { credits, deductCredit, groqApiKey, addActivity, updateSharedContext } = useAppStore();

  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [competitors, setCompetitors] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [progress, setProgress] = useState(0);

  const addCompetitor = () => {
    if (competitors.length < 5) {
      setCompetitors([...competitors, '']);
    }
  };

  const updateCompetitor = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const removeCompetitor = (index: number) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== index));
    }
  };

  const handleGenerate = async () => {
    if (!company || !industry) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!groqApiKey) {
      toast.error('Please add your Groq API key in Settings');
      return;
    }

    const validCompetitors = competitors.filter((c) => c.trim() !== '');
    if (validCompetitors.length === 0) {
      toast.error('Please add at least one competitor');
      return;
    }

    if (!deductCredit()) {
      toast.error('Not enough credits! Reset your credits in Settings.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setResult('');

    addActivity({
      agent: 'market_analyst',
      title: `Analyzing ${company} market position`,
      status: 'in-progress',
    });

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 1000);

      const analysis = await generateMarketAnalysis(
        groqApiKey,
        company,
        industry,
        validCompetitors
      );

      clearInterval(progressInterval);
      setProgress(100);
      setResult(analysis);

      addActivity({
        agent: 'market_analyst',
        title: `Competitor report generated for ${company}`,
        status: 'completed',
      });

      toast.success('Market analysis complete!');
    } catch (error: any) {
      console.error('Error generating analysis:', error);
      addActivity({
        agent: 'market_analyst',
        title: `Failed to analyze ${company}`,
        status: 'failed',
      });
      toast.error(error.message || 'Failed to generate analysis');
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
    a.download = `${company}-market-analysis.txt`;
    a.click();
    toast.success('Downloaded successfully');
  };

  const handleShareWithBranding = () => {
    updateSharedContext('marketAnalysis', {
      company,
      industry,
      competitors,
      analysis: result,
    });
    toast.success('Shared with Branding Agent');
    navigate('/branding');
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-2xl">🔍</span>
          </div>
          <h1 className="text-3xl font-bold">Market Analyst Agent</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Input Panel */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <h2 className="mb-6 text-xl font-semibold">Analysis Parameters</h2>

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
                  <Label htmlFor="industry">Industry *</Label>
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

                <div>
                  <Label>Competitors *</Label>
                  <div className="space-y-2">
                    {competitors.map((competitor, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Competitor ${index + 1}`}
                          value={competitor}
                          onChange={(e) => updateCompetitor(index, e.target.value)}
                          disabled={loading}
                        />
                        {competitors.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCompetitor(index)}
                            disabled={loading}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    {competitors.length < 5 && (
                      <Button
                        variant="outline"
                        onClick={addCompetitor}
                        className="w-full"
                        disabled={loading}
                      >
                        + Add Another Competitor
                      </Button>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || credits === 0}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Generating...' : 'Generate Market Analysis'}
                </Button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-xl p-6 min-h-[600px]">
              {!result && !loading && (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="max-w-md">
                    <div className="mb-4 text-6xl">📊</div>
                    <h3 className="mb-2 text-xl font-semibold">Ready to Analyze</h3>
                    <p className="text-muted-foreground">
                      Fill in the form and click Generate to get your market analysis
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
                        className={`h-3 w-3 rounded-full ${
                          progress > i * 25 ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-lg font-medium">Analyzing competitors...</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Estimated time: {Math.max(0, 45 - Math.floor(progress / 2))} seconds
                  </p>
                </div>
              )}

              {result && (
                <div className="animate-fade-in">
                  <div className="mb-4 flex gap-2">
                    <Button onClick={handleCopy} variant="outline" size="sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button onClick={handleDownload} variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button onClick={handleShareWithBranding} variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share with Branding
                    </Button>
                  </div>

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
