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

    createRankings(data);
 
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