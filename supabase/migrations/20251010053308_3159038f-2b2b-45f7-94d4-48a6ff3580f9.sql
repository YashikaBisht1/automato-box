-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies - users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'display_name'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id column to conversations table
ALTER TABLE public.conversations ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to user_preferences table
ALTER TABLE public.user_preferences ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to agent_decisions table
ALTER TABLE public.agent_decisions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to knowledge_entries table
ALTER TABLE public.knowledge_entries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to knowledge_relationships table
ALTER TABLE public.knowledge_relationships ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to vector_embeddings table
ALTER TABLE public.vector_embeddings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing public policies and create secure ones for conversations
DROP POLICY IF EXISTS "Allow all access to conversations" ON public.conversations;

CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Update user_preferences policies
DROP POLICY IF EXISTS "Allow all access to user_preferences" ON public.user_preferences;

CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON public.user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Update agent_decisions policies
DROP POLICY IF EXISTS "Allow all access to agent_decisions" ON public.agent_decisions;

CREATE POLICY "Users can view their own decisions"
  ON public.agent_decisions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decisions"
  ON public.agent_decisions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decisions"
  ON public.agent_decisions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decisions"
  ON public.agent_decisions FOR DELETE
  USING (auth.uid() = user_id);

-- Update knowledge_entries policies
DROP POLICY IF EXISTS "Allow all access to knowledge_entries" ON public.knowledge_entries;

CREATE POLICY "Users can view their own knowledge entries"
  ON public.knowledge_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own knowledge entries"
  ON public.knowledge_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge entries"
  ON public.knowledge_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge entries"
  ON public.knowledge_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Update knowledge_relationships policies
DROP POLICY IF EXISTS "Allow all access to knowledge_relationships" ON public.knowledge_relationships;

CREATE POLICY "Users can view their own knowledge relationships"
  ON public.knowledge_relationships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own knowledge relationships"
  ON public.knowledge_relationships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge relationships"
  ON public.knowledge_relationships FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge relationships"
  ON public.knowledge_relationships FOR DELETE
  USING (auth.uid() = user_id);

-- Update vector_embeddings policies
DROP POLICY IF EXISTS "Allow all access to vector_embeddings" ON public.vector_embeddings;

CREATE POLICY "Users can view their own embeddings"
  ON public.vector_embeddings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own embeddings"
  ON public.vector_embeddings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own embeddings"
  ON public.vector_embeddings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own embeddings"
  ON public.vector_embeddings FOR DELETE
  USING (auth.uid() = user_id);