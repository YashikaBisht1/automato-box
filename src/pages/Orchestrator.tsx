import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { analyzeIntent, decomposeTask, TaskAnalysis, AgentType } from '@/lib/orchestrator';
import { Brain, Zap, Target, Clock, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Orchestrator() {
  const { groqApiKey, deductCredit, addActivity } = useAppStore();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [analysis, setAnalysis] = useState<TaskAnalysis | null>(null);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [currentAgent, setCurrentAgent] = useState<AgentType | null>(null);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = async () => {
    if (!groqApiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please add your Groq API key in Settings.',
        variant: 'destructive',
      });
      return;
    }

    if (!input.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please describe what you need help with.',
        variant: 'destructive',
      });
      return;
    }

    if (!deductCredit()) {
      toast({
        title: 'No Credits',
        description: 'You have run out of credits.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    setSubtasks([]);

    try {
      const result = await analyzeIntent(groqApiKey, input);
      setAnalysis(result);

      // If complex, decompose into subtasks
      if (result.complexity === 'complex') {
        const tasks = await decomposeTask(groqApiKey, input);
        setSubtasks(tasks);
      }

      addActivity({
        agent: 'Smart Router',
        title: 'Analyzed task intent',
        status: 'completed',
      });

      toast({
        title: 'Analysis Complete',
        description: `Found ${result.recommendedAgents.length} agents to help with this task.`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze task',
        variant: 'destructive',
      });
      addActivity({
        agent: 'Smart Router',
        title: 'Task analysis failed',
        status: 'failed',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecute = async () => {
    if (!analysis) return;

    setIsExecuting(true);
    setProgress(0);

    try {
      const totalAgents = analysis.recommendedAgents.length;
      
      for (let i = 0; i < totalAgents; i++) {
        const agent = analysis.recommendedAgents[i];
        setCurrentAgent(agent);
        setProgress(((i + 1) / totalAgents) * 100);
        
        // Simulate agent execution (replace with actual agent calls)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        addActivity({
          agent: agent,
          title: `Executed ${agent}`,
          status: 'completed',
        });
      }

      toast({
        title: 'Workflow Complete',
        description: 'All agents have finished processing your request.',
      });
    } catch (error) {
      toast({
        title: 'Execution Failed',
        description: error instanceof Error ? error.message : 'Workflow failed',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
      setCurrentAgent(null);
      setProgress(0);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'complex': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const agentLabels: Record<AgentType, string> = {
    'market-analyst': 'Market Analyst',
    'branding': 'Branding',
    'content': 'Content',
    'outreach': 'Outreach',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Orchestrator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Describe your goal and I'll automatically route to the best agents
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What do you need help with?</CardTitle>
            <CardDescription>
              Describe your task and the orchestrator will analyze it and coordinate the right agents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="E.g., 'I need help competing with Shopify' or 'Create a complete go-to-market strategy for my SaaS product'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input.trim()}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Task
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Intent</p>
                  <p className="text-base">{analysis.intent}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Complexity</p>
                  <Badge className={getComplexityColor(analysis.complexity)}>
                    {analysis.complexity}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                  <div className="flex items-center gap-2">
                    <Progress value={analysis.confidence} className="flex-1" />
                    <span className="text-sm font-medium">{analysis.confidence}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Estimated Time
                  </p>
                  <p className="text-base">{analysis.estimatedTime}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Recommended Agents</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.recommendedAgents.map((agent) => (
                    <Badge key={agent} variant="secondary">
                      {agentLabels[agent]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Suggested Workflow</p>
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>{analysis.suggestedWorkflow}</AlertDescription>
                </Alert>
              </div>

              {subtasks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Task Breakdown</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {subtasks.map((task, idx) => (
                      <li key={idx}>{task}</li>
                    ))}
                  </ol>
                </div>
              )}

              <Button
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full"
                size="lg"
              >
                {isExecuting ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Executing Workflow...
                  </>
                ) : (
                  'Execute Workflow'
                )}
              </Button>

              {isExecuting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                  {currentAgent && (
                    <p className="text-sm text-muted-foreground">
                      Currently running: {agentLabels[currentAgent]}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
