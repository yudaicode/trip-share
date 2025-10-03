-- NextAuth user IDとSupabase UUIDの型不一致を修正
-- user_idカラムをUUID型からTEXT型に変更

-- 1. trip_schedulesテーブル
ALTER TABLE trip_schedules
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 2. trip_likesテーブル
ALTER TABLE trip_likes
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 3. trip_commentsテーブル
ALTER TABLE trip_comments
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 4. bookmarksテーブル
ALTER TABLE bookmarks
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 5. profilesテーブル
ALTER TABLE profiles
  ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- インデックスも再作成（パフォーマンスのため）
CREATE INDEX IF NOT EXISTS idx_trip_schedules_user_id ON trip_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_likes_user_id ON trip_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_comments_user_id ON trip_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
