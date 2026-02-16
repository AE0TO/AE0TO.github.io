// ---------------------------------------------------------
// AE0TO — FULL DASHBOARD ENGINE
// ---------------------------------------------------------

// Load config file
async function loadConfig(){
  const res = await fetch('assets/config.json');
  return res.json();
}

// Populate header with callsign, name, QTH
function populateHeader(cfg){
  document.getElementById('callsign').textContent = cfg.callsign || 'AE0TO';
  document.getElementById('owner').textContent = `${cfg.name} — QTH ${cfg.qth}`;
}

// Jukebox engine
function setupJukebox(cfg){
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const playlistEl = document.getElementById('playlist');
  const audio = new Audio();

  const list = cfg.jukebox || [];
  if(list.length === 0){
    playlistEl.textContent = 'No tracks configured.';
    playBtn.disabled = true;
    pauseBtn.disabled = true;
    return;
  }

  // Hide filenames
  playlistEl.style.display = "none";

  // Shuffle helper
  function randomTrack(){
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }

  playBtn.addEventListener('click', ()=>{
    audio.src = randomTrack();
    audio.play().catch(e=>console.warn('Playback blocked', e));
  });

  pauseBtn.addEventListener('click', ()=>audio.pause());

  // Auto‑shuffle when a track ends
  audio.addEventListener('ended', ()=>{
    audio.src = randomTrack();
    audio.play();
  });
}

// Load military markdown
function populateMilitary(){
  fetch('content/military.md')
    .then(r=>r.text())
    .then(md=>{
      document.getElementById('military-content').innerHTML = md.replace(/\n/g,'<br>');
    });
}

// ---------------------------------------------------------
// LIVE K-INDEX FETCH — AE0TO DASHBOARD
// ---------------------------------------------------------
async function updateKIndex() {
  try {
    const res = await fetch("https://services.swpc.noaa.gov/json/planetary_k_index_1m.json");
    const data = await res.json();

    // Last entry contains the most recent K-index
    const latest = data[data.length - 1];
    const k = latest.kp_index;

    document.querySelector('#g-k span').textContent = k;

    // Glow intensity based on K-index
    const gauge = document.getElementById('g-k');
    gauge.style.boxShadow = `
      0 0 ${4 + k * 2}px rgba(0,255,255,0.6),
      0 0 ${8 + k * 3}px rgba(0,255,255,0.4)
    `;
  } catch (err) {
    console.warn("K-index fetch failed:", err);
    document.querySelector('#g-k span').textContent = "--";
  }
}

// ---------------------------------------------------------
// LIVE SFI FETCH — SOLAR FLUX INDEX
// ---------------------------------------------------------
async function updateSFI() {
  try {
    const res = await fetch("https://services.swpc.noaa.gov/json/solar_cycle/solar_cycle.json");
    const data = await res.json();

    const latest = data[data.length - 1];
    const sfi = latest.sfi;

    document.querySelector('#g-sfi span').textContent = sfi;

    const gauge = document.getElementById('g-sfi');
    gauge.style.boxShadow = `
      0 0 ${4 + sfi/40}px rgba(0,255,255,0.6),
      0 0 ${8 + sfi/20}px rgba(0,255,255,0.4)
    `;
  } catch (err) {
    console.warn("SFI fetch failed:", err);
    document.querySelector('#g-sfi span').textContent = "--";
  }
}

// ---------------------------------------------------------
// LIVE A-INDEX FETCH
// ---------------------------------------------------------
async function updateAIndex() {
  try {
    const res = await fetch("https://services.swpc.noaa.gov/json/planetary_k_index_1m.json");
    const data = await res.json();

    const latest = data[data.length - 1];
    const a = latest.a_index;

    document.querySelector('#g-a span').textContent = a;

    const gauge = document.getElementById('g-a');
    gauge.style.boxShadow = `
      0 0 ${4 + a}px rgba(0,255,255,0.6),
      0 0 ${8 + a*1.5}px rgba(0,255,255,0.4)
    `;
  } catch (err) {
    console.warn("A-index fetch failed:", err);
    document.querySelector('#g-a span').textContent = "--";
  }
}

// ---------------------------------------------------------
// LIVE TEC FETCH — TOTAL ELECTRON CONTENT
// ---------------------------------------------------------
async function updateTEC() {
  try {
    const res = await fetch("https://services.swpc.noaa.gov/json/tec/tec.json");
    const data = await res.json();

    const latest = data[data.length - 1];
    const tec = latest.tec;

    document.querySelector('#g-tec span').textContent = tec;

    const gauge = document.getElementById('g-tec');
    gauge.style.boxShadow = `
      0 0 ${4 + tec/2}px rgba(0,255,255,0.6),
      0 0 ${8 + tec/1.5}px rgba(0,255,255,0.4)
    `;
  } catch (err) {
    console.warn("TEC fetch failed:", err);
    document.querySelector('#g-tec span').textContent = "--";
  }
}

// ---------------------------------------------------------
// INIT — RUN EVERYTHING
// ---------------------------------------------------------
async function init(){
  const cfg = await loadConfig();
  populateHeader(cfg);
  setupJukebox(cfg);
  populateMilitary();

  // Placeholder gauge values
  document.querySelector('#g-sfi span').textContent = '--';
  document.querySelector('#g-k span').textContent = '--';
  document.querySelector('#g-a span').textContent = '--';
  document.querySelector('#g-tec span').textContent = '--';

  // LIVE DATA
  updateKIndex();
  updateSFI();
  updateAIndex();
  updateTEC();

  // Auto-refresh every 60 seconds
  setInterval(updateKIndex, 60000);
  setInterval(updateSFI, 60000);
  setInterval(updateAIndex, 60000);
  setInterval(updateTEC, 60000);

  // Oracle hook
  document.getElementById('oracle-ask').addEventListener('click', ()=>{
    const q = document.getElementById('oracle-input').value.trim();
    if(!q) return;
    document.getElementById('oracle-answer').textContent = 'Oracle is thinking... (local mode)';
    setTimeout(()=>{
      document.getElementById('oracle-answer').textContent =
        'Local Oracle: I can answer that. (This starter is offline; connect a knowledge source to enable full answers.)';
    },800);
  });
}

init();
