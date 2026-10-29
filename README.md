# HiranoSeiken

## Spotify Web APIの設定と起動

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)でアプリを作成し、アプリの **Client ID** と **Client Secret** を取得します。
2. PowerShellでこのフォルダに移動して `.env.example` をコピーし、メモ帳で開きます。
   ```powershell
   cd C:\APIapp\HiranoSeiken
   Copy-Item .env.example .env
   notepad .env
   ```
   Client IDとClient Secretを設定して保存します。
   ```dotenv
   SPOTIFY_CLIENT_ID=取得したClient_ID
   SPOTIFY_CLIENT_SECRET=取得したClient_Secret
   ```
   `.env` は秘密情報を含むため、Gitなどに登録したり、ブラウザー側のJavaScriptに書いたりしないでください。
3. PowerShellでこのフォルダに移動して、依存パッケージをインストールし、サーバーを起動します。
   ```powershell
   cd C:\APIapp\HiranoSeiken
   npm install
   npm start
   ```
4. ブラウザーで <http://localhost:3000/> を開きます。`npm start`を実行したターミナルは、利用中は開いたままにしてください。

検索APIを呼び出すには、HTMLファイルを直接開くのではなく、起動したNode.jsサーバー経由でアクセスしてください。Spotifyの認証やAPI呼び出しに失敗した場合は、起動したターミナルのエラーも確認してください。

このアプリはClient Credentialsフローを使ったカタログ検索用です。Spotifyの楽曲再生など、ユーザーアカウントへのアクセスが必要な機能には別の認証フローが必要です。
