const express = require("express");
const path = require("path");
 
const app = express();
 
const PORT = 3000;
 
 
// Spotifyの情報
const CLIENT_ID = "ここにClient ID";
const CLIENT_SECRET = "ここにClient Secret";
 
 
let accessToken = "";
let tokenExpiresAt = 0;
 
 
// HTML・CSS・JavaScriptを公開
app.use(express.static(path.join(__dirname)));
 
 
// Spotifyのアクセストークンを取得
async function getAccessToken() {
 
  if (
    accessToken &&
    Date.now() < tokenExpiresAt
  ) {
    return accessToken;
  }
 
 
  const credentials =
    Buffer
      .from(`${CLIENT_ID}:${CLIENT_SECRET}`)
      .toString("base64");
 
 
  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
 
      headers: {
        "Authorization":
          `Basic ${credentials}`,
 
        "Content-Type":
          "application/x-www-form-urlencoded"
      },
 
      body:
        "grant_type=client_credentials"
    }
  );
 
 
  if (!response.ok) {
 
    throw new Error(
      "Spotify認証に失敗しました"
    );
 
  }
 
 
  const data =
    await response.json();
 
 
  accessToken =
    data.access_token;
 
 
  tokenExpiresAt =
    Date.now() +
    (data.expires_in - 60) * 1000;
 
 
  return accessToken;
}
 
 
// Spotify APIを呼び出す
async function spotifyAPI(endpoint) {
 
  const token =
    await getAccessToken();
 
 
  const response =
    await fetch(
      `https://api.spotify.com/v1/${endpoint}`,
      {
        headers: {
          "Authorization":
            `Bearer ${token}`
        }
      }
    );
 
 
  if (!response.ok) {
 
    const text =
      await response.text();
 
    console.error(text);
 
    throw new Error(
      "Spotify APIエラー"
    );
 
  }
 
 
  return await response.json();
}
 
 
// 曲・アーティスト・アルバム検索
app.get("/api/search", async (req, res) => {
 
  try {
 
    const keyword =
      req.query.q;
 
 
    if (!keyword) {
 
      return res.status(400).json({
        error:
          "検索キーワードがありません"
      });
 
    }
 
 
    const encoded =
      encodeURIComponent(keyword);
 
 
    const data =
      await spotifyAPI(
        `search?q=${encoded}&type=track,artist,album&limit=10&market=JP`
      );
 
 
    res.json(data);
 
  } catch (error) {
 
    console.error(error);
 
    res.status(500).json({
      error:
        "検索に失敗しました"
    });
 
  }
 
});
 
 
// サーバー起動
app.listen(PORT, () => {
 
  console.log(
    `http://localhost:${PORT}`
  );
 
});