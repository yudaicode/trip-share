# 広告設定ガイド

タビネタでは、Google AdSenseを使ったバナー広告の表示機能を実装しています。

## 目次

1. [Google AdSenseの設定](#google-adsenseの設定)
2. [環境変数の設定](#環境変数の設定)
3. [広告の表示](#広告の表示)
4. [カスタマイズ](#カスタマイズ)

## Google AdSenseの設定

### 1. Google AdSenseアカウントの作成

1. [Google AdSense](https://www.google.com/adsense/)にアクセス
2. 「ご利用開始」をクリック
3. ウェブサイトのURLとメールアドレスを入力
4. アカウント情報を入力して完了

### 2. サイトの審査

- Google AdSenseは審査制です
- サイトに十分なコンテンツが必要（記事10本以上推奨）
- プライバシーポリシーページが必要（✅実装済み）
- 利用規約ページが必要（✅実装済み）
- 審査には通常1〜2週間かかります

### 3. 広告ユニットの作成

審査通過後：

1. AdSenseダッシュボードにログイン
2. 「広告」→「サマリー」→「広告ユニットごと」を選択
3. 「ディスプレイ広告」を作成
4. 広告サイズを選択（レスポンシブ推奨）
5. 広告ユニット名を入力
6. 「作成」をクリック
7. **パブリッシャーID（ca-pub-XXXXXXXXXXXXXXXX）**をコピー

## 環境変数の設定

### 開発環境

`.env.local`ファイルに以下を追加：

```bash
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

### 本番環境（Vercel）

1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」
4. 以下を追加：
   - **Key**: `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
   - **Value**: `ca-pub-XXXXXXXXXXXXXXXX`
   - **Environment**: Production, Preview, Development すべてにチェック
5. 「Save」をクリック
6. 再デプロイ

## 広告の表示

環境変数が設定されている場合のみ、広告が自動的に表示されます。

### 現在の広告配置

以下のページに広告が配置されています：

1. **ホームページ (`/`)**
   - 特徴セクションと人気プランの間に横長バナー

2. **探索ページ (`/explore`)**
   - フィルターセクションと検索結果の間にレスポンシブバナー

### 広告の追加方法

他のページに広告を追加する場合：

```tsx
import { AdBanner } from "@/components/AdBanner"

// ページ内の任意の場所に配置
<AdBanner format="responsive" />

// または特定のフォーマットを指定
<AdBanner format="horizontal" />  // 横長バナー
<AdBanner format="vertical" />    // 縦長バナー
<AdBanner format="square" />      // 正方形
```

### 広告スロットIDの指定

特定の広告ユニットを使用する場合：

```tsx
<AdBanner
  format="responsive"
  adSlot="1234567890"  // AdSenseから取得したスロットID
/>
```

## カスタマイズ

### AdBannerコンポーネントのオプション

```tsx
interface AdBannerProps {
  adSlot?: string;           // 広告スロットID（任意）
  format?: "horizontal" | "vertical" | "square" | "responsive";  // デフォルト: "responsive"
  className?: string;        // 追加のCSSクラス
}
```

### スタイルのカスタマイズ

`components/AdBanner.tsx`を編集して、広告の表示スタイルをカスタマイズできます：

```tsx
// 広告コンテナのスタイル
<div className={`ad-banner-container my-4 ${className}`}>
  <div className="text-center text-xs text-gray-400 mb-1">
    スポンサー
  </div>
  {/* 広告 */}
</div>
```

## トラブルシューティング

### 広告が表示されない

1. **環境変数の確認**
   ```bash
   # 開発環境
   echo $NEXT_PUBLIC_ADSENSE_CLIENT_ID

   # 本番環境
   # Vercelダッシュボードで確認
   ```

2. **パブリッシャーIDの形式確認**
   - 正しい形式: `ca-pub-1234567890123456`
   - `ca-pub-`のプレフィックスが必要

3. **AdSense審査状況の確認**
   - AdSenseダッシュボードで審査状況を確認
   - 審査中は広告が表示されません

4. **広告ブロッカーの無効化**
   - ブラウザの広告ブロッカーを無効にして確認

5. **ブラウザのコンソールを確認**
   - F12でデベロッパーツールを開く
   - コンソールにエラーがないか確認

### よくある問題

**Q: 開発環境で広告が表示されない**
A: AdSenseはローカル環境（localhost）では正しく動作しない場合があります。本番環境で確認してください。

**Q: "AdSense error" がコンソールに表示される**
A: 以下を確認：
- パブリッシャーIDが正しい
- サイトがAdSenseに登録されている
- 広告の配置が多すぎない（1ページ3〜5個を推奨）

**Q: 広告の代わりに空白が表示される**
A: 以下の理由が考えられます：
- AdSense審査中
- 適切な広告が見つからない
- ページのコンテンツが不十分

## 広告の最適化

### 推奨事項

1. **広告の配置**
   - コンテンツの合間に自然に配置
   - 1ページあたり3〜5個程度
   - ファーストビューに広告を詰め込まない

2. **広告のサイズ**
   - レスポンシブ広告を優先使用
   - デバイスに応じて最適なサイズが自動選択される

3. **パフォーマンス**
   - 広告スクリプトは非同期読み込み（✅実装済み）
   - ページ読み込み速度への影響を最小限に

4. **ユーザー体験**
   - 広告がコンテンツを邪魔しない配置
   - モバイルでも見やすい表示

## 収益化のヒント

1. **コンテンツの充実**
   - 質の高い旅行プランを増やす
   - ユーザーの滞在時間を伸ばす

2. **アクセス数の向上**
   - SEO対策（✅実装済み）
   - ソーシャルメディアでの共有

3. **広告配置の最適化**
   - AdSense レポートで効果を分析
   - クリック率の高い位置を見つける

4. **コンプライアンス**
   - AdSenseポリシーを遵守
   - プライバシーポリシーの掲載（✅実装済み）

## サポート

質問や問題がある場合：

1. [Google AdSense ヘルプセンター](https://support.google.com/adsense/)
2. [AdSenseコミュニティ](https://support.google.com/adsense/community)
3. プロジェクトのGitHub Issues

---

**最終更新**: 2025年
**バージョン**: 1.0.0
