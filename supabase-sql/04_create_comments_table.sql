-- コメントテーブルを作成
CREATE TABLE IF NOT EXISTS trip_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_schedule_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS trip_comments_trip_schedule_id_idx ON trip_comments(trip_schedule_id);
CREATE INDEX IF NOT EXISTS trip_comments_user_id_idx ON trip_comments(user_id);
CREATE INDEX IF NOT EXISTS trip_comments_created_at_idx ON trip_comments(created_at DESC);

-- updated_at自動更新のトリガーを作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trip_comments_updated_at
    BEFORE UPDATE ON trip_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();