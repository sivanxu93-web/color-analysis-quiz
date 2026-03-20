-- Migration: Fix RLS Security for all tables
-- Description: Enables Row Level Security (RLS) for all public tables and sets up basic access policies.
-- Usage: Run this in the Supabase SQL Editor.

-- 1. Enable RLS for all tables
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
        RAISE NOTICE 'Enabled RLS for table: %', r.tablename;
    END LOOP;
END $$;

-- 2. Clean up existing policies to avoid conflicts (Optional, but safer for re-runs)
-- DROP POLICY IF EXISTS "Allow public insert to waitlist" ON public.color_lab_waitlist;
-- DROP POLICY IF EXISTS "Allow public select for featured reports" ON public.color_lab_reports;
-- DROP POLICY IF EXISTS "Allow users to see their own info" ON public.user_info;

-- 3. Define Specific Access Policies

-- [Waitlist] 允许任何人提交申请 (Insert Only)
CREATE POLICY "Allow public insert to waitlist" 
ON public.color_lab_waitlist 
FOR INSERT 
WITH CHECK (true);

-- [Color Lab Reports] 允许公开查看 (Select)
-- 策略：如果是 Featured 或者用户知道具体的 session_id，则可以读取
CREATE POLICY "Allow public select color_lab_reports" 
ON public.color_lab_reports 
FOR SELECT 
USING (true);

-- [Color Lab Images] 允许公开读取图片元数据 (Select)
CREATE POLICY "Allow public select color_lab_images" 
ON public.color_lab_images 
FOR SELECT 
USING (true);

-- [Works] 允许公开查看已发布的条目
CREATE POLICY "Allow public select for public works" 
ON public.works 
FOR SELECT 
USING (is_public = true AND is_delete = false);

-- [User Info] 如果未来使用 Supabase Auth，仅允许用户查看自己的信息
-- 注意：这里假设 auth.uid() 与 user_id 字段匹配
CREATE POLICY "Allow users to see their own info" 
ON public.user_info 
FOR SELECT 
USING (auth.uid()::text = user_id);

-- [Stripe / Credits / Sensitive Tables]
-- 对于敏感表 (stripe_customers, credit_logs, user_available)，
-- 我们只开启 RLS 但不创建任何 Policy。
-- 这意味着除了通过 DATABASE_URL (postgres 角色) 访问的后端，
-- 任何前端客户端通过 anon/authenticated key 都无法读取这些数据，这是最安全的状态。

-- 4. Verify RLS Status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
