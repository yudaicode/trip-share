-- Fix for trip_likes RLS policy
-- This script adds the missing policy that allows users to view their own likes
-- Execute this in the Supabase SQL Editor

-- Add missing policy: Users can view their own likes
DROP POLICY IF EXISTS "Users can view their own likes" ON trip_likes;
CREATE POLICY "Users can view their own likes" ON trip_likes
    FOR SELECT USING (auth.uid() = user_id);

-- Verify existing policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'trip_likes'
ORDER BY policyname;