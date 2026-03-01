-- Migration script to consolidate admin_id/broker_id into company_id
-- We assign the hardcoded UUID as requested for now.

-- 1. Profiles: Rename admin_id to company_id
ALTER TABLE public.profiles RENAME COLUMN admin_id TO company_id;

-- 2. Properties
UPDATE public.properties SET company_id = '13364bb2-d6d1-4b2b-9b18-dca5b5469f3d' WHERE company_id IS NULL;
ALTER TABLE public.properties ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.properties ALTER COLUMN company_id SET DEFAULT '13364bb2-d6d1-4b2b-9b18-dca5b5469f3d';
ALTER TABLE public.properties DROP COLUMN broker_id CASCADE;

-- 3. Leads
UPDATE public.leads SET company_id = '13364bb2-d6d1-4b2b-9b18-dca5b5469f3d' WHERE company_id IS NULL;
ALTER TABLE public.leads ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.leads ALTER COLUMN company_id SET DEFAULT '13364bb2-d6d1-4b2b-9b18-dca5b5469f3d';
ALTER TABLE public.leads DROP COLUMN broker_id CASCADE;

-- 4. Lead Events
-- We drop broker_id and add company_id if needed, but previously they tracked who made the action.
-- If broker_id in lead_events meant "the user who did this", we should keep it but maybe rename to user_id.
-- Let's rename it to user_id to avoid confusion with company_id, as events map to a specific acting user, not just tenant scoping.
ALTER TABLE public.lead_events RENAME COLUMN broker_id TO user_id;

-- 5. Re-create RLS Policies
-- Dropping the columns with CASCADE automatically deleted the old 'Brokers can view/edit' policies.
-- We now establish universal tenant isolation policies based strictly on company_id.
CREATE POLICY "Unified access to properties for company members" ON public.properties
FOR ALL TO authenticated
USING (
  company_id IN (
    SELECT COALESCE(company_id, id) FROM public.profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  company_id IN (
    SELECT COALESCE(company_id, id) FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Unified access to leads for company members" ON public.leads
FOR ALL TO authenticated
USING (
  company_id IN (
    SELECT COALESCE(company_id, id) FROM public.profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  company_id IN (
    SELECT COALESCE(company_id, id) FROM public.profiles WHERE id = auth.uid()
  )
);
