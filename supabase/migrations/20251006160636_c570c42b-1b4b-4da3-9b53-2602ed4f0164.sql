-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Conversations table for persistent memory
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_type TEXT NOT NULL,
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vector embeddings table for RAG
CREATE TABLE public.vector_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  metadata JSONB DEFAULT '{}'::jsonb,
  agent_type TEXT NOT NULL,
  entity_name TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vector_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow all access to conversations"
  ON public.conversations
  FOR ALL
  USING (true);

CREATE POLICY "Allow all access to vector_embeddings"
  ON public.vector_embeddings
  FOR ALL
  USING (true);

-- Indexes for performance
CREATE INDEX idx_conversations_agent_type ON public.conversations(agent_type);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX idx_vector_embeddings_agent_type ON public.vector_embeddings(agent_type);
CREATE INDEX idx_vector_embeddings_entity_name ON public.vector_embeddings(entity_name);

-- Vector similarity search index (using cosine distance)
CREATE INDEX idx_vector_embeddings_embedding ON public.vector_embeddings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Trigger for updating conversations timestamp
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_knowledge_timestamp();

-- Function to search similar embeddings
CREATE OR REPLACE FUNCTION public.search_similar_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 3,
  filter_agent_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vector_embeddings.id,
    vector_embeddings.content,
    vector_embeddings.metadata,
    1 - (vector_embeddings.embedding <=> query_embedding) as similarity
  FROM vector_embeddings
  WHERE 
    (filter_agent_type IS NULL OR vector_embeddings.agent_type = filter_agent_type)
    AND 1 - (vector_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY vector_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;