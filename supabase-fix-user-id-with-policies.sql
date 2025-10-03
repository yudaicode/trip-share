-- Step 1: すべてのRLSポリシーを一時的に削除
DROP POLICY IF EXISTS "Users can view own trip schedules" ON trip_schedules;
DROP POLICY IF EXISTS "Users can insert own trip schedules" ON trip_schedules;
DROP POLICY IF EXISTS "Users can update own trip schedules" ON trip_schedules;
DROP POLICY IF EXISTS "Users can delete own trip schedules" ON trip_schedules;
DROP POLICY IF EXISTS "Public trip schedules are viewable by everyone" ON trip_schedules;

DROP POLICY IF EXISTS "Users can view all likes" ON trip_likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON trip_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON trip_likes;

DROP POLICY IF EXISTS "Users can view all comments" ON trip_comments;
DROP POLICY IF EXISTS "Users can insert own comments" ON trip_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON trip_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON trip_comments;

DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Step 2: user_idカラムの型をUUIDからTEXTに変更
ALTER TABLE trip_schedules ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE trip_likes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE trip_comments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE bookmarks ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Step 3: インデックスを再作成
DROP INDEX IF EXISTS idx_trip_schedules_user_id;
DROP INDEX IF EXISTS idx_trip_likes_user_id;
DROP INDEX IF EXISTS idx_trip_comments_user_id;
DROP INDEX IF EXISTS idx_bookmarks_user_id;

CREATE INDEX idx_trip_schedules_user_id ON trip_schedules(user_id);
CREATE INDEX idx_trip_likes_user_id ON trip_likes(user_id);
CREATE INDEX idx_trip_comments_user_id ON trip_comments(user_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- Step 4: RLSポリシーを再作成（TEXT型で動作するように）

-- trip_schedules ポリシー
CREATE POLICY "Users can view own trip schedules"
  ON trip_schedules FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert own trip schedules"
  ON trip_schedules FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update own trip schedules"
  ON trip_schedules FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete own trip schedules"
  ON trip_schedules FOR DELETE
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Public trip schedules are viewable by everyone"
  ON trip_schedules FOR SELECT
  USING (is_public = true);

-- trip_likes ポリシー
CREATE POLICY "Users can view all likes"
  ON trip_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own likes"
  ON trip_likes FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete own likes"
  ON trip_likes FOR DELETE
  USING (auth.uid()::TEXT = user_id);

-- trip_comments ポリシー
CREATE POLICY "Users can view all comments"
  ON trip_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON trip_comments FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update own comments"
  ON trip_comments FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete own comments"
  ON trip_comments FOR DELETE
  USING (auth.uid()::TEXT = user_id);

-- bookmarks ポリシー
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid()::TEXT = user_id);

-- profiles ポリシー
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid()::TEXT = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::TEXT = id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);
