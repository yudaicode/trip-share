# 漏洩パスワード保護の有効化

このセキュリティ機能はSupabaseのダッシュボードから手動で有効化する必要があります。

## 手順

1. Supabaseダッシュボードにアクセス: https://supabase.com/dashboard
2. プロジェクト `qligfarbbfsbyarihnxw` を選択
3. 左サイドバーから **Authentication** → **Policies** を選択
4. **Password settings** セクションを見つける
5. **Leaked Password Protection** を有効化

## 効果

有効化すると、HaveIBeenPwned.orgのデータベースと照合し、漏洩したパスワードの使用を防止します。

## 参考ドキュメント

https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection