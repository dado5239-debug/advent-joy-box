-- Create songs table for saving generated Christmas songs
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Song',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Users can view their own songs
CREATE POLICY "Users can view their own songs"
ON public.songs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own songs
CREATE POLICY "Users can create their own songs"
ON public.songs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own songs
CREATE POLICY "Users can delete their own songs"
ON public.songs
FOR DELETE
USING (auth.uid() = user_id);