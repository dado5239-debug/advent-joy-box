-- Add currency and VIP status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS currency INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;

-- Update existing users to have default currency
UPDATE public.profiles SET currency = 0 WHERE currency IS NULL;
UPDATE public.profiles SET is_vip = false WHERE is_vip IS NULL;