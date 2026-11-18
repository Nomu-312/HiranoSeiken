const express = require("express");
const path = require("path");
require("dotenv").config();
 
const app = express();
 
const PORT = 3000;
 
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Spotifyの認証情報がありません。.envにSPOTIFY_CLIENT_IDとSPOTIFY_CLIENT_SECRETを設定してください。"
  );
  process.exit(1);
}
 
let accessToken = "";
let tokenExpiresAt = 0;
 
 
// HTML・CSS・JavaScriptを公開
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "hirano-index.html"));
});

 
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
    const details = await response.text();
    throw new Error(`Spotify認証に失敗しました (${response.status}): ${details}`);
  }
 
 
  const data =
    await response.json();

  if (!data.access_token || !data.expires_in) {
    throw new Error("Spotifyから有効なアクセストークンが返されませんでした");
  }
 
 
  accessToken =
    data.access_token;
 
 
  tokenExpiresAt =
    Date.now() +
    (data.expires_in - 60) * 1000;
 
 
  return accessToken;
}
 
 
// Spotify APIを呼び出す

async function spotifyAPI(endpoint) {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/${endpoint}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const details = await response.text();

      console.error("Spotify APIの詳細エラー:");
      console.error("ステータス:", response.status);
      console.error("内容:", details);

      throw new Error(
        `Spotify APIエラー: ${response.status}`
      );
    }

    return await response.json();

  } catch (error) {
    console.error("Spotify API通信エラー:", error);
    throw error;
  }
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
        "Spotify検索に失敗しました。サーバーのターミナルに表示されたエラーを確認してください。"
    });
 
  }
 
});
 

// 曲・アーティスト・アルバムランキング
app.get("/api/rankings", async (req, res) => {
  try {
    const [trackData, artistData, albumData] =
      await Promise.all([
        // 曲を取得
        spotifyAPI(
  `search?q=${encodeURIComponent("J-POP")}&type=track&limit=10&market=JP`
),

        // アーティストを取得
        spotifyAPI(
          `search?q=${encodeURIComponent("popular artists")}&type=artist&limit=10&market=JP`
        ),

        // アルバムを取得
        spotifyAPI(
          `search?q=${encodeURIComponent("popular albums")}&type=album&limit=10&market=JP`
        )
      ]);

    const tracks = (trackData.tracks?.items || [])
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 5);

    const artists = (artistData.artists?.items || [])
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 5);

    const albums = (albumData.albums?.items || [])
      .slice(0, 5);

    res.json({ tracks, artists, albums });

  } catch (error) {
    console.error("ランキング取得エラー:", error);

    res.status(500).json({
      error: "ランキングの取得に失敗しました"
    });
  }
});


// ランダムガチャ
app.get("/api/gacha", async (req, res) => {
  try {
    // 4ジャンルからランダムに1つ選ぶ
    const genres = [
      { name: "J-POP", keyword: "J-pop", market: "JP" },
      { name: "K-POP", keyword: "K-pop", market: "JP" },
      { name: "HIP-HOP", keyword: "hip hop", market: "US" },
      { name: "洋楽", keyword: "English pop", market: "US" }
    ];

    const selectedGenre =
      genres[Math.floor(Math.random() * genres.length)];

    // 選ばれたジャンルの曲を検索
    const data = await spotifyAPI(
      `search?q=${encodeURIComponent(selectedGenre.keyword)}&type=track&limit=10&market=${selectedGenre.market}`
    );

    const tracks = data.tracks?.items || [];

    if (tracks.length === 0) {
      throw new Error("曲が見つかりませんでした");
    }

    // 検索結果からランダムに1曲選ぶ
    const randomTrack =
      tracks[Math.floor(Math.random() * tracks.length)];

    res.json({
      ...randomTrack,
      genre: selectedGenre.name
    });

  } catch (error) {
    console.error("ガチャ取得エラー:", error);
    res.status(500).json({
      error: "ガチャの曲を取得できませんでした"
    });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});