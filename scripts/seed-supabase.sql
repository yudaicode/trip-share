-- サンプルユーザーを作成
INSERT INTO "User" (id, email, name, avatar, bio, location, interests, "isPublic", "createdAt", "updatedAt")
VALUES
  ('sample-user-1', 'sample1@example.com', '田中 太郎', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka', '旅行が大好きです！日本全国を巡っています。', '東京都', '["国内旅行","グルメ","温泉"]', true, NOW(), NOW()),
  ('sample-user-2', 'sample2@example.com', '佐藤 花子', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sato', '海外旅行とカフェ巡りが趣味です。', '大阪府', '["海外旅行","カフェ","写真"]', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- サンプル旅行プラン1: 京都2日間の旅
INSERT INTO "TripSchedule" (id, "userId", title, description, "startDate", "endDate", "coverImage", category, "travelerCount", "isPublic", "createdAt", "updatedAt")
VALUES
  ('trip-1', 'sample-user-1', '京都で歴史と文化を満喫する2日間', '古都京都の魅力を存分に味わう旅。金閣寺、清水寺などの有名寺院を巡り、伝統的な京料理を楽しみます。', '2024-11-15', '2024-11-16', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', '文化・歴史', 2, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 京都旅行の日程
INSERT INTO "DaySchedule" (id, "tripScheduleId", "dayNumber", date, title, "createdAt", "updatedAt")
VALUES
  ('day-1-1', 'trip-1', 1, '2024-11-15', '1日目', NOW(), NOW()),
  ('day-1-2', 'trip-1', 2, '2024-11-16', '2日目', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 京都旅行のアクティビティ（1日目）
INSERT INTO "Activity" (id, "dayScheduleId", time, title, type, location, description, duration, cost, "createdAt", "updatedAt")
VALUES
  ('activity-1-1', 'day-1-1', '09:00', '金閣寺参拝', 'sightseeing', '京都府京都市北区金閣寺町1', '世界遺産の金閣寺を見学。美しい金色の建物と池の景色を楽しむ。', '1時間', 500, NOW(), NOW()),
  ('activity-1-2', 'day-1-1', '12:00', '京料理ランチ', 'meal', '祇園', '老舗の京料理店で季節の懐石料理を堪能。', '1.5時間', 3500, NOW(), NOW()),
  ('activity-1-3', 'day-1-1', '14:00', '清水寺参拝', 'sightseeing', '京都府京都市東山区清水1-294', '清水の舞台から京都市内を一望。', '2時間', 400, NOW(), NOW()),
  ('activity-1-4', 'day-1-1', '18:00', '夕食（錦市場）', 'meal', '錦市場', '京都の台所、錦市場で食べ歩き。', '2時間', 2000, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 京都旅行のアクティビティ（2日目）
INSERT INTO "Activity" (id, "dayScheduleId", time, title, type, location, description, duration, cost, "createdAt", "updatedAt")
VALUES
  ('activity-2-1', 'day-1-2', '09:00', '伏見稲荷大社', 'sightseeing', '京都府京都市伏見区深草薮之内町68', '千本鳥居をくぐって山頂まで登る。', '2.5時間', 0, NOW(), NOW()),
  ('activity-2-2', 'day-1-2', '12:30', 'カフェでランチ', 'meal', '嵐山', '渡月橋近くのカフェで軽食。', '1時間', 1500, NOW(), NOW()),
  ('activity-2-3', 'day-1-2', '14:00', '竹林の小径散策', 'activity', '嵐山', '嵐山の竹林を散策。写真撮影スポットとしても人気。', '1時間', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- サンプル旅行プラン2: 北海道グルメツアー
INSERT INTO "TripSchedule" (id, "userId", title, description, "startDate", "endDate", "coverImage", category, "travelerCount", "isPublic", "createdAt", "updatedAt")
VALUES
  ('trip-2', 'sample-user-2', '札幌グルメ満喫3日間', '北海道の美味しい食べ物を巡る旅。海鮮、ラーメン、スープカレーなど札幌のグルメを堪能します。', '2024-12-01', '2024-12-03', 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800', 'グルメ旅', 1, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 北海道旅行の日程
INSERT INTO "DaySchedule" (id, "tripScheduleId", "dayNumber", date, title, "createdAt", "updatedAt")
VALUES
  ('day-2-1', 'trip-2', 1, '2024-12-01', '1日目', NOW(), NOW()),
  ('day-2-2', 'trip-2', 2, '2024-12-02', '2日目', NOW(), NOW()),
  ('day-2-3', 'trip-2', 3, '2024-12-03', '3日目', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 北海道旅行のアクティビティ（1日目）
INSERT INTO "Activity" (id, "dayScheduleId", time, title, type, location, description, duration, cost, "createdAt", "updatedAt")
VALUES
  ('activity-3-1', 'day-2-1', '12:00', '海鮮丼ランチ', 'meal', '二条市場', '新鮮な海鮮が乗った豪華な海鮮丼。', '1時間', 2500, NOW(), NOW()),
  ('activity-3-2', 'day-2-1', '15:00', '大通公園散策', 'activity', '大通公園', '札幌の中心部、大通公園をのんびり散歩。', '1時間', 0, NOW(), NOW()),
  ('activity-3-3', 'day-2-1', '18:00', 'ジンギスカン', 'meal', 'すすきの', '本場の生ラムジンギスカンを堪能。', '2時間', 4000, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 北海道旅行のアクティビティ（2日目）
INSERT INTO "Activity" (id, "dayScheduleId", time, title, type, location, description, duration, cost, "createdAt", "updatedAt")
VALUES
  ('activity-4-1', 'day-2-2', '11:00', '札幌ラーメン', 'meal', 'すすきのラーメン横丁', '有名店で味噌ラーメンを食べ比べ。', '1時間', 1000, NOW(), NOW()),
  ('activity-4-2', 'day-2-2', '14:00', '白い恋人パーク', 'sightseeing', '宮の沢', 'お菓子工場見学とカフェでスイーツタイム。', '2時間', 1500, NOW(), NOW()),
  ('activity-4-3', 'day-2-2', '19:00', 'スープカレー', 'meal', '札幌駅周辺', '野菜たっぷりのスープカレーで体を温める。', '1.5時間', 1800, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 北海道旅行のアクティビティ（3日目）
INSERT INTO "Activity" (id, "dayScheduleId", time, title, type, location, description, duration, cost, "createdAt", "updatedAt")
VALUES
  ('activity-5-1', 'day-2-3', '10:00', '小樽観光', 'sightseeing', '小樽運河', 'レトロな街並みを散策。', '2時間', 0, NOW(), NOW()),
  ('activity-5-2', 'day-2-3', '12:30', '寿司ランチ', 'meal', '小樽寿司屋通り', '小樽の新鮮な寿司を堪能。', '1時間', 3000, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- サンプル旅行プラン3: 沖縄ビーチリゾート
INSERT INTO "TripSchedule" (id, "userId", title, description, "startDate", "endDate", "coverImage", category, "travelerCount", "isPublic", "createdAt", "updatedAt")
VALUES
  ('trip-3', 'sample-user-1', '沖縄の青い海を満喫する4日間', '美しいビーチでのんびりと過ごすリゾート旅。シュノーケリングやマリンスポーツも楽しみます。', '2025-01-10', '2025-01-13', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', '自然・アウトドア', 2, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 沖縄旅行の日程
INSERT INTO "DaySchedule" (id, "tripScheduleId", "dayNumber", date, title, "createdAt", "updatedAt")
VALUES
  ('day-3-1', 'trip-3', 1, '2025-01-10', '1日目', NOW(), NOW()),
  ('day-3-2', 'trip-3', 2, '2025-01-11', '2日目', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 沖縄旅行のアクティビティ（1日目）
INSERT INTO "Activity" (id, "dayScheduleId", time, title, type, location, description, duration, cost, "createdAt", "updatedAt")
VALUES
  ('activity-6-1', 'day-3-1', '14:00', 'ホテルチェックイン', 'accommodation', '恩納村', 'リゾートホテルにチェックイン。', '0.5時間', 0, NOW(), NOW()),
  ('activity-6-2', 'day-3-1', '16:00', 'ビーチで夕日鑑賞', 'activity', 'サンセットビーチ', '美しい夕日を眺めながらのんびり。', '2時間', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 沖縄旅行のアクティビティ（2日目）
INSERT INTO "Activity" (id, "dayScheduleId", time, title, type, location, description, duration, cost, "createdAt", "updatedAt")
VALUES
  ('activity-7-1', 'day-3-2', '09:00', 'シュノーケリングツアー', 'activity', '青の洞窟', '熱帯魚と一緒に泳ぐシュノーケリング体験。', '3時間', 6000, NOW(), NOW()),
  ('activity-7-2', 'day-3-2', '13:00', '沖縄料理ランチ', 'meal', '恩納村', 'ソーキそばとゴーヤチャンプルー。', '1時間', 1500, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- いいねを追加
INSERT INTO "Like" (id, "userId", "tripScheduleId", "createdAt")
VALUES
  ('like-1', 'sample-user-2', 'trip-1', NOW()),
  ('like-2', 'sample-user-1', 'trip-2', NOW())
ON CONFLICT (id) DO NOTHING;

-- コメントを追加
INSERT INTO "Comment" (id, "userId", "tripScheduleId", content, "createdAt", "updatedAt")
VALUES
  ('comment-1', 'sample-user-2', 'trip-1', '京都素敵ですね！私も行ってみたいです！', NOW(), NOW()),
  ('comment-2', 'sample-user-1', 'trip-2', '北海道のグルメ、どれも美味しそう！参考にします。', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
