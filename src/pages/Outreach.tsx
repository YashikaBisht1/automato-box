import { useState } from 'react';
import { ArrowLeft, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { generateOutreachSequence } from '@/lib/groq';
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

const goals = [
  'Partnership',
  'Sales',
  'Investors',
  'Hiring',
  'Networking',
];

interface Email {
  number: number;
  subject: string;
  body: string;
  timing: string;
}

export default function Outreach() {
  const navigate = useNavigate();
  const { credits, deductCredit, groqApiKey, addActivity } = useAppStore();

  const [prospectName, setProspectName] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [valueProp, setValueProp] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [progress, setProgress] = useState(0);

  const parseEmailSequence = (content: string): Email[] => {
    const emailRegex = /## Email (\d+).*?\n(?:Subject: (.*?)\n)?(.*?)(?=## Email \d+|$)/gs;
    const parsedEmails: Email[] = [];
    let match;

    while ((match = emailRegex.exec(content)) !== null) {
      const number = parseInt(match[1]);
      const lines = match[3].trim().split('\n');
      
      let subject = match[2] || '';
      let body = '';
      let timing = '';

      for (const line of lines) {
        if (line.startsWith('Subject:')) {
          subject = line.replace('Subject:', '').trim();
        } else if (line.startsWith('Body:') || line.startsWith('Email Body:')) {
          body = line.replace(/^(Body:|Email Body:)/, '').trim();
        } else if (line.startsWith('Timing:')) {
          timing = line.replace('Timing:', '').trim();
        } else if (!line.startsWith('##') && line.trim()) {
          if (!body && !subject) {
            subject = line;
          } else {
            body += (body ? '\n' : '') + line;
          }
        }
      }

      parsedEmails.push({
        number,
        subject: subject.replace(/^["']|["']$/g, ''),
        body: body.trim(),
        timing: timing || `Day ${number * 2 + 1}`,
      });
    }

    return parsedEmails.length > 0 ? parsedEmails : [{
      number: 1,
      subject: 'Sequence',
      body: content,
      timing: 'Day 1'
    }];
  };

  const handleGenerate = async () => {
    if (!prospectName || !company || !industry || !valueProp || !goal) {
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
    setEmails([]);

    addActivity({
      agent: 'outreach',
      title: `Creating outreach sequence for ${prospectName}`,
      status: 'in-progress',
    });

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 1200);

      const sequence = await generateOutreachSequence(
        groqApiKey,
        prospectName,
        company,
        industry,
        valueProp,
        goal
      );

      clearInterval(progressInterval);
      setProgress(100);

      const parsedEmails = parseEmailSequence(sequence);
      setEmails(parsedEmails);

      addActivity({
        agent: 'outreach',
        title: `Email sequence created for ${prospectName}`,
        status: 'completed',
      });

      toast.success('Outreach sequence generated!');
    } catch (error: any) {
      console.error('Error generating outreach:', error);
      addActivity({
        agent: 'outreach',
        title: `Failed to create sequence for ${prospectName}`,
        status: 'failed',
      });
      toast.error(error.message || 'Failed to generate outreach sequence');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleCopyEmail = (email: Email) => {
    const text = `Subject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(text);
    toast.success('Email copied to clipboard');
  };

  const handleCopyAll = () => {
    const text = emails.map(email => 
      `Email ${email.number} - ${email.timing}\nSubject: ${email.subject}\n\n${email.body}\n\n---\n`
    ).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('All emails copied to clipboard');
  };

  const handleDownload = () => {
    const text = emails.map(email => 
      `Email ${email.number} - ${email.timing}\nSubject: ${email.subject}\n\n${email.body}\n\n${'='.repeat(50)}\n`
    ).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prospectName}-outreach-sequence.txt`;
    a.click();
    toast.success('Downloaded successfully');
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
            <span className="text-2xl">📧</span>
          </div>
          <h1 className="text-3xl font-bold">Outreach Agent</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <h2 className="mb-6 text-xl font-semibold">Outreach Parameters</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="prospectName">Prospect Name *</Label>
                  <Input
                    id="prospectName"
                    placeholder="John Doe"
                    value={prospectName}
                    onChange={(e) => setProspectName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    placeholder="Acme Corp"
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
                  <Label htmlFor="valueProp">Your Value Proposition *</Label>
                  <Textarea
                    id="valueProp"
                    placeholder="What value do you offer? How can you help them?"
                    value={valueProp}
                    onChange={(e) => setValueProp(e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="goal">Campaign Goal *</Label>
                  <Select value={goal} onValueChange={setGoal} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {goals.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
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
                  {loading ? 'Generating...' : 'Generate Email Sequence'}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass-card rounded-xl p-6 min-h-[600px]">
              {!emails.length && !loading && (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="max-w-md">
                    <div className="mb-4 text-6xl">📧</div>
                    <h3 className="mb-2 text-xl font-semibold">Ready to Reach Out</h3>
                    <p className="text-muted-foreground">
                      Fill in the form and click Generate to create your email sequence
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
                    {progress < 33 ? 'Crafting email sequence...' :
                     progress < 66 ? 'Personalizing messages...' :
                     'Finalizing emails...'}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Estimated time: 35 seconds
                  </p>
                </div>
              )}

              {emails.length > 0 && (
                <div className="animate-fade-in space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={handleCopyAll} variant="outline" size="sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy All
                    </Button>
                    <Button onClick={handleDownload} variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {emails.map((email) => (
                      <Card key={email.number} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">Email {email.number}</h4>
                            <p className="text-xs text-muted-foreground">{email.timing}</p>
                          </div>
                          <Button
                            onClick={() => handleCopyEmail(email)}
                            variant="ghost"
                            size="sm"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Subject</Label>
                            <p className="font-medium">{email.subject}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Body</Label>
                            <div className="prose prose-sm max-w-none dark:prose-invert mt-1">
                              <ReactMarkdown>{email.body}</ReactMarkdown>
                            </div>
                          </div>
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
