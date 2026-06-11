# vsAi

AIと対戦するゲームアプリのプロジェクトです。

フロントエンド（Next.js）とバックエンド（Node.js + Express）のモノリポ構成になっています。

## 🛠️ 前提条件（必要な環境）

開発を始める前に、以下のツールがパソコンにインストールされている必要があります。

* Git（コードの管理・クローン用）
* Node.js（推奨バージョン: v18以上、またはv20以上のLTS）

  * Node.jsをインストールすると npm コマンドも自動で利用できます

---

## 🚀 開発の始め方（セットアップ手順）

リポジトリをクローンしてから、手元でアプリを起動するまでの手順です。

### 1. リポジトリのクローン

ターミナルでリポジトリをクローンし、プロジェクトのフォルダに移動します。

```bash
git clone git@github.com:harazyuku/vsAi.git
cd vsAi
```

### 2. フロントエンド（Next.js）のセットアップ

フロントエンドに必要なライブラリをインストールし、開発サーバーを起動します。

```bash
# フォルダに移動
cd frontend

# ライブラリのインストール
npm install

# 開発用サーバーの起動
npm run dev
```

起動後、ブラウザで以下にアクセスしてください。

```text
http://localhost:3000
```

### 3. バックエンド（Node.js + Express）のセットアップ

別のターミナルを開き、バックエンドのセットアップと起動を行います。

```bash
# フォルダに移動
cd backend

# ライブラリのインストール
npm install

# サーバーの起動
npm run dev
```

## 🔧 推奨VS Code拡張機能

開発効率向上のため、以下の拡張機能の導入を推奨します。

* Prettier

  * コードフォーマットを自動で整形します
* ESLint

  * コードの問題点や記述ミスを検出します
* Tailwind CSS IntelliSense

  * Tailwind CSS のクラス補完を提供します

## 📂 フォルダ構成

```text
vsAi/
├── frontend/  # フロントエンド (Next.js / TypeScript / Tailwind CSS)
└── backend/   # バックエンド (Node.js / Express / Socket.io)
```

## 💡 補足

`node_modules` は `.gitignore` によって管理対象外となっています。

そのため、リポジトリをクローンした直後は必要なライブラリが存在しません。

開発を始める際は、各ディレクトリで以下のコマンドを実行し、依存ライブラリをインストールしてください。

```bash
npm install
```
