-- パフォーマンス最適化: auth関数を(select auth.xxx())形式に変更
-- 重複RLSポリシーを統合

-- ============================================================
-- profiles テーブル
-- ============================================================
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id);

-- ============================================================
-- trip_schedules テーブル
-- ============================================================
DROP POLICY IF EXISTS "Users can view own trip schedules" ON trip_schedules;
DROP POLICY IF EXISTS "Authenticated users can insert trip schedules" ON trip_schedules;

CREATE POLICY "Users can view own trip schedules" ON trip_schedules
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Authenticated users can insert trip schedules" ON trip_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- day_schedules テーブル
-- ============================================================
DROP POLICY IF EXISTS "Users can manage own day schedules" ON day_schedules;

CREATE POLICY "Users can manage own day schedules" ON day_schedules
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trip_schedules
    WHERE trip_schedules.id = day_schedules.trip_schedule_id
    AND trip_schedules.user_id = (select auth.uid())
  ));

-- ============================================================
-- activities テーブル
-- ============================================================
DROP POLICY IF EXISTS "Users can manage own activities" ON activities;

CREATE POLICY "Users can manage own activities" ON activities
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM day_schedules ds
    JOIN trip_schedules ts ON ts.id = ds.trip_schedule_id
    WHERE ds.id = activities.day_schedule_id
    AND ts.user_id = (select auth.uid())
  ));

-- ============================================================
-- trip_comments テーブル - 重複ポリシーを統合
-- ============================================================
DROP POLICY IF EXISTS "Users can delete own trip comments" ON trip_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON trip_comments;
DROP POLICY IF EXISTS "Authenticated users can comment on public trips" ON trip_comments;
DROP POLICY IF EXISTS "Authenticated users can insert trip comments" ON trip_comments;
DROP POLICY IF EXISTS "Allow all to view comments" ON trip_comments;
DROP POLICY IF EXISTS "Anyone can view trip comments" ON trip_comments;
DROP POLICY IF EXISTS "Users can manage own trip comments" ON trip_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON trip_comments;

CREATE POLICY "Users can delete their own comments" ON trip_comments
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Authenticated users can insert trip comments" ON trip_comments
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Anyone can view trip comments" ON trip_comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update their own comments" ON trip_comments
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- trip_likes テーブル - 重複ポリシーを統合
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can like public trips" ON trip_likes;
DROP POLICY IF EXISTS "Users can unlike trips they liked" ON trip_likes;
DROP POLICY IF EXISTS "Users can view their own likes" ON trip_likes;
DROP POLICY IF EXISTS "Anyone can view likes on public trips" ON trip_likes;

CREATE POLICY "Authenticated users can like public trips" ON trip_likes
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can unlike trips they liked" ON trip_likes
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view likes" ON trip_likes
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM trip_schedules
      WHERE trip_schedules.id = trip_likes.trip_schedule_id
      AND trip_schedules.is_public = true
    )
    OR (select auth.uid()) = user_id
  );

-- ============================================================
-- trip_bookmarks テーブル
-- ============================================================
DROP POLICY IF EXISTS "Users can bookmark public trips" ON trip_bookmarks;
DROP POLICY IF EXISTS "Users can remove their own bookmarks" ON trip_bookmarks;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON trip_bookmarks;

CREATE POLICY "Users can bookmark public trips" ON trip_bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can remove their own bookmarks" ON trip_bookmarks
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own bookmarks" ON trip_bookmarks
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);