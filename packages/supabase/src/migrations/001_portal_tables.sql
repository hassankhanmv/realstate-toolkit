-- ============================================================
-- Portal Tables Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (buyer_id, property_id)
);

-- 2. User Action Logs table
CREATE TABLE IF NOT EXISTS public.user_action_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('search', 'filter', 'save', 'inquire', 'view')),
  details jsonb DEFAULT '{}'::jsonb,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Composite index for fast analytic queries
CREATE INDEX IF NOT EXISTS idx_user_action_logs_type_created
  ON public.user_action_logs (action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_action_logs_user
  ON public.user_action_logs (user_id, created_at DESC);

-- ============================================================
-- RLS Policies
-- ============================================================

-- Favorites RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY "Users can insert their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE
  USING (buyer_id = auth.uid());

-- User Action Logs RLS
ALTER TABLE public.user_action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own action logs"
  ON public.user_action_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own action logs"
  ON public.user_action_logs FOR SELECT
  USING (user_id = auth.uid());
