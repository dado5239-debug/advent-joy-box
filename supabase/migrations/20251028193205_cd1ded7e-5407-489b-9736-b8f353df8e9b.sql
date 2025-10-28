-- Create storage bucket for drawings
INSERT INTO storage.buckets (id, name, public)
VALUES ('drawings', 'drawings', false);

-- Create drawings metadata table
CREATE TABLE public.drawings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Drawing',
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drawings table
CREATE POLICY "Users can view their own drawings"
ON public.drawings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drawings"
ON public.drawings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drawings"
ON public.drawings
FOR DELETE
USING (auth.uid() = user_id);

-- Storage policies for drawings bucket
CREATE POLICY "Users can view their own drawings"
ON storage.objects
FOR SELECT
USING (bucket_id = 'drawings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own drawings"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'drawings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own drawings"
ON storage.objects
FOR DELETE
USING (bucket_id = 'drawings' AND auth.uid()::text = (storage.foldername(name))[1]);