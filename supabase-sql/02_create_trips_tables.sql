-- 旅行プラン関連テーブルの作成

-- 旅行プランテーブル
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

-- 日別スケジュールテーブル
CREATE TABLE IF NOT EXISTS day_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_schedule_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- アクティビティテーブル
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

-- いいねテーブル
CREATE TABLE IF NOT EXISTS trip_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_schedule_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, trip_schedule_id)
);

-- コメントテーブル
CREATE TABLE IF NOT EXISTS trip_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_schedule_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ブックマークテーブル
CREATE TABLE IF NOT EXISTS trip_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_schedule_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, trip_schedule_id)
);

-- RLS (Row Level Security) ポリシーの設定

-- trip_schedules のRLS
ALTER TABLE trip_schedules ENABLE ROW LEVEL SECURITY;

-- 公開されている旅行プランは誰でも閲覧可能
CREATE POLICY "Anyone can view public trip schedules" ON trip_schedules
  FOR SELECT USING (is_public = true);

-- 自分の旅行プランは閲覧・編集可能
CREATE POLICY "Users can view own trip schedules" ON trip_schedules
  FOR ALL USING (auth.uid() = user_id);

-- 認証済みユーザーは旅行プランを作成可能
CREATE POLICY "Authenticated users can insert trip schedules" ON trip_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- day_schedules のRLS
ALTER TABLE day_schedules ENABLE ROW LEVEL SECURITY;

-- 公開されている旅行プランの日別スケジュールは誰でも閲覧可能
CREATE POLICY "Anyone can view public day schedules" ON day_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = day_schedules.trip_schedule_id
      AND trip_schedules.is_public = true
    )
  );

-- 自分の旅行プランの日別スケジュールは操作可能
CREATE POLICY "Users can manage own day schedules" ON day_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = day_schedules.trip_schedule_id
      AND trip_schedules.user_id = auth.uid()
    )
  );

-- activities のRLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 公開されている旅行プランのアクティビティは誰でも閲覧可能
CREATE POLICY "Anyone can view public activities" ON activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM day_schedules ds
      JOIN trip_schedules ts ON ts.id = ds.trip_schedule_id
      WHERE ds.id = activities.day_schedule_id
      AND ts.is_public = true
    )
  );

-- 自分の旅行プランのアクティビティは操作可能
CREATE POLICY "Users can manage own activities" ON activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM day_schedules ds
      JOIN trip_schedules ts ON ts.id = ds.trip_schedule_id
      WHERE ds.id = activities.day_schedule_id
      AND ts.user_id = auth.uid()
    )
  );

-- trip_likes のRLS
ALTER TABLE trip_likes ENABLE ROW LEVEL SECURITY;

-- いいねは誰でも閲覧可能
CREATE POLICY "Anyone can view trip likes" ON trip_likes
  FOR SELECT USING (true);

-- 認証済みユーザーは自分のいいねを管理可能
CREATE POLICY "Users can manage own trip likes" ON trip_likes
  FOR ALL USING (auth.uid() = user_id);

-- trip_comments のRLS
ALTER TABLE trip_comments ENABLE ROW LEVEL SECURITY;

-- コメントは誰でも閲覧可能
CREATE POLICY "Anyone can view trip comments" ON trip_comments
  FOR SELECT USING (true);

-- 認証済みユーザーはコメントを投稿可能
CREATE POLICY "Authenticated users can insert trip comments" ON trip_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自分のコメントは編集・削除可能
CREATE POLICY "Users can manage own trip comments" ON trip_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trip comments" ON trip_comments
  FOR DELETE USING (auth.uid() = user_id);

-- trip_bookmarks のRLS
ALTER TABLE trip_bookmarks ENABLE ROW LEVEL SECURITY;

-- 自分のブックマークのみ閲覧・管理可能
CREATE POLICY "Users can manage own trip bookmarks" ON trip_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- 更新日時の自動更新トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新日時の自動更新トリガー
CREATE TRIGGER update_trip_schedules_updated_at
  BEFORE UPDATE ON trip_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_day_schedules_updated_at
  BEFORE UPDATE ON day_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trip_comments_updated_at
  BEFORE UPDATE ON trip_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- インデックスの作成
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