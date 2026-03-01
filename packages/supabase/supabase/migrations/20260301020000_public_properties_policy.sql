-- Add public read access for published properties (portal/buyer access)
-- This allows anonymous and authenticated users to see published listings.

CREATE POLICY "Public can view published properties"
ON public.properties
FOR SELECT
TO anon, authenticated
USING (is_published = true);
