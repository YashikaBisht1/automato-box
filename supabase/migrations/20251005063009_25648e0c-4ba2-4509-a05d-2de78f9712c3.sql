-- Knowledge Management Tables

-- Knowledge entries with vector embeddings
CREATE TABLE IF NOT EXISTS public.knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'competitor', 'market_research', 'user_preference', etc.
  source_url TEXT,
  entity_name TEXT, -- Company name, competitor name, etc.
  category TEXT, -- 'pricing', 'features', 'funding', etc.
  confidence_score DECIMAL(3,2) DEFAULT 0.80,
  last_validated_at TIMESTAMPTZ DEFAULT now(),
  is_outdated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- User preferences and learning data
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preference_type TEXT NOT NULL, -- 'tagline_style', 'tone', 'content_format', etc.
  preference_value JSONB NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.50,
  examples JSONB DEFAULT '[]'::jsonb, -- Store successful examples
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent reasoning and decisions log
CREATE TABLE IF NOT EXISTS public.agent_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL, -- 'market-analyst', 'branding', etc.
  decision_context TEXT NOT NULL,
  reasoning_chain JSONB NOT NULL, -- Step-by-step reasoning
  alternatives_considered JSONB, -- Other options evaluated
  sources_used JSONB, -- Knowledge entries referenced
  confidence_score DECIMAL(3,2) DEFAULT 0.80,
  user_feedback TEXT, -- 'positive', 'negative', 'neutral'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Knowledge graph relationships
CREATE TABLE IF NOT EXISTS public.knowledge_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  target_id UUID REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- 'competes_with', 'similar_to', 'contradicts', etc.
  strength DECIMAL(3,2) DEFAULT 0.50,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_entity ON public.knowledge_entries(entity_name);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON public.knowledge_entries(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_outdated ON public.knowledge_entries(is_outdated);
CREATE INDEX IF NOT EXISTS idx_preferences_type ON public.user_preferences(preference_type);
CREATE INDEX IF NOT EXISTS idx_decisions_agent ON public.agent_decisions(agent_type);
CREATE INDEX IF NOT EXISTS idx_decisions_created ON public.agent_decisions(created_at DESC);

-- Enable RLS
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_relationships ENABLE ROW LEVEL SECURITY;

-- Public access policies (for now - can be restricted later)
CREATE POLICY "Allow all access to knowledge_entries" ON public.knowledge_entries FOR ALL USING (true);
CREATE POLICY "Allow all access to user_preferences" ON public.user_preferences FOR ALL USING (true);
CREATE POLICY "Allow all access to agent_decisions" ON public.agent_decisions FOR ALL USING (true);
CREATE POLICY "Allow all access to knowledge_relationships" ON public.knowledge_relationships FOR ALL USING (true);

-- Function to mark knowledge as outdated
CREATE OR REPLACE FUNCTION public.mark_outdated_knowledge()
RETURNS void AS $$
BEGIN
  UPDATE public.knowledge_entries
  SET is_outdated = true
  WHERE last_validated_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_knowledge_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_knowledge_entries_timestamp
  BEFORE UPDATE ON public.knowledge_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_knowledge_timestamp();

CREATE TRIGGER update_user_preferences_timestamp
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_knowledge_timestamp();