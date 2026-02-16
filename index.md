## Jukebox

<div id="jukebox-ui">
  <button class="juke-btn" onclick="prevTrack()">⟵ Prev</button>
  <button class="juke-btn" onclick="togglePlay()">▶ / ⏸</button>
  <button class="juke-btn" onclick="nextTrack()">Next ⟶</button>
  <button class="juke-btn" onclick="shuffleTrack()">🔀 Shuffle</button>
  <button class="juke-btn" onclick="toggleRepeat()">🔁 Repeat</button>
  <br>
  <input id="volume" type="range" min="0" max="1" step="0.01" oninput="audio.volume=this.value">
</div>

<div id="progress-container" onclick="seek(event)">
  <div id="progress-bar"></div>
</div>

<div id="now-playing">Loading…</div>

<style>
.juke-btn {
  background: rgba(0, 255, 255, 0.08);
  border: 1px solid rgba(0, 255, 255, 0.4);
  padding: 12px 22px;
  margin: 6px;
  color: cyan;
  font-family: monospace;
  font-size: 16px;
  cursor: pointer;
  border-radius: 6px;
  transition: 0.2s ease;
  box-shadow: 0 0 8px rgba(0,255,255,0.4);
}
.juke-btn:hover {
  box-shadow: 0 0 14px rgba(0,255,255,0.8);
  transform: scale(1.05);
}
.juke-btn:active {
  transform: scale(0.92);
  box-shadow: 0 0 4px rgba(0,255,255,0.3);
}
#progress-container {
  width: 100%;
  height: 10px;
  background: rgba(0,255,255,0.1);
  border: 1px solid rgba(0,255,255,0.3);
  margin-top: 10px;
  cursor: pointer;
}
#progress-bar {
  height: 100%;
  width: 0%;
  background: cyan;
  box-shadow: 0 0 10px cyan;
}
#volume {
  width: 150px;
  margin-top: 10px;
}
#now-playing {
  margin-top: 10px;
  font-family: monospace;
  color: cyan;
  white-space: nowrap;
  overflow: hidden;
  animation: marquee 12s linear infinite;
}
@keyframes marquee {
  0% { text-indent: 100%; }
  100% { text-indent: -100%; }
}
</style>

<script src="jukebox.js"></script>
