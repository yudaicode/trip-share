# Supabase SQLマイグレーション

このディレクトリには、Supabaseデータベースの最適化とセキュリティ向上のためのSQLマイグレーションファイルが含まれています。

## マイグレーション一覧

### 001_optimize_rls_policies.sql
**目的**: RLSポリシーのパフォーマンス最適化と重複ポリシーの統合

- `auth.uid()` を `(select auth.uid())` 形式に変更してクエリパフォーマンスを改善
- 重複したRLSポリシーを統合（trip_comments, trip_likes, trip_bookmarksテーブル）
- より効率的なポリシー構造に再構築

**影響するテーブル**:
- profiles
- trip_schedules
- day_schedules
- activities
- trip_comments
- trip_likes
- trip_bookmarks

### 002_fix_function_search_path.sql
**目的**: 関数のセキュリティ向上

- `handle_new_user()` 関数に `SET search_path = public` を追加
- `update_updated_at_column()` 関数に `SET search_path = public` を追加
- セキュリティの脆弱性を解消

### 003_remove_duplicate_indexes.sql
**目的**: パフォーマンス改善のため重複インデックスを削除

- `trip_comments` テーブルの重複インデックスを削除
  - `idx_trip_comments_trip_id`（外部キー制約の自動インデックスと重複）
  - `idx_trip_comments_user_id`（外部キー制約の自動インデックスと重複）

### 004_enable_password_protection.md
**目的**: 漏洩パスワード保護の有効化手順

- ダッシュボードから手動で有効化する必要がある設定の手順書

## 実行方法

### 方法1: Supabase CLIを使用（推奨）

```bash
# Supabase CLIがインストールされている場合
supabase db push
```

### 方法2: Supabase ダッシュボードから実行

1. [Supabaseダッシュボード](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. **SQL Editor** を開く
4. 各SQLファイルの内容をコピー＆ペーストして実行
5. 順番に実行: 001 → 002 → 003

### 方法3: psqlを使用

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.qligfarbbfsbyarihnxw.supabase.co:5432/postgres" < 001_optimize_rls_policies.sql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.qligfarbbfsbyarihnxw.supabase.co:5432/postgres" < 002_fix_function_search_path.sql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.qligfarbbfsbyarihnxw.supabase.co:5432/postgres" < 003_remove_duplicate_indexes.sql
```

## 検出された問題の解決状況

### ✅ 解決済み（SQLマイグレーションで対応）

- **Auth RLS Initialization Plan**: 18件 → `(select auth.uid())` 形式に変更
- **Function Search Path Mutable**: 2件 → `SET search_path = public` を追加
- **Multiple Permissive Policies**: 多数 → 重複ポリシーを統合
- **Duplicate Index**: 2件 → 重複インデックスを削除

### ⚠️ 手動対応が必要

- **Leaked Password Protection Disabled**: ダッシュボードから有効化が必要（004_enable_password_protection.md参照）

### ℹ️ 情報レベル（対応不要）

- **Unused Index**: 使用されていないインデックスが検出されていますが、アプリケーションが本格稼働後に使用される可能性があるため、当面は保持します

## 注意事項

- マイグレーションを実行する前に、必ずバックアップを取得してください
- 本番環境で実行する前に、開発環境でテストしてください
- RLSポリシーの変更により、既存のクエリに影響が出る可能性があります

## 参考リンク

- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [RLS Performance Optimization](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
- [Password Security](https://supabase.com/docs/guides/auth/password-security)