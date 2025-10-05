import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Users, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface KnowledgeEntry {
  id: string;
  content: string;
  entity_name: string;
  category: string;
  confidence_score: number;
  created_at: string;
  is_outdated: boolean;
}

interface UserPreference {
  id: string;
  preference_type: string;
  confidence_score: number;
  examples: any;
  created_at: string;
}

interface AgentDecision {
  id: string;
  agent_type: string;
  decision_context: string;
  confidence_score: number;
  user_feedback: string | null;
  created_at: string;
}

export default function KnowledgeBase() {
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [knowledgeRes, preferencesRes, decisionsRes] = await Promise.all([
        supabase.from('knowledge_entries').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('user_preferences').select('*').order('confidence_score', { ascending: false }),
        supabase.from('agent_decisions').select('*').order('created_at', { ascending: false }).limit(20)
      ]);

      setKnowledge(knowledgeRes.data || []);
      setPreferences(preferencesRes.data || []);
      setDecisions(decisionsRes.data || []);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getFeedbackColor = (feedback: string | null) => {
    if (feedback === 'positive') return 'bg-green-500';
    if (feedback === 'negative') return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Knowledge Base
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Explore what the AI has learned and how it makes decisions
          </p>
        </div>

        <Tabs defaultValue="knowledge" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="knowledge">
              <FileText className="w-4 h-4 mr-2" />
              Knowledge
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Users className="w-4 h-4 mr-2" />
              Learned Preferences
            </TabsTrigger>
            <TabsTrigger value="decisions">
              <TrendingUp className="w-4 h-4 mr-2" />
              Decision History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge" className="space-y-4">
            {loading ? (
              <p>Loading knowledge entries...</p>
            ) : knowledge.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No knowledge entries yet. Knowledge will be stored automatically as you use the agents.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {knowledge.map((entry) => (
                  <Card key={entry.id} className={entry.is_outdated ? 'opacity-50' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{entry.entity_name}</CardTitle>
                          <CardDescription>{entry.category}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getConfidenceColor(entry.confidence_score)}>
                            {Math.round(entry.confidence_score * 100)}%
                          </Badge>
                          {entry.is_outdated && <Badge variant="destructive">Outdated</Badge>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{entry.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Added: {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            {loading ? (
              <p>Loading preferences...</p>
            ) : preferences.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No learned preferences yet. Provide feedback on agent outputs to help the system learn your style.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {preferences.map((pref) => (
                  <Card key={pref.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{pref.preference_type}</CardTitle>
                          <CardDescription>
                            Based on {Array.isArray(pref.examples) ? pref.examples.length : 0} examples
                          </CardDescription>
                        </div>
                        <Badge className={getConfidenceColor(pref.confidence_score)}>
                          {Math.round(pref.confidence_score * 100)}% confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Learned: {new Date(pref.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="decisions" className="space-y-4">
            {loading ? (
              <p>Loading decisions...</p>
            ) : decisions.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No decisions logged yet. Use the agents to see their reasoning process here.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {decisions.map((decision) => (
                  <Card key={decision.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg capitalize">{decision.agent_type}</CardTitle>
                          <CardDescription className="mt-1">
                            {decision.decision_context.substring(0, 100)}...
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getConfidenceColor(decision.confidence_score)}>
                            {Math.round(decision.confidence_score * 100)}%
                          </Badge>
                          {decision.user_feedback && (
                            <Badge className={getFeedbackColor(decision.user_feedback)}>
                              {decision.user_feedback}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        {new Date(decision.created_at).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
