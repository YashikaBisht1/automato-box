import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wrench, Database, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ConversationSidebar from './ConversationSidebar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ReactMarkdown from 'react-markdown';

interface AgentInterfaceProps {
  agentType: string;
  agentName: string;
  placeholder: string;
}

export default function AgentInterface({ agentType, agentName, placeholder }: AgentInterfaceProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [ragContext, setRagContext] = useState<any>(null);
  const [toolUsage, setToolUsage] = useState<any[]>([]);
  const [memoryStats, setMemoryStats] = useState<any>(null);
  const [enabledTools, setEnabledTools] = useState({
    calculator: true,
    web_search: true,
    data_analyzer: true
  });

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    setOutput('');
    setRagContext(null);
    setToolUsage([]);

    try {
      const { data, error } = await supabase.functions.invoke('rag-agent', {
        body: {
          agent_type: agentType,
          prompt: input,
          conversation_id: conversationId,
          enabled_tools: Object.keys(enabledTools).filter(k => enabledTools[k as keyof typeof enabledTools])
        }
      });

      if (error) throw error;

      setOutput(data.output);
      setConversationId(data.conversation_id);
      setRagContext(data.rag_context);
      setToolUsage(data.tool_usage || []);
      setMemoryStats(data.memory);
      
      toast.success('Generated successfully');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    const content = JSON.stringify({
      agent: agentName,
      input,
      output,
      ragContext,
      toolUsage,
      memory: memoryStats,
      timestamp: new Date().toISOString()
    }, null, 2);

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agentType}-result-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Results downloaded');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-20 pb-12 px-4">
      <ConversationSidebar
        agentType={agentType}
        currentConversationId={conversationId}
        onSelectConversation={setConversationId}
      />

      <div className="max-w-4xl mx-auto ml-96 space-y-6">
        {/* Header with stats */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{agentName}</h1>
          <div className="flex items-center gap-4">
            {memoryStats && (
              <>
                <Badge variant="outline" className="flex items-center gap-2">
                  <Database className="w-3 h-3" />
                  {memoryStats.knowledge_base_size} insights stored
                </Badge>
                <Badge variant="outline">
                  {memoryStats.conversation_length} messages in conversation
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Tool configuration */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Available Tools</h3>
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="calculator"
                checked={enabledTools.calculator}
                onCheckedChange={(checked) => setEnabledTools(prev => ({ ...prev, calculator: checked }))}
              />
              <Label htmlFor="calculator">Calculator</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="web_search"
                checked={enabledTools.web_search}
                onCheckedChange={(checked) => setEnabledTools(prev => ({ ...prev, web_search: checked }))}
              />
              <Label htmlFor="web_search">Web Search</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="data_analyzer"
                checked={enabledTools.data_analyzer}
                onCheckedChange={(checked) => setEnabledTools(prev => ({ ...prev, data_analyzer: checked }))}
              />
              <Label htmlFor="data_analyzer">Data Analyzer</Label>
            </div>
          </div>
        </Card>

        {/* Input */}
        <Card className="p-6">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="min-h-[150px] mb-4"
          />
          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </Button>
        </Card>

        {/* RAG Context Info */}
        {ragContext && ragContext.used_previous_research && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <p className="text-sm font-semibold mb-2">
              📚 Based on previous research ({ragContext.similar_outputs_count} similar insights found)
            </p>
            <div className="space-y-1">
              {ragContext.sources?.map((source: any, i: number) => (
                <p key={i} className="text-xs text-muted-foreground">
                  • {source.content} ({source.similarity}% relevant)
                </p>
              ))}
            </div>
          </Card>
        )}

        {/* Tool Usage */}
        {toolUsage.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Tool Usage
            </h3>
            <div className="space-y-2">
              {toolUsage.map((tool, i) => (
                <div key={i} className="text-sm">
                  <p className="font-medium">🔧 Using {tool.tool}: {tool.input}</p>
                  <p className="text-muted-foreground ml-6">{tool.result}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Output */}
        {output && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Output</h3>
              <Button variant="outline" size="sm" onClick={downloadResults}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
