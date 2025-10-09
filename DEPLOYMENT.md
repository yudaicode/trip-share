# デプロイメントガイド

## 環境変数の設定

### 必須の環境変数

#### 1. Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**取得方法:**
1. Supabaseダッシュボードにログイン
2. プロジェクト設定 > API
3. URLとAnon keyをコピー

#### 2. NextAuth
```bash
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret_key
```

**NEXTAUTH_SECRETの生成:**
```bash
openssl rand -base64 32
```

#### 3. Google OAuth（オプション）
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

**取得方法:**
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」>「認証情報」
4. 「認証情報を作成」>「OAuthクライアントID」
5. アプリケーションの種類：ウェブアプリケーション
6. 承認済みのリダイレクトURI：
   - 開発: `http://localhost:3000/api/auth/callback/google`
   - 本番: `https://your-domain.com/api/auth/callback/google`

## Vercelでのデプロイ手順

### 1. GitHubリポジトリをVercelに接続

1. [Vercel](https://vercel.com)にログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト名を設定

### 2. 環境変数の設定

Vercelダッシュボードで以下を設定：

1. プロジェクト設定 > Environment Variables
2. 以下の環境変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXTAUTH_URL
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID（オプション）
GOOGLE_CLIENT_SECRET（オプション）
```

**重要:** `NEXTAUTH_URL`は本番ドメインを設定してください（例: `https://your-app.vercel.app`）

### 3. デプロイ

1. 「Deploy」ボタンをクリック
2. ビルドが完了するまで待機
3. デプロイされたURLを確認

### 4. カスタムドメインの設定（オプション）

1. プロジェクト設定 > Domains
2. カスタムドメインを追加
3. DNSレコードを設定

## デプロイ後の確認事項

### ✅ チェックリスト

- [ ] すべての環境変数が正しく設定されている
- [ ] Google OAuthのリダイレクトURIに本番URLが追加されている
- [ ] Supabaseのプロジェクト設定でVercelドメインが許可されている
- [ ] 認証フローが正常に動作する
- [ ] 旅行プランの作成・編集・削除が動作する
- [ ] 画像アップロードが動作する
- [ ] コメント・いいね機能が動作する
- [ ] 通知機能が動作する
- [ ] フォロー機能が動作する
- [ ] 検索機能が動作する

## トラブルシューティング

### 認証エラー

**症状:** ログインできない、セッションエラー

**解決策:**
1. `NEXTAUTH_URL`が本番URLと一致しているか確認
2. `NEXTAUTH_SECRET`が設定されているか確認
3. Google OAuthのリダイレクトURIに本番URLが含まれているか確認

### Supabase接続エラー

**症状:** データの取得・保存ができない

**解決策:**
1. Supabase環境変数が正しいか確認
2. SupabaseダッシュボードでAPIキーが有効か確認
3. Supabaseプロジェクトの認証設定でVercelドメインが許可されているか確認

### 画像アップロードエラー

**症状:** 画像がアップロードできない

**解決策:**
1. Supabase Storageのバケットが公開設定されているか確認
2. ストレージのRLSポリシーが正しく設定されているか確認

## パフォーマンス最適化

### 推奨設定

1. **画像最適化:** Next.js Imageコンポーネントを使用
2. **キャッシング:** VercelのEdge Cacheを活用
3. **データベース:** Supabase接続プーリングを有効化

## モニタリング

### Vercel Analytics
- Vercelダッシュボードでアクセス解析を確認

### Supabase Dashboard
- データベースの使用状況を監視
- APIリクエスト数を確認

## セキュリティ

### 本番環境での注意事項

1. **環境変数の管理**
   - シークレットキーは絶対にGitにコミットしない
   - 定期的にキーをローテーション

2. **CORS設定**
   - Supabaseで許可するドメインを制限

3. **Rate Limiting**
   - Vercelの設定でRate Limitingを有効化

4. **HTTPS**
   - 必ずHTTPSを使用（Vercelはデフォルトで有効）
