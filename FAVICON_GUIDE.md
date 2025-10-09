# ファビコンとアプリアイコンの設定ガイド

## 必要なアイコンファイル

Next.js 15のApp Routerでは、以下のファイルを`app/`ディレクトリに配置することで自動的に認識されます。

### 1. favicon.ico
- **場所**: `app/favicon.ico`
- **サイズ**: 16x16, 32x32, 48x48（マルチサイズICO推奨）
- **用途**: ブラウザのタブアイコン

### 2. icon.png
- **場所**: `app/icon.png`
- **サイズ**: 32x32px以上（推奨: 512x512px）
- **用途**: PWA、Android、Windowsのアプリアイコン

### 3. apple-icon.png
- **場所**: `app/apple-icon.png`
- **サイズ**: 180x180px
- **用途**: iOSのホーム画面アイコン

### 4. og-image.png（オプション）
- **場所**: `app/og-image.png`
- **サイズ**: 1200x630px
- **用途**: SNSシェア時のOGP画像

## アイコン作成の推奨ツール

### オンラインツール
1. **Favicon.io** - https://favicon.io/
   - テキストからfaviconを生成
   - 絵文字からfaviconを生成
   - 画像からfaviconを生成

2. **RealFaviconGenerator** - https://realfavicongenerator.net/
   - 1つの画像から全プラットフォーム対応のアイコンセットを生成

3. **Canva** - https://www.canva.com/
   - デザインツール（OG画像作成に最適）

### デザインガイドライン

#### タビネタのアイコンコンセプト
- **テーマ**: 旅行、地図、旅のネタ
- **カラー**: ブルー（#2563eb）からピンク（#ec4899）のグラデーション
- **推奨アイコン要素**:
  - 地図ピン（MapPin）
  - 飛行機
  - 地球儀
  - スーツケース
  - 「旅」の文字

#### シンプルな作成例（絵文字利用）
Favicon.ioで以下の絵文字を使用：
- ✈️ (飛行機)
- 🗺️ (地図)
- 🧳 (スーツケース)

**推奨設定**:
- フォント: Roboto Bold
- 背景: グラデーション（青→ピンク）
- 文字色: 白

## ファイル配置手順

1. アイコンファイルを作成
2. 以下の構造で配置:
```
app/
├── favicon.ico       # 16x16, 32x32
├── icon.png          # 512x512
├── apple-icon.png    # 180x180
└── og-image.png      # 1200x630 (optional)
```

3. Vercelに再デプロイ

## 確認方法

### ローカル環境
```bash
npm run dev
```
ブラウザで`http://localhost:3000`を開き、タブのアイコンを確認

### 本番環境
1. Vercelにデプロイ後、`https://tabineta.vercel.app`を開く
2. ブラウザのタブアイコンを確認
3. iOSの場合：「ホーム画面に追加」で確認
4. Androidの場合：「ホーム画面に追加」で確認

## OGP画像確認ツール

デプロイ後、以下のツールでOGP画像が正しく設定されているか確認：
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

## トラブルシューティング

### アイコンが表示されない
1. ブラウザのキャッシュをクリア（Ctrl+Shift+R / Cmd+Shift+R）
2. ファイル名とパスを確認
3. Next.jsを再起動

### アイコンが古い画像のまま
- ブラウザキャッシュをクリア
- Vercelの再デプロイ時にキャッシュをクリア

## 現在の状態

- [ ] favicon.ico を作成・配置
- [ ] icon.png を作成・配置
- [ ] apple-icon.png を作成・配置
- [ ] og-image.png を作成・配置
- [ ] 本番環境で表示確認
- [ ] モバイルデバイスで確認
