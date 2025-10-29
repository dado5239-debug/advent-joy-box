-- Create villages table to store Christmas villages
CREATE TABLE public.villages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Village',
  village_data JSONB NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on villages
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;

-- Villages policies - users can CRUD their own, everyone can view
CREATE POLICY "Users can create their own villages"
ON public.villages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all villages"
ON public.villages
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own villages"
ON public.villages
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own villages"
ON public.villages
FOR DELETE
USING (auth.uid() = user_id);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('drawing', 'village')),
  item_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments policies - everyone can view, authenticated users can create their own
CREATE POLICY "Everyone can view comments"
ON public.comments
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
USING (auth.uid() = user_id);

-- Update drawings RLS to allow everyone to view (for live library)
DROP POLICY IF EXISTS "Users can view their own drawings" ON public.drawings;

CREATE POLICY "Everyone can view all drawings"
ON public.drawings
FOR SELECT
USING (true);

-- Add trigger for villages updated_at
CREATE TRIGGER update_villages_updated_at
BEFORE UPDATE ON public.villages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();