CREATE TABLE public.pieces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  category TEXT,
  condition TEXT NOT NULL,
  reason_not_worn TEXT NOT NULL,
  preferences TEXT[] NOT NULL DEFAULT '{}',
  rewear_score INTEGER NOT NULL DEFAULT 0,
  repair_score INTEGER NOT NULL DEFAULT 0,
  upcycle_score INTEGER NOT NULL DEFAULT 0,
  resell_score INTEGER NOT NULL DEFAULT 0,
  donate_score INTEGER NOT NULL DEFAULT 0,
  recycle_score INTEGER NOT NULL DEFAULT 0,
  best_recommendation TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pieces TO authenticated;
GRANT ALL ON public.pieces TO service_role;

ALTER TABLE public.pieces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pieces" ON public.pieces FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pieces" ON public.pieces FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pieces" ON public.pieces FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pieces" ON public.pieces FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX pieces_user_created_idx ON public.pieces (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_pieces_updated_at BEFORE UPDATE ON public.pieces
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();