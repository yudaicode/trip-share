-- サンプルデータを削除（逆順で削除して外部キー制約を回避）

-- コメントを削除
DELETE FROM trip_comments WHERE user_id IN ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002');

-- いいねを削除
DELETE FROM trip_likes WHERE user_id IN ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002');

-- アクティビティを削除
DELETE FROM activities WHERE day_schedule_id IN (
  SELECT id FROM day_schedules WHERE trip_schedule_id IN (
    SELECT id FROM trip_schedules WHERE user_id IN ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002')
  )
);

-- 日程を削除
DELETE FROM day_schedules WHERE trip_schedule_id IN (
  SELECT id FROM trip_schedules WHERE user_id IN ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002')
);

-- 旅行プランを削除
DELETE FROM trip_schedules WHERE user_id IN ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002');

-- ユーザーを削除
DELETE FROM "User" WHERE email IN ('sample1@example.com', 'sample2@example.com');

-- コメント削除（NextAuth/Prismaテーブル）
DELETE FROM "Comment" WHERE "userId" IN ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002');

-- いいね削除（NextAuth/Prismaテーブル）
DELETE FROM "Like" WHERE "userId" IN ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002');

-- アクティビティ削除（NextAuth/Prismaテーブル）
DELETE FROM "Activity" WHERE "dayScheduleId" IN (
  SELECT id FROM "DaySchedule" WHERE "tripScheduleId" IN (
    SELECT id FROM "TripSchedule" WHERE "userId" IN ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002')
  )
);

-- 日程削除（NextAuth/Prismaテーブル）
DELETE FROM "DaySchedule" WHERE "tripScheduleId" IN (
  SELECT id FROM "TripSchedule" WHERE "userId" IN ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002')
);

-- 旅行プラン削除（NextAuth/Prismaテーブル）
DELETE FROM "TripSchedule" WHERE "userId" IN ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002');
