// Basic site wiring: loads config, populates UI, and provides jukebox controls.
// This starter avoids external APIs so you can publish immediately.

async function loadConfig(){
  const res = await fetch('assets/config.json');
  return res.json();
}

function populateHeader(cfg){
  document.getElementById('callsign').textContent = cfg.callsign || 'AE0TO';
  document.getElementById('owner').textContent = `${cfg.name} — QTH ${cfg.qth}`;
}

function setupJukebox(cfg){
  const playlistEl = document.getElementById('playlist');
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const audio = new Audio();
  let idx = 0;
  const list = cfg.jukebox || [];
  if(list.length===0){
    playlistEl.textContent = 'No tracks configured. Edit assets/config.json';
    playBtn.disabled = true;
    pauseBtn.disabled = true;
    return;
  }
  playlistEl.innerHTML = list.map((u,i)=>`<div>${i+1}. ${u}</div>`).join('');
  playBtn.addEventListener('click', ()=>{
    audio.src = list[idx];
    audio.play().catch(e=>console.warn('Playback blocked',e));
  });
  pauseBtn.addEventListener('click', ()=>audio.pause());
}

function populateMilitary(){
  fetch('content/military.md').then(r=>r.text()).then(md=>{
    document.getElementById('military-content').innerHTML = md.replace(/\n/g,'<br>');
  });
}

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
  // Oracle hook
  document.getElementById('oracle-ask').addEventListener('click', ()=>{
    const q = document.getElementById('oracle-input').value.trim();
    if(!q) return;
    document.getElementById('oracle-answer').textContent = 'Oracle is thinking... (local mode)';
    setTimeout(()=>document.getElementById('oracle-answer').textContent = 'Local Oracle: I can answer that. (This starter is offline; connect a knowledge source to enable full answers.)',800);
  });
}

init();
