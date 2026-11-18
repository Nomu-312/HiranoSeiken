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
        "Spotify検索に失敗しました。サーバーのターミナルに表示されたエラーを確認してください。"
    });
 
  }
 
});
 

// サイト起動時に表示するランキングを取得
app.get("/api/rankings", async (req, res) => {
  try {

    const [trackData, artistData, albumData] =
      await Promise.all([

        // ポップジャンルの曲を5件取得
        spotifyAPI(
          `search?q=${encodeURIComponent("genre:pop")}&type=track&limit=5&market=JP`
        ),

        // ポップジャンルのアーティストを5件取得
        spotifyAPI(
          `search?q=${encodeURIComponent("genre:pop")}&type=artist&limit=5&market=JP`
        ),

        // 新着アルバムを5件取得
        spotifyAPI(
          `search?q=${encodeURIComponent("tag:new")}&type=album&limit=5&market=JP`
        )

      ]);

    res.json({
      tracks: trackData.tracks.items,
      artists: artistData.artists.items,
      albums: albumData.albums.items
    });

  } catch (error) {

    console.error("ランキング取得エラー:", error);

    res.status(500).json({
      error: "ランキングの取得に失敗しました"
    });

  }
});

// ランダム曲ガチャAPI
app.get("/api/gacha", async (req, res) => {

  try {

    const genres = [
      "pop",
      "rock",
      "jazz",
      "classical",
      "country",
      "electronic",
      "folk",
      "metal",
      "reggae",
      "soul",
      "hip-hop",
      "disco",
      "blues",
      "indie"
    ];

    // 候補曲を保存する配列
    let allTracks = [];

    // 10回ランダム検索
    for (let i = 0; i < 10; i++) {

      // ジャンルをランダムに選択
      const genreIndex =
        Math.floor(Math.random() * genres.length);

      const genre = genres[genreIndex];

      // 検索位置をランダムに決定
      const offset =
        Math.floor(Math.random() * 1000);

      const params = new URLSearchParams({
        q: `genre:${genre}`,
        type: "track",
        limit: "10",
        offset: String(offset),
        market: "JP"
      });

      const data = await spotifyAPI(
        `search?${params.toString()}`
      );

      allTracks.push(...data.tracks.items);

    }

    // 重複する曲を除外
    const uniqueTracks = [
      ...new Map(
        allTracks.map(track => [track.id, track])
      ).values()
    ];

    if (uniqueTracks.length === 0) {
      return res.status(404).json({
        error: "曲が見つかりませんでした"
      });
    }

    // 乱数で1曲を抽選
    const randomIndex =
      Math.floor(Math.random() * uniqueTracks.length);

    const selectedTrack =
      uniqueTracks[randomIndex];

    res.json(selectedTrack);

  } catch (error) {

    console.error("ガチャエラー:", error);

    res.status(500).json({
      error: "ガチャに失敗しました"
    });

  }

});
// ガチャ機能
app.get("/api/gacha", async (req, res) => {
  try {
    const genres = ["pop", "rock", "jazz", "hip-hop", "indie"];

    // ランダムなジャンルを選ぶ
    const randomGenre =
      genres[Math.floor(Math.random() * genres.length)];

    // Spotifyから曲を取得
    const randomOffset = Math.floor(Math.random() * 50);

    const data = await spotifyAPI(
      `search?q=genre:${randomGenre}&type=track&limit=50&offset=${randomOffset}&market=JP`
    );

    const tracks = data.tracks.items;

    if (!tracks || tracks.length === 0) {
      return res.status(404).json({
        error: "ガチャで曲を取得できませんでした"
      });
    }

    // 取得した曲からランダムに1曲選ぶ
    const randomIndex = Math.floor(Math.random() * tracks.length);
    const selectedTrack = tracks[randomIndex];

    res.json(selectedTrack);

  } catch (error) {
    console.error("ガチャエラー:", error);

    res.status(500).json({
      error: "ガチャの曲を取得できませんでした"
    });
  }
});
// サーバー起動
app.listen(PORT, () => {
 
  console.log(
    `http://localhost:${PORT}`
  );
 
});