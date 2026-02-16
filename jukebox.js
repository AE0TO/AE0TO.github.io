// ===============================
// AE0TO Jukebox Engine
// ===============================

// Define your playlist here (URLs or relative paths)
let playlist = [
  "track1.mp3",
  "track2.mp3",
  "track3.mp3"
];

let currentIndex = 0;
let repeatMode = "all"; // "one" or "all"

const audio = new Audio();
audio.preload = "auto";
audio.volume = 0.8;

// Fade-in
function fadeIn() {
  audio.volume = 0;
  let v = 0;
  let fade = setInterval(() => {
    v += 0.02;
    if (v >= 0.8) { audio.volume = 0.8; clearInterval(fade); }
    else audio.volume = v;
  }, 50);
}

// Fade-out
function fadeOut(callback) {
  let v = audio.volume;
  let fade = setInterval(() => {
    v -= 0.02;
    if (v <= 0) {
      audio.volume = 0;
      clearInterval(fade);
      callback();
    } else audio.volume = v;
  }, 50);
}

// Load track
function loadTrack(index) {
  if (playlist.length === 0) return;
  currentIndex = (index + playlist.length) % playlist.length;
  audio.src = playlist[currentIndex];
  fadeIn();
  audio.play();
  updateNowPlaying();
}

// Play/Pause
function togglePlay() {
  if (audio.paused) audio.play();
  else audio.pause();
}

// Next / Prev
function nextTrack() { fadeOut(() => loadTrack(currentIndex + 1)); }
function prevTrack() { fadeOut(() => loadTrack(currentIndex - 1)); }

// Shuffle
function shuffleTrack() {
  let newIndex = currentIndex;
  while (newIndex === currentIndex && playlist.length > 1) {
    newIndex = Math.floor(Math.random() * playlist.length);
  }
  fadeOut(() => loadTrack(newIndex));
}

// Repeat toggle
function toggleRepeat() {
  repeatMode = repeatMode === "all" ? "one" : "all";
  alert("Repeat mode: " + repeatMode.toUpperCase());
}

// Auto-advance
audio.addEventListener("ended", () => {
  if (repeatMode === "one") loadTrack(currentIndex);
  else nextTrack();
});

// Progress bar update
audio.addEventListener("timeupdate", () => {
  const bar = document.getElementById("progress-bar");
  if (!bar || !audio.duration) return;
  bar.style.width = (audio.currentTime / audio.duration) * 100 + "%";
});

// Seek
function seek(e) {
  const rect = e.target.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  if (!isFinite(audio.duration)) return;
  audio.currentTime = pos * audio.duration;
}

// Now Playing
function updateNowPlaying() {
  const el = document.getElementById("now-playing");
  if (!el) return;
  el.textContent = `Track ${currentIndex + 1}/${playlist.length} — ${playlist[currentIndex]}`;
}

// Keyboard controls
document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    togglePlay();
  }
  if (e.code === "ArrowRight") nextTrack();
  if (e.code === "ArrowLeft") prevTrack();
});

// Init
document.addEventListener("DOMContentLoaded", () => {
  if (playlist.length > 0) loadTrack(0);
});
