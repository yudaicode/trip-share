-- profilesテーブルにemail認証用カラムを追加

-- emailカラムを追加（UNIQUE制約付き）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- password_hashカラムを追加（NULL許可：ソーシャルログインの場合はNULL）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- emailにインデックスを作成（検索速度向上）
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 既存のGoogleユーザーにemailを設定（usernameから推測）
-- 注意: この操作は手動で確認してから実行してください
-- UPDATE profiles SET email = username || '@example.com' WHERE email IS NULL;
