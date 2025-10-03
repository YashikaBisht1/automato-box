import { useState } from 'react';
import { ArrowLeft, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { generateContent } from '@/lib/groq';
import ReactMarkdown from 'react-markdown';

const linkedinStyles = [
  'Thought Leadership',
  'Story',
  'Listicle',
  'Announcement',
];

export default function Content() {
  const navigate = useNavigate();
  const { credits, deductCredit, groqApiKey, addActivity } = useAppStore();

  const [contentType, setContentType] = useState<'linkedin' | 'blog' | 'email'>('linkedin');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState([50]);
  const [audience, setAudience] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  const getToneLabel = (value: number) => {
    if (value <= 20) return 'Very Formal';
    if (value <= 40) return 'Formal';
    if (value <= 60) return 'Balanced';
    if (value <= 80) return 'Casual';
    return 'Very Casual';
  };

  const handleGenerate = async () => {
    if (!topic || !audience) {
      toast.error('Please fill in topic and target audience');
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
    setResults([]);

    addActivity({
      agent: 'content',
      title: `Generating ${contentType} content`,
      status: 'in-progress',
    });

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90));
      }, 800);

      const content = await generateContent(
        groqApiKey,
        contentType,
        topic,
        tone[0],
        audience,
        contentType === 'linkedin' ? selectedStyles : undefined,
        instructions
      );

      clearInterval(progressInterval);
      setProgress(100);

      if (contentType === 'linkedin') {
        const posts = content.split('---').map(p => p.trim()).filter(p => p);
        setResults(posts);
      } else {
        setResults([content]);
      }

      addActivity({
        agent: 'content',
        title: `${contentType} content generated`,
        status: 'completed',
      });

      toast.success('Content generated successfully!');
    } catch (error: any) {
      console.error('Error generating content:', error);
      addActivity({
        agent: 'content',
        title: `Failed to generate ${contentType} content`,
        status: 'failed',
      });
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleCopyPost = (post: string) => {
    navigator.clipboard.writeText(post);
    toast.success('Copied to clipboard');
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(results.join('\n\n---\n\n'));
    toast.success('All content copied to clipboard');
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
            <span className="text-2xl">✍️</span>
          </div>
          <h1 className="text-3xl font-bold">Content Agent</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <h2 className="mb-6 text-xl font-semibold">Content Parameters</h2>

              <div className="space-y-4">
                <div>
                  <Label>Content Type</Label>
                  <Tabs value={contentType} onValueChange={(v) => setContentType(v as any)} className="mt-2">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                      <TabsTrigger value="blog">Blog</TabsTrigger>
                      <TabsTrigger value="email">Email</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div>
                  <Label htmlFor="topic">Topic/Announcement *</Label>
                  <Textarea
                    id="topic"
                    placeholder="What do you want to write about?"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="audience">Target Audience *</Label>
                  <Input
                    id="audience"
                    placeholder="e.g., Tech founders, Marketing professionals"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label>Tone: {getToneLabel(tone[0])}</Label>
                  <Slider
                    value={tone}
                    onValueChange={setTone}
                    max={100}
                    step={1}
                    disabled={loading}
                    className="mt-2"
                  />
                </div>

                {contentType === 'linkedin' && (
                  <div>
                    <Label>Post Style</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {linkedinStyles.map((style) => (
                        <div key={style} className="flex items-center space-x-2">
                          <Checkbox
                            id={style}
                            checked={selectedStyles.includes(style)}
                            onCheckedChange={() => toggleStyle(style)}
                            disabled={loading}
                          />
                          <Label htmlFor={style} className="text-sm font-normal cursor-pointer">
                            {style}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Any specific requirements..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    disabled={loading}
                    rows={2}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || credits === 0}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Generating...' : `Generate ${contentType === 'linkedin' ? '10 Posts' : 'Content'}`}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass-card rounded-xl p-6 min-h-[600px]">
              {!results.length && !loading && (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="max-w-md">
                    <div className="mb-4 text-6xl">✍️</div>
                    <h3 className="mb-2 text-xl font-semibold">Ready to Create</h3>
                    <p className="text-muted-foreground">
                      Fill in the form and click Generate to create your content
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="mb-6 flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-3 w-3 rounded-full transition-colors ${
                          progress > i * 33 ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-lg font-medium">
                    {progress < 33 ? 'Analyzing topic...' :
                     progress < 66 ? 'Generating variations...' :
                     'Finalizing content...'}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This may take up to 30 seconds
                  </p>
                </div>
              )}

              {results.length > 0 && (
                <div className="animate-fade-in space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={handleCopyAll} variant="outline" size="sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy All
                    </Button>
                    <Button onClick={handleGenerate} variant="outline" size="sm" disabled={loading}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate More
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold">
                            {contentType === 'linkedin' ? `Post ${index + 1}` : 'Article'}
                          </h4>
                          <div className="flex gap-2">
                            {contentType === 'linkedin' && (
                              <span className="text-xs text-muted-foreground">
                                {result.length} chars
                              </span>
                            )}
                            <Button
                              onClick={() => handleCopyPost(result)}
                              variant="ghost"
                              size="sm"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{result}</ReactMarkdown>
                        </div>
                      </Card>
                    ))}
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
