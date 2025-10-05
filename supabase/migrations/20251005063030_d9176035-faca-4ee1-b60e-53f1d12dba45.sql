-- Fix search_path for security functions with CASCADE

DROP FUNCTION IF EXISTS public.mark_outdated_knowledge();
CREATE OR REPLACE FUNCTION public.mark_outdated_knowledge()
RETURNS void AS $$
BEGIN
  UPDATE public.knowledge_entries
  SET is_outdated = true
  WHERE last_validated_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP FUNCTION IF EXISTS public.update_knowledge_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION public.update_knowledge_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate triggers
CREATE TRIGGER update_knowledge_entries_timestamp
  BEFORE UPDATE ON public.knowledge_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_knowledge_timestamp();

CREATE TRIGGER update_user_preferences_timestamp
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_knowledge_timestamp();