# マルタ村相談室

完結しない村の哲学を体現した相談チャットボット

## 🚀 Vercelへのデプロイ方法

### 1. GitHubリポジトリを作成

1. GitHub（https://github.com）にログイン
2. 「New repository」をクリック
3. リポジトリ名を入力（例：malta-consultation）
4. 「Create repository」をクリック

### 2. コードをGitHubにプッシュ

ローカルでこのフォルダを開いて、以下のコマンドを実行：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/malta-consultation.git
git push -u origin main
```

### 3. Vercelでデプロイ

1. Vercel（https://vercel.com）にアクセス
2. 「Sign Up」→「Continue with GitHub」でログイン
3. 「New Project」をクリック
4. GitHubから `malta-consultation` リポジトリを選択
5. 「Import」をクリック

### 4. 環境変数を設定

Vercelのプロジェクト設定画面で：

1. 「Settings」タブをクリック
2. 「Environment Variables」を選択
3. 以下を追加：
   - Name: `ANTHROPIC_API_KEY`
   - Value: あなたのAnthropic APIキー
4. 「Save」をクリック

### 5. デプロイ完了！

数分後、URLが生成されます（例：https://malta-consultation.vercel.app）

このURLを友人に共有すれば、すぐに使えます！

## 🔑 Anthropic APIキーの取得方法

1. https://console.anthropic.com にアクセス
2. アカウントを作成（無料）
3. 「Settings」→「API Keys」に移動
4. 「Create Key」をクリック
5. 生成されたキーをコピー

## 💻 ローカルで動かす方法（開発用）

```bash
# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.local.example .env.local
# .env.localファイルを開いて、APIキーを設定

# 開発サーバーを起動
npm run dev
```

http://localhost:3000 でアクセスできます

## 📁 ファイル構成

```
malta-consultation/
├── pages/
│   ├── api/
│   │   └── chat.js          # バックエンドAPI（サーバーサイド）
│   ├── _app.js              # Next.jsアプリの設定
│   └── index.js             # メインページ（フロントエンド）
├── styles/
│   └── globals.css          # グローバルCSS
├── package.json             # 依存関係
├── tailwind.config.js       # Tailwind CSS設定
├── postcss.config.js        # PostCSS設定
└── .env.local.example       # 環境変数の例
```

## 🛠️ カスタマイズ

### システムプロンプトを変更したい場合

`pages/api/chat.js` の `SYSTEM_PROMPT` を編集してください。

### デザインを変更したい場合

`pages/index.js` のTailwind CSSクラスを編集してください。

## 📞 サポート

問題があれば、Anthropicのドキュメントを参照してください：
https://docs.anthropic.com

## ライセンス

このプロジェクトはあなたのものです。自由に使ってください！
