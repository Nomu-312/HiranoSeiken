async function searchMusic() {
 
  const keyword = document.getElementById("searchInput").value.trim();
 
  if (!keyword) {
    alert("検索キーワードを入力してください");
    return;
  }
 
  try {
 
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(keyword)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `検索に失敗しました (${response.status})`);
    }

    displaySearchResults(data);
 
  } catch (error) {
 
    console.error(error);
    alert(error.message || "検索に失敗しました");
 
  }
}
 
 
// 検索結果を表示
function displaySearchResults(data) {
 
  const container = document.getElementById("searchResults");
 
  container.innerHTML = "";
 
  const tracks = data.tracks.items;
 
  if (tracks.length === 0) {
    container.innerHTML = "<p>検索結果がありません。</p>";
    return;
  }
 
  tracks.forEach(track => {
 
    const image =
      track.album.images.length > 0
        ? track.album.images[0].url
        : "";
 
    const artists = track.artists
      .map(artist => artist.name)
      .join(", ");
 
    const card = document.createElement("div");
 
    card.className = "song-card";
 
    card.innerHTML = `
      <img src="${image}" alt="${escapeHTML(track.name)}">
 
      <h3>${escapeHTML(track.name)}</h3>
 
      <p>${escapeHTML(artists)}</p>
 
      <p>${escapeHTML(track.album.name)}</p>
 
      <button onclick='showSongDetail(${JSON.stringify(track)})'>
        詳細
      </button>
 
      <br>
 
      <a
        href="${track.external_urls.spotify}"
        target="_blank"
      >
        Spotifyで再生
      </a>
    `;
 
    container.appendChild(card);
 
  });
}
 
 
// 曲の詳細を表示
function showSongDetail(track) {
 
  const container = document.getElementById("songDetail");
 
  const image =
    track.album.images.length > 0
      ? track.album.images[0].url
      : "";
 
  const artists = track.artists
    .map(artist => artist.name)
    .join(", ");
 
  const duration = formatTime(track.duration_ms);
 
  container.innerHTML = `
    <div class="detail">
 
      <img src="${image}" alt="${escapeHTML(track.name)}">
 
      <div class="detail-info">
 
        <h3>${escapeHTML(track.name)}</h3>
 
        <p>
          <strong>アーティスト：</strong>
          ${escapeHTML(artists)}
        </p>
 
        <p>
          <strong>アルバム：</strong>
          ${escapeHTML(track.album.name)}
        </p>
 
        <p>
          <strong>発売日：</strong>
          ${track.album.release_date}
        </p>
 
        <p>
          <strong>再生時間：</strong>
          ${duration}
        </p>
 
        <a
          href="${track.external_urls.spotify}"
          target="_blank"
        >
          Spotifyで再生
        </a>
 
      </div>
 
    </div>
  `;
}
 
 
// TOP5を作成
function createRankings(data) {
 
  createSongRanking(data.tracks?.items || []);
 
  createArtistRanking(data.artists?.items || []);
 
  createAlbumRanking(data.albums?.items || []);
 
}
 
 
// 曲ランキング
function createSongRanking(tracks) {
 
  const container = document.getElementById("popularSongs");
 
  container.innerHTML = "";
 
  tracks.slice(0, 5).forEach((track, index) => {
 
    const image =
      track.album.images.length > 0
        ? track.album.images[0].url
        : "";
 
    container.innerHTML += `
      <div class="ranking-item">
 
        <div class="ranking-number">
          ${index + 1}
        </div>
 
        <img src="${image}">
 
        <div>
          <strong>${escapeHTML(track.name)}</strong>
          <p>
            ${escapeHTML(
              track.artists.map(a => a.name).join(", ")
            )}
          </p>
        </div>
 
      </div>
    `;
 
  });
}
 
 
// アーティストランキング
function createArtistRanking(artists) {
 
  const container = document.getElementById("popularArtists");
 
  container.innerHTML = "";
 
  artists.slice(0, 5).forEach((artist, index) => {
 
    const image =
      artist.images && artist.images.length > 0
        ? artist.images[0].url
        : "";
 
    container.innerHTML += `
      <div class="ranking-item">
 
        <div class="ranking-number">
          ${index + 1}
        </div>
 
        ${
          image
            ? `<img src="${image}">`
            : ""
        }
 
        <div>
          <strong>${escapeHTML(artist.name)}</strong>
        </div>
 
      </div>
    `;
 
  });
}
 
 
// アルバムランキング
function createAlbumRanking(albums) {
 
  const container = document.getElementById("popularAlbums");
 
  container.innerHTML = "";
 
  albums.slice(0, 5).forEach((album, index) => {
 
    const image =
      album.images.length > 0
        ? album.images[0].url
        : "";
 
    container.innerHTML += `
      <div class="ranking-item">
 
        <div class="ranking-number">
          ${index + 1}
        </div>
 
        <img src="${image}">
 
        <div>
          <strong>${escapeHTML(album.name)}</strong>
 
          <p>
            ${escapeHTML(
              album.artists.map(a => a.name).join(", ")
            )}
          </p>
        </div>
 
      </div>
    `;
 
  });
}
 
 
// 再生時間を「分:秒」に変換
function formatTime(ms) {
 
  const minutes = Math.floor(ms / 60000);
 
  const seconds = Math.floor(
    (ms % 60000) / 1000
  );
 
  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}
 
 
// HTMLエスケープ
function escapeHTML(value) {
 
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// サイト起動時にランキングを自動取得

async function loadRankings() {
  try {
    const response = await fetch("/api/rankings");

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "ランキング取得に失敗しました");
    }

    createRankings({
      tracks: { items: data.tracks || [] },
      artists: { items: data.artists || [] },
      albums: { items: data.albums || [] }
    });

  } catch (error) {
    console.error("ランキング表示エラー:", error);

    document.getElementById("popularSongs").innerHTML =
      "<p>曲ランキングを取得できませんでした。</p>";

    document.getElementById("popularArtists").innerHTML =
      "<p>アーティストランキングを取得できませんでした。</p>";

    document.getElementById("popularAlbums").innerHTML =
      "<p>アルバムランキングを取得できませんでした。</p>";
  }
}

// HTML読み込み完了後に自動実行
document.addEventListener("DOMContentLoaded", () => {
  loadRankings();
});


// ===================================
// ガチャ機能
// ===================================

// ガチャ履歴を取得
function getGachaHistory() {

  return JSON.parse(
    localStorage.getItem("gachaHistory") || "[]"
  );

}


// 今日の日付を取得（日本の端末のローカル日付）
function getTodayDate() {

  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


// ガチャ結果を表示
function displayGachaResult(track) {
  const container = document.getElementById("gachaResult");
  const image = track.image || "";

  const ratings = JSON.parse(
    localStorage.getItem("gachaRatings") || "{}"
  );

  const rating = ratings[track.id];

  container.innerHTML = `
    <div class="song-card">
      <h3>🎉 今日の当選曲！</h3>

      ${
        image
          ? '<img src="${escapeHTML(image)}" alt="ジャケット画像">'
          : ""
      }

      <h3>${escapeHTML(track.name)}</h3>
      <p>${escapeHTML(track.artists.join(", "))}</p>

      <a href="${escapeHTML(track.url)}"
         target="_blank"
         rel="noopener noreferrer">
        Spotifyで聴く
      </a>

      <div class="rating-buttons">
        <button id="likeButton"
          class="${rating === "like" ? "selected" : ""}">
          👍 いいね
        </button>

        <button id="dislikeButton"
          class="${rating === "dislike" ? "selected" : ""}">
          👎 よくないね
        </button>
      </div>

      <p id="ratingMessage">
        ${
          rating === "like"
            ? "お気に入りに登録済み！"
            : rating === "dislike"
              ? "よくないねを登録済み"
              : "この曲の評価を選んでね"
        }
      </p>
    </div>
  `;

  document.getElementById("likeButton")
    .addEventListener("click", () => {
      rateGachaTrack(track.id, "like");
    });

  document.getElementById("dislikeButton")
    .addEventListener("click", () => {
      rateGachaTrack(track.id, "dislike");
    });
}
// 曲の評価を保存
function rateGachaTrack(trackId, rating) {
  const history = getGachaHistory();

  const track = history.find(
    item => String(item.id) === String(trackId)
  );

  if (!track) return;

  const ratings = JSON.parse(
    localStorage.getItem("gachaRatings") || "{}"
  );

  let likedSongs = JSON.parse(
    localStorage.getItem("likedSongs") || "[]"
  );

  ratings[trackId] = rating;

  // いったんお気に入りから削除
  likedSongs = likedSongs.filter(
    item => String(item.id) !== String(trackId)
  );

  // いいねの場合だけ追加
  if (rating === "like") {
    likedSongs.unshift(track);
  }

  localStorage.setItem(
    "gachaRatings",
    JSON.stringify(ratings)
  );

  localStorage.setItem(
    "likedSongs",
    JSON.stringify(likedSongs)
  );

  displayGachaResult(track);
  displayLikedPlaylist();
}


// お気に入りプレイリストを表示
function displayLikedPlaylist() {
  const container =
    document.getElementById("likedPlaylist");

  if (!container) return;

  const likedSongs = JSON.parse(
    localStorage.getItem("likedSongs") || "[]"
  );

  container.innerHTML = "";

  if (likedSongs.length === 0) {
    container.innerHTML =
      "<p>まだお気に入りの曲はありません。</p>";
    return;
  }

  likedSongs.forEach(track => {
    container.innerHTML += `
      <div class="ranking-item">
        ${
          track.image
            ? '<img src="${escapeHTML(track.image)}" alt="">'
            : ""
        }

        <div>
          <strong>${escapeHTML(track.name)}</strong>
          <p>${escapeHTML(track.artists.join(", "))}</p>

          <a href="${escapeHTML(track.url)}"
             target="_blank"
             rel="noopener noreferrer">
            Spotifyで聴く
          </a>

          <br>

          <button onclick="removeLikedSong('${track.id}')">
            お気に入りから削除
          </button>
        </div>
      </div>
    `;
  });
}


// お気に入りから削除
function removeLikedSong(trackId) {
  let likedSongs = JSON.parse(
    localStorage.getItem("likedSongs") || "[]"
  );

  likedSongs = likedSongs.filter(
    item => String(item.id) !== String(trackId)
  );

  localStorage.setItem(
    "likedSongs",
    JSON.stringify(likedSongs)
  );

  const ratings = JSON.parse(
    localStorage.getItem("gachaRatings") || "{}"
  );

  delete ratings[trackId];

  localStorage.setItem(
    "gachaRatings",
    JSON.stringify(ratings)
  );

  displayLikedPlaylist();

  // 現在のガチャ結果も更新
  const todayTrack = getGachaHistory().find(
    item => item.date === getTodayDate()
  );

  if (todayTrack) {
    displayGachaResult(todayTrack);
  }
}


// ガチャ履歴を表示
function displayGachaHistory() {

  const container =
    document.getElementById("gachaHistory");

  const history = getGachaHistory();

  container.innerHTML = "";

  if (history.length === 0) {

    container.innerHTML =
      "<p>まだガチャ履歴はありません。</p>";

    return;
  }

  history.forEach((item, index) => {

    container.innerHTML += `
      <div class="ranking-item">

        ${
          item.image
            ? `<img src="${escapeHTML(item.image)}" alt="">`
            : ""
        }

        <div>
          <strong>${escapeHTML(item.name)}</strong>

          <p>${escapeHTML(item.artists.join(", "))}</p>

          <small>${escapeHTML(item.date)}</small>

          <br>

          <a href="${escapeHTML(item.url)}"
             target="_blank"
             rel="noopener noreferrer">
            Spotifyで聴く
          </a>
        </div>

      </div>
    `;

  });

}


// ガチャを回す
async function playGacha() {

  const button =
    document.getElementById("gachaButton");

  const today = getTodayDate();

  const history = getGachaHistory();

  // 今日すでに回しているか確認
  if (history.some(item => item.date === today)) {

    alert("今日のガチャはもう回しています！");

    button.disabled = true;

    return;
  }

  try {

    button.disabled = true;
    button.textContent = "抽選中...";

    const response =
      await fetch("/api/gacha");

    const track =
      await response.json();

    if (!response.ok) {
      throw new Error(track.error || "ガチャに失敗しました");
    }

    // 保存する曲情報
   const result = {
  id: Date.now(),
  name: track.name,
  artists: track.artists.map(a => a.name),
  image: track.album.images[0]?.url || "",
  url: track.external_urls.spotify,
  genre: track.genre,
  date: getTodayDate()
};

    // 履歴に追加
    history.unshift(result);

    localStorage.setItem(
      "gachaHistory",
      JSON.stringify(history)
    );

    // 結果と履歴を表示
    displayGachaResult(result);

    displayGachaHistory();

    button.textContent = "明日また挑戦してね！";

  } catch (error) {

    console.error(error);

    alert(error.message || "ガチャに失敗しました");

    button.disabled = false;
    button.textContent = "🎵 ガチャを回す！";

  }

}


// サイト起動時のガチャ確認
function loadGacha() {

  const button =
    document.getElementById("gachaButton");

  const today = getTodayDate();

  const history = getGachaHistory();

  // 履歴を表示
  displayGachaHistory();

  // 今日の結果があるか確認
  const todayResult =
    history.find(item => item.date === today);

  if (todayResult) {

    displayGachaResult(todayResult);

    button.disabled = true;
    button.textContent = "明日また挑戦してね！";

  }

}


// ボタンにイベントを設定
document.addEventListener("DOMContentLoaded", () => {
  loadGacha();
});
// 1日1回制限をリセット
function resetGacha() {
  if (!confirm("今日のガチャ制限をリセットしますか？")) {
    return;
  }

  // 保存されている履歴を取得
  let history = getGachaHistory();

  // 今日の履歴だけ削除（過去の履歴は残す）
  const today = getTodayDate();

  history = history.filter(item => item.date !== today);

  // 履歴を保存
  localStorage.setItem("gachaHistory", JSON.stringify(history));

  // ガチャ画面を更新
  const button = document.getElementById("gachaButton");
  const result = document.getElementById("gachaResult");

  button.disabled = false;
  button.textContent = "🎵 ガチャを回す！";

  result.innerHTML = "";

  displayGachaHistory();

  alert("今日のガチャ制限をリセットしました！");
}
document.addEventListener("DOMContentLoaded", () => {
  displayLikedPlaylist();
});