-- RLSポリシーを設定して再有効化

-- trip_comments テーブルのRLSを有効化
ALTER TABLE trip_comments ENABLE ROW LEVEL SECURITY;

-- コメント閲覧ポリシー（全員が公開された旅行プランのコメントを閲覧可能）
CREATE POLICY "Anyone can view comments on public trips" ON trip_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trip_schedules
            WHERE trip_schedules.id = trip_comments.trip_schedule_id
            AND trip_schedules.is_public = true
        )
    );

-- コメント投稿ポリシー（認証されたユーザーが公開された旅行プランにコメント可能）
CREATE POLICY "Authenticated users can comment on public trips" ON trip_comments
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM trip_schedules
            WHERE trip_schedules.id = trip_comments.trip_schedule_id
            AND trip_schedules.is_public = true
        )
    );

-- 自分のコメント更新ポリシー
CREATE POLICY "Users can update their own comments" ON trip_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- 自分のコメント削除ポリシー
CREATE POLICY "Users can delete their own comments" ON trip_comments
    FOR DELETE USING (auth.uid() = user_id);

-- trip_schedules のRLSポリシーも確認・更新
-- 公開された旅行プランは全員が閲覧可能
DROP POLICY IF EXISTS "Anyone can view public trips" ON trip_schedules;
CREATE POLICY "Anyone can view public trips" ON trip_schedules
    FOR SELECT USING (is_public = true);

-- 認証されたユーザーは自分の旅行プランを閲覧可能
DROP POLICY IF EXISTS "Users can view their own trips" ON trip_schedules;
CREATE POLICY "Users can view their own trips" ON trip_schedules
    FOR SELECT USING (auth.uid() = user_id);

-- 認証されたユーザーは旅行プランを作成可能
DROP POLICY IF EXISTS "Authenticated users can create trips" ON trip_schedules;
CREATE POLICY "Authenticated users can create trips" ON trip_schedules
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ユーザーは自分の旅行プランを更新可能
DROP POLICY IF EXISTS "Users can update their own trips" ON trip_schedules;
CREATE POLICY "Users can update their own trips" ON trip_schedules
    FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分の旅行プランを削除可能
DROP POLICY IF EXISTS "Users can delete their own trips" ON trip_schedules;
CREATE POLICY "Users can delete their own trips" ON trip_schedules
    FOR DELETE USING (auth.uid() = user_id);

-- day_schedules のRLSポリシー
ALTER TABLE day_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view day schedules of accessible trips" ON day_schedules;
CREATE POLICY "Users can view day schedules of accessible trips" ON day_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trip_schedules
            WHERE trip_schedules.id = day_schedules.trip_schedule_id
            AND (trip_schedules.is_public = true OR trip_schedules.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can manage day schedules of their trips" ON day_schedules;
CREATE POLICY "Users can manage day schedules of their trips" ON day_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM trip_schedules
            WHERE trip_schedules.id = day_schedules.trip_schedule_id
            AND trip_schedules.user_id = auth.uid()
        )
    );

-- activities のRLSポリシー
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view activities of accessible trips" ON activities;
CREATE POLICY "Users can view activities of accessible trips" ON activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM day_schedules
            JOIN trip_schedules ON trip_schedules.id = day_schedules.trip_schedule_id
            WHERE day_schedules.id = activities.day_schedule_id
            AND (trip_schedules.is_public = true OR trip_schedules.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can manage activities of their trips" ON activities;
CREATE POLICY "Users can manage activities of their trips" ON activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM day_schedules
            JOIN trip_schedules ON trip_schedules.id = day_schedules.trip_schedule_id
            WHERE day_schedules.id = activities.day_schedule_id
            AND trip_schedules.user_id = auth.uid()
        )
    );

-- trip_likes のRLSポリシー
ALTER TABLE trip_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view likes on public trips" ON trip_likes;
CREATE POLICY "Anyone can view likes on public trips" ON trip_likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trip_schedules
            WHERE trip_schedules.id = trip_likes.trip_schedule_id
            AND trip_schedules.is_public = true
        )
    );

DROP POLICY IF EXISTS "Users can view their own likes" ON trip_likes;
CREATE POLICY "Users can view their own likes" ON trip_likes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can like public trips" ON trip_likes;
CREATE POLICY "Authenticated users can like public trips" ON trip_likes
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM trip_schedules
            WHERE trip_schedules.id = trip_likes.trip_schedule_id
            AND trip_schedules.is_public = true
        )
    );

DROP POLICY IF EXISTS "Users can unlike trips they liked" ON trip_likes;
CREATE POLICY "Users can unlike trips they liked" ON trip_likes
    FOR DELETE USING (auth.uid() = user_id);

-- trip_bookmarks のRLSポリシー
ALTER TABLE trip_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bookmarks" ON trip_bookmarks;
CREATE POLICY "Users can view their own bookmarks" ON trip_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can bookmark public trips" ON trip_bookmarks;
CREATE POLICY "Users can bookmark public trips" ON trip_bookmarks
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM trip_schedules
            WHERE trip_schedules.id = trip_bookmarks.trip_schedule_id
            AND trip_schedules.is_public = true
        )
    );

DROP POLICY IF EXISTS "Users can remove their own bookmarks" ON trip_bookmarks;
CREATE POLICY "Users can remove their own bookmarks" ON trip_bookmarks
    FOR DELETE USING (auth.uid() = user_id);