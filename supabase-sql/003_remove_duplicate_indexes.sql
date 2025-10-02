-- 重複インデックスを削除してパフォーマンスを改善

-- ============================================================
-- trip_comments テーブルの重複インデックス削除
-- ============================================================

-- trip_schedule_id の重複インデックスを削除（外部キー制約の自動インデックスを残す）
DROP INDEX IF EXISTS idx_trip_comments_trip_id;

-- user_id の重複インデックスを削除（外部キー制約の自動インデックスを残す）
DROP INDEX IF EXISTS idx_trip_comments_user_id;