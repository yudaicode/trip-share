# タビネタ (Tabineta)

旅行プランを作成・共有・探索できるコミュニティプラットフォーム

## 概要

タビネタは、旅行好きな人々が自分の旅行プランを作成し、他のユーザーと共有できるWebアプリケーションです。他の人の旅行プランからインスピレーションを得て、次の旅行のアイデアを見つけることができます。

## 主な機能

### ✨ 実装済み機能 (MVP)

- **認証システム**
  - Google OAuth 2.0によるログイン
  - NextAuth.js v4を使用

- **旅行プラン作成・管理**
  - 旅行プランの作成・編集・削除
  - 日別スケジュールとアクティビティの管理
  - カバー画像のアップロード (Supabase Storage)
  - カテゴリー分類 (国内旅行、海外旅行、グルメ旅など)

- **ソーシャル機能**
  - 旅行プランへのいいね
  - コメント機能
  - ブックマーク機能
  - ユーザープロフィール表示

- **検索・探索**
  - 旅行プランの検索
  - カテゴリー別フィルタリング
  - 人気順・最新順ソート

- **ユーザープロフィール**
  - プロフィール編集
  - アバター画像アップロード
  - 自分の旅行プラン一覧表示

## 技術スタック

### フロントエンド
- **Next.js 15.4.6** - React フレームワーク (App Router)
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **Framer Motion** - アニメーション
- **Lucide React** - アイコン

### バックエンド・インフラ
- **NextAuth.js v4.24.11** - 認証
- **Supabase** - PostgreSQLデータベース + Storage
- **Vercel** - ホスティング・デプロイ

### データベース
- **PostgreSQL (Supabase)**
  - Row Level Security (RLS) による権限管理
  - テーブル: profiles, trip_schedules, day_schedules, activities, trip_likes, trip_comments, trip_bookmarks

## セットアップ

### 前提条件
- Node.js 18.x 以上
- npm または yarn
- Supabaseアカウント
- Google Cloud Platform アカウント (OAuth設定用)

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd trip-share
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定

`.env.local` ファイルを作成し、以下の環境変数を設定:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. データベースのセットアップ

Supabaseダッシュボードでプロジェクトを作成後、以下のSQLスクリプトを実行:
```bash
# Supabase SQL Editorで実行
# scripts/seed-supabase-fixed.sql の内容を実行
```

5. 開発サーバーを起動
```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## デプロイ (Vercel)

### 手順

1. Vercelにプロジェクトをインポート
2. 環境変数を設定 (上記の`.env.local`と同じ変数)
3. Google OAuth設定で承認済みリダイレクトURIに本番URLを追加:
   - `https://your-app.vercel.app/api/auth/callback/google`
4. デプロイ

### 環境変数の確認方法
```
Vercelダッシュボード > プロジェクト > Settings > Environment Variables
```

## プロジェクト構成

```
trip-share/
├── app/                      # Next.js App Router
│   ├── api/                  # APIルート
│   │   ├── auth/            # NextAuth設定
│   │   ├── trips/           # 旅行プラン関連API
│   │   ├── users/           # ユーザー関連API
│   │   └── upload/          # 画像アップロード
│   ├── dashboard/           # ダッシュボードページ
│   ├── create/              # 旅行プラン作成ページ
│   ├── trips/[id]/          # 旅行プラン詳細・編集
│   └── explore/             # 探索ページ
├── components/              # Reactコンポーネント
│   ├── ui/                  # UIコンポーネント
│   ├── dashboard/           # ダッシュボード関連
│   └── profile/             # プロフィール関連
├── lib/                     # ユーティリティ
│   ├── auth.ts             # NextAuth設定
│   └── supabase/           # Supabaseクライアント
└── public/                  # 静的ファイル
```

## データベーススキーマ

### 主要テーブル

- **profiles** - ユーザープロフィール
- **trip_schedules** - 旅行プラン
- **day_schedules** - 日別スケジュール
- **activities** - アクティビティ詳細
- **trip_likes** - いいね
- **trip_comments** - コメント
- **trip_bookmarks** - ブックマーク

詳細なスキーマは `lib/database.types.ts` を参照

## 開発ガイドライン

### コーディング規約
- TypeScript strictモード
- ESLint + Prettierによるコードフォーマット
- コンポーネントはfunction宣言を使用
- APIルートはエラーハンドリングを必須とする

### デバッグ
- 本番環境では`console.log`を使用しない（`console.error`のみ）
- エラーハンドリングは全APIルートで実装

## ライセンス

MIT

## 開発者

タビネタ開発チーム
