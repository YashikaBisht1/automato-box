import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function KnowledgeBase() {
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [knowledgeRes, prefsRes, decisionsRes] = await Promise.all([
        supabase.from('knowledge_entries').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('user_preferences').select('*').order('confidence_score', { ascending: false }),
        supabase.from('agent_decisions').select('*').order('created_at', { ascending: false }).limit(20),
      ]);

      if (knowledgeRes.data) setKnowledge(knowledgeRes.data);
      if (prefsRes.data) setPreferences(prefsRes.data);
      if (decisionsRes.data) setDecisions(decisionsRes.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load knowledge base',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateKnowledge = async (id: string) => {
    await supabase
      .from('knowledge_entries')
      .update({ last_validated_at: new Date().toISOString() })
      .eq('id', id);
    
    fetchData();
    toast({ title: 'Knowledge Validated', description: 'Entry marked as current' });
  };

  const markOutdated = async (id: string) => {
    await supabase
      .from('knowledge_entries')
      .update({ is_outdated: true })
      .eq('id', id);
    
    fetchData();
    toast({ title: 'Marked Outdated', description: 'Entry will no longer be used' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Database className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold">Knowledge Base</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Autonomous knowledge management with intelligent retrieval
          </p>
        </div>

        <Tabs defaultValue="knowledge" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="knowledge">Knowledge Entries</TabsTrigger>
            <TabsTrigger value="preferences">Learned Preferences</TabsTrigger>
            <TabsTrigger value="decisions">Agent Decisions</TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge" className="space-y-4">
            {knowledge.map((entry) => (
              <Card key={entry.id} className={entry.is_outdated ? 'opacity-50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{entry.entity_name || 'Knowledge Entry'}</CardTitle>
                      <CardDescription>
                        {entry.category} • {entry.source_type}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.is_outdated ? 'destructive' : 'default'}>
                        {entry.is_outdated ? 'Outdated' : 'Current'}
                      </Badge>
                      <Badge variant="outline">
                        {(entry.confidence_score * 100).toFixed(0)}% confident
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
                  {entry.source_url && (
                    <a href={entry.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      View Source
                    </a>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => validateKnowledge(entry.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Validate
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => markOutdated(entry.id)}>
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Mark Outdated
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last validated: {new Date(entry.last_validated_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            {preferences.map((pref) => (
              <Card key={pref.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{pref.preference_type}</CardTitle>
                  <CardDescription>
                    Confidence: {(pref.confidence_score * 100).toFixed(0)}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="bg-muted p-3 rounded">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(pref.preference_value, null, 2)}
                    </pre>
                  </div>
                  {pref.examples && pref.examples.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Learned from {pref.examples.length} examples</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="decisions" className="space-y-4">
            {decisions.map((decision) => (
              <Card key={decision.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{decision.agent_type}</CardTitle>
                      <CardDescription className="line-clamp-2">{decision.decision_context}</CardDescription>
                    </div>
                    <Badge variant={
                      decision.user_feedback === 'positive' ? 'default' :
                      decision.user_feedback === 'negative' ? 'destructive' : 'outline'
                    }>
                      {decision.user_feedback || 'No feedback'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {decision.reasoning_chain && decision.reasoning_chain.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Reasoning Chain:</p>
                      <div className="bg-muted p-3 rounded space-y-1">
                        {decision.reasoning_chain.map((step: string, idx: number) => (
                          <p key={idx} className="text-xs">{step}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Brain className="w-3 h-3" />
                    <span>Confidence: {(decision.confidence_score * 100).toFixed(0)}%</span>
                    <span>•</span>
                    <span>{new Date(decision.created_at).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}