-- Create missing tables for the trip sharing application
-- Execute this in the Supabase SQL Editor

-- Create trip_schedules table if it doesn't exist
CREATE TABLE IF NOT EXISTS trip_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cover_image TEXT,
  category TEXT NOT NULL,
  traveler_count INTEGER DEFAULT 1,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create day_schedules table if it doesn't exist
CREATE TABLE IF NOT EXISTS day_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_schedule_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_schedule_id UUID NOT NULL REFERENCES day_schedules(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'activity',
  location TEXT,
  description TEXT,
  duration TEXT,
  images JSONB DEFAULT '[]',
  cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trip_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS trip_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_schedule_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, trip_schedule_id)
);

-- Create trip_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS trip_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_schedule_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trip_bookmarks table if it doesn't exist
CREATE TABLE IF NOT EXISTS trip_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_schedule_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, trip_schedule_id)
);

-- Enable RLS on all tables
ALTER TABLE trip_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trip_schedules
DROP POLICY IF EXISTS "Anyone can view public trip schedules" ON trip_schedules;
CREATE POLICY "Anyone can view public trip schedules" ON trip_schedules
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view own trip schedules" ON trip_schedules;
CREATE POLICY "Users can view own trip schedules" ON trip_schedules
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert trip schedules" ON trip_schedules;
CREATE POLICY "Authenticated users can insert trip schedules" ON trip_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for day_schedules
DROP POLICY IF EXISTS "Anyone can view public day schedules" ON day_schedules;
CREATE POLICY "Anyone can view public day schedules" ON day_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = day_schedules.trip_schedule_id
      AND trip_schedules.is_public = true
    )
  );

DROP POLICY IF EXISTS "Users can manage own day schedules" ON day_schedules;
CREATE POLICY "Users can manage own day schedules" ON day_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = day_schedules.trip_schedule_id
      AND trip_schedules.user_id = auth.uid()
    )
  );

-- RLS Policies for activities
DROP POLICY IF EXISTS "Anyone can view public activities" ON activities;
CREATE POLICY "Anyone can view public activities" ON activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM day_schedules ds
      JOIN trip_schedules ts ON ts.id = ds.trip_schedule_id
      WHERE ds.id = activities.day_schedule_id
      AND ts.is_public = true
    )
  );

DROP POLICY IF EXISTS "Users can manage own activities" ON activities;
CREATE POLICY "Users can manage own activities" ON activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM day_schedules ds
      JOIN trip_schedules ts ON ts.id = ds.trip_schedule_id
      WHERE ds.id = activities.day_schedule_id
      AND ts.user_id = auth.uid()
    )
  );

-- RLS Policies for trip_likes (FIXED POLICIES)
DROP POLICY IF EXISTS "Anyone can view trip likes" ON trip_likes;
DROP POLICY IF EXISTS "Users can manage own trip likes" ON trip_likes;
DROP POLICY IF EXISTS "Anyone can view likes on public trips" ON trip_likes;
DROP POLICY IF EXISTS "Users can view their own likes" ON trip_likes;
DROP POLICY IF EXISTS "Authenticated users can like public trips" ON trip_likes;
DROP POLICY IF EXISTS "Users can unlike trips they liked" ON trip_likes;

-- Allow viewing likes on public trips
CREATE POLICY "Anyone can view likes on public trips" ON trip_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = trip_likes.trip_schedule_id
      AND trip_schedules.is_public = true
    )
  );

-- Allow users to view their own likes (THIS WAS MISSING!)
CREATE POLICY "Users can view their own likes" ON trip_likes
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to like public trips
CREATE POLICY "Authenticated users can like public trips" ON trip_likes
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = trip_likes.trip_schedule_id
      AND trip_schedules.is_public = true
    )
  );

-- Allow users to unlike trips they liked
CREATE POLICY "Users can unlike trips they liked" ON trip_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for trip_comments
DROP POLICY IF EXISTS "Anyone can view trip comments" ON trip_comments;
CREATE POLICY "Anyone can view trip comments" ON trip_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = trip_comments.trip_schedule_id
      AND trip_schedules.is_public = true
    )
  );

DROP POLICY IF EXISTS "Authenticated users can insert trip comments" ON trip_comments;
CREATE POLICY "Authenticated users can insert trip comments" ON trip_comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = trip_comments.trip_schedule_id
      AND trip_schedules.is_public = true
    )
  );

DROP POLICY IF EXISTS "Users can manage own trip comments" ON trip_comments;
CREATE POLICY "Users can manage own trip comments" ON trip_comments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own trip comments" ON trip_comments;
CREATE POLICY "Users can delete own trip comments" ON trip_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for trip_bookmarks
DROP POLICY IF EXISTS "Users can manage own trip bookmarks" ON trip_bookmarks;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON trip_bookmarks;
DROP POLICY IF EXISTS "Users can bookmark public trips" ON trip_bookmarks;
DROP POLICY IF EXISTS "Users can remove their own bookmarks" ON trip_bookmarks;

-- Allow users to view their own bookmarks
CREATE POLICY "Users can view their own bookmarks" ON trip_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to bookmark public trips
CREATE POLICY "Users can bookmark public trips" ON trip_bookmarks
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = trip_bookmarks.trip_schedule_id
      AND trip_schedules.is_public = true
    )
  );

-- Allow users to remove their own bookmarks
CREATE POLICY "Users can remove their own bookmarks" ON trip_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create update triggers
DROP TRIGGER IF EXISTS update_trip_schedules_updated_at ON trip_schedules;
CREATE TRIGGER update_trip_schedules_updated_at
  BEFORE UPDATE ON trip_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_day_schedules_updated_at ON day_schedules;
CREATE TRIGGER update_day_schedules_updated_at
  BEFORE UPDATE ON day_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trip_comments_updated_at ON trip_comments;
CREATE TRIGGER update_trip_comments_updated_at
  BEFORE UPDATE ON trip_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trip_schedules_user_id ON trip_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_schedules_is_public ON trip_schedules(is_public);
CREATE INDEX IF NOT EXISTS idx_trip_schedules_category ON trip_schedules(category);
CREATE INDEX IF NOT EXISTS idx_trip_schedules_created_at ON trip_schedules(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_day_schedules_trip_id ON day_schedules(trip_schedule_id);
CREATE INDEX IF NOT EXISTS idx_day_schedules_day_number ON day_schedules(day_number);

CREATE INDEX IF NOT EXISTS idx_activities_day_schedule_id ON activities(day_schedule_id);

CREATE INDEX IF NOT EXISTS idx_trip_likes_trip_id ON trip_likes(trip_schedule_id);
CREATE INDEX IF NOT EXISTS idx_trip_likes_user_id ON trip_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_trip_comments_trip_id ON trip_comments(trip_schedule_id);
CREATE INDEX IF NOT EXISTS idx_trip_comments_user_id ON trip_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_trip_bookmarks_trip_id ON trip_bookmarks(trip_schedule_id);
CREATE INDEX IF NOT EXISTS idx_trip_bookmarks_user_id ON trip_bookmarks(user_id);

-- Verify the tables and policies were created
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
WHERE tablename IN ('trip_schedules', 'trip_likes', 'trip_comments', 'trip_bookmarks', 'day_schedules', 'activities')
ORDER BY tablename, policyname;