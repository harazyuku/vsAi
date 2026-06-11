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







## 🌱 初心者向け：開発を始める前の準備

このプロジェクトに参加するためには、以下の準備が必要です。

### 1. GitHubアカウントを作成する

GitHubはソースコードを管理するサービスです。

以下のサイトへアクセスし、アカウントを作成してください。

https://github.com

---

### 2. Visual Studio Code（VS Code）をインストールする

VS Codeはプログラムを書くためのエディタです。

以下のサイトからダウンロードしてください。

https://code.visualstudio.com

インストール後、起動できることを確認してください。

---

### 3. Gitをインストールする

Gitはソースコードの変更履歴を管理するツールです。

#### Windows

https://git-scm.com/download/win

インストーラーをダウンロードし、基本的にデフォルト設定のままインストールしてください。

#### Mac

ターミナルで以下を実行します。

```bash
git --version
```

Gitが入っていない場合は案内が表示されるので、その手順に従ってインストールしてください。

---

### 4. VS CodeにGitHubでログインする

1. VS Codeを起動
2. 左下のアカウントアイコンをクリック
3. 「GitHubでサインイン」を選択
4. ブラウザが開くので認証を完了

---

### 5. VS Codeのおすすめ拡張機能をインストールする

左側メニューの「Extensions」から以下を検索してインストールしてください。

* Prettier
* ESLint
* Tailwind CSS IntelliSense

---

### 6. Node.jsをインストールする

Node.jsはアプリを動かすために必要です。

以下からLTS版をインストールしてください。

https://nodejs.org

インストール後、ターミナルで確認します。

```bash
node -v
npm -v
```

バージョンが表示されれば成功です。

---

### 7. GitHubからプロジェクトを取得する

ターミナルで以下を実行してください。

```bash
git clone git@github.com:harazyuku/vsAi.git
cd vsAi
```

これで開発を始める準備が完了です。

