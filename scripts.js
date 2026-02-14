/* scripts.js
   Finalized JS for AE0TO Mission Control starter.
   - Smooth scrolling
   - Time updater
   - Gauge drawing
   - Lazy-load iframes
   - Theme evolution on scroll
   - Galleries with swipe
   - Jukebox controller
   - Oracle placeholder logic
   - Utility functions for programmatic updates
*/

/* Smooth scrolling for internal anchor links */
document.addEventListener('click', function(e){
  const a = e.target.closest('a[href^="#"]');
  if(!a) return;
  const href = a.getAttribute('href');
  if(href === '#' || href === '#!') return;
  const target = document.querySelector(href);
  if(target){
    e.preventDefault();
    target.scrollIntoView({behavior:'smooth',block:'start'});
    history.replaceState(null,'',href);
  }
});

/* Time updater for hero tile (local and UTC) */
(function updateTimes(){
  const localEl = document.getElementById('local-time');
  const utcEl = document.getElementById('utc-time');
  function tick(){
    const now = new Date();
    if(localEl) localEl.textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    if(utcEl) utcEl.textContent = now.toUTCString().match(/\d{2}:\d{2}/)[0] + ' UTC';
  }
  tick();
  setInterval(tick, 30*1000);
})();

/* Gauge drawing: draws arc path based on data-score attribute (0-100) */
(function drawGauges(){
  function polarToCartesian(cx,cy,r,deg){
    const rad = (deg) * Math.PI/180.0;
    return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
  }
  function render(){
    document.querySelectorAll('.gauge').forEach(g=>{
      const score = parseInt(g.getAttribute('data-score') || '50',10);
      const deg = Math.max(0, Math.min(270, Math.round(score * 2.7)));
      const start = polarToCartesian(18,18,14, -135);
      const end = polarToCartesian(18,18,14, -135 + deg);
      const largeArc = deg > 180 ? 1 : 0;
      const d = `M ${start.x} ${start.y} A 14 14 0 ${largeArc} 1 ${end.x} ${end.y}`;
      const arc = g.querySelector('.gauge-arc');
      if(arc) arc.setAttribute('d', d);
      const txt = g.querySelector('.gauge-text');
      if(txt){
        if(score >= 75) txt.textContent = 'Good';
        else if(score >= 45) txt.textContent = 'Fair';
        else txt.textContent = 'Poor';
      }
    });
  }
  render();
  window.addEventListener('resize', render);
})();

/* Lazy-load iframes and theme evolution */
(function(){
  const lazyObserver = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const iframe = e.target.querySelector('iframe[data-src]');
      if(iframe && !iframe.src){
        iframe.src = iframe.getAttribute('data-src');
      }
      lazyObserver.unobserve(e.target);
    });
  },{threshold:0.25});
  document.querySelectorAll('.data-card, .band-card, .video-card').forEach(el => lazyObserver.observe(el));

  const root = document.documentElement;
  const sections = document.querySelectorAll('section');
  const themeObserver = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const id = e.target.id;
      if(id === 'section-hero-console'){
        root.style.setProperty('--accent','#00ffd5');
        root.style.setProperty('--accent-2','#7b61ff');
        root.style.setProperty('--muted','#9fb3c8');
        root.style.setProperty('--text','#dff7ff');
      } else if(id === 'section-psychedelic-transition'){
        root.style.setProperty('--accent','#ffb86b');
        root.style.setProperty('--accent-2','#ff6fa3');
        root.style.setProperty('--muted','#f0e6d6');
        root.style.setProperty('--text','#111010');
        e.target.classList.add('state-midcentury');
      } else {
        root.style.setProperty('--accent','#ffd166');
        root.style.setProperty('--accent-2','#ff6b6b');
        root.style.setProperty('--muted','#bfcfd8');
        root.style.setProperty('--text','#eafcff');
      }
    });
  },{threshold:0.35});
  sections.forEach(s=>themeObserver.observe(s));
})();

/* Galleries with swipe and controls */
(function(){
  document.querySelectorAll('.gallery').forEach(gallery => {
    const track = gallery.querySelector('.gallery-track');
    const prev = gallery.querySelector('.g-prev');
    const next = gallery.querySelector('.g-next');

    function scrollByItem(direction){
      const item = track.querySelector('.gallery-item');
      if(!item) return;
      const gap = parseFloat(getComputedStyle(track).gap || 10);
      const width = item.getBoundingClientRect().width + gap;
      track.scrollBy({ left: direction * width, behavior: 'smooth' });
    }

    if(prev) prev.addEventListener('click', () => scrollByItem(-1));
    if(next) next.addEventListener('click', () => scrollByItem(1));

    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
    track.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if(Math.abs(diff) > 40) scrollByItem(diff > 0 ? 1 : -1);
    });
  });
})();

/* Jukebox controller */
(function(){
  const audio = document.getElementById('audio');
  const playBtn = document.getElementById('play-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const seek = document.getElementById('seek');
  const volume = document.getElementById('volume');
  const curTime = document.getElementById('cur-time');
  const durTime = document.getElementById('dur-time');
  const trackTitle = document.getElementById('track-title');
  const trackDesc = document.getElementById('track-desc');
  const playlist = Array.from(document.querySelectorAll('#playlist .track'));
  const equalizer = document.querySelector('.equalizer');

  if(!audio) return;
  let current = 0;

  function loadTrack(index){
    const item = playlist[index];
    if(!item) return;
    const src = item.getAttribute('data-src');
    const title = item.getAttribute('data-title') || 'Untitled';
    const desc = item.getAttribute('data-desc') || '';
    audio.src = src;
    audio.load();
    trackTitle.textContent = title;
    trackDesc.textContent = desc;
    playlist.forEach((p,i)=> p.classList.toggle('active', i===index));
    current = index;
  }

  function playPause(){
    if(!audio.src) return;
    if(audio.paused) audio.play(); else audio.pause();
  }

  playBtn && playBtn.addEventListener('click', () => playPause());
  prevBtn && prevBtn.addEventListener('click', () => { loadTrack((current-1+playlist.length)%playlist.length); audio.play(); });
  nextBtn && nextBtn.addEventListener('click', () => { loadTrack((current+1)%playlist.length); audio.play(); });

  playlist.forEach((item, idx) => {
    item.addEventListener('click', () => { loadTrack(idx); audio.play(); });
    item.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadTrack(idx); audio.play(); }});
  });

  audio.addEventListener('play', () => { playBtn.textContent = '⏸'; playBtn.setAttribute('aria-pressed','true'); equalizer.classList.add('playing'); });
  audio.addEventListener('pause', () => { playBtn.textContent = '▶'; playBtn.setAttribute('aria-pressed','false'); equalizer.classList.remove('playing'); });

  audio.addEventListener('timeupdate', () => {
    if(audio.duration){
      const pct = (audio.currentTime / audio.duration) * 100;
      seek.value = pct;
      curTime.textContent = formatTime(audio.currentTime);
      durTime.textContent = formatTime(audio.duration);
    }
  });

  seek && seek.addEventListener('input', () => { if(audio.duration) audio.currentTime = (seek.value/100) * audio.duration; });
  volume && volume.addEventListener('input', () => { audio.volume = volume.value; });

  audio.addEventListener('ended', () => { loadTrack((current+1)%playlist.length); audio.play(); });

  function formatTime(sec){ if(isNaN(sec)) return '0:00'; const m = Math.floor(sec/60); const s = Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }

  if(playlist.length) loadTrack(0);

  document.addEventListener('keydown', (e) => {
    if(e.target.tagName === 'INPUT' || e.target.isContentEditable) return;
    if(e.key === ' '){ e.preventDefault(); playPause(); }
    if(e.key === 'ArrowRight'){ loadTrack((current+1)%playlist.length); audio.play(); }
    if(e.key === 'ArrowLeft'){ loadTrack((current-1+playlist.length)%playlist.length); audio.play(); }
  });
})();

/* Oracle placeholder logic (static) */
(function(){
  const form = document.getElementById('oracle-form');
  const input = document.getElementById('oracle-input');
  const answer = document.getElementById('oracle-answer');

  if(!form || !input || !answer) return;

  const staticResponses = {
    'best band to work europe tonight': 'Example: 20m is often reliable for transatlantic contacts during daylight hours; verify with current solar indices.',
    'field power tip': 'Example: Use a LiFePO4 pack sized for your radio draw + 30% buffer; bring a small solar panel for extended ops.',
    'how to reduce noise': 'Example: perform an RF noise survey, use common-mode choke on feedline, and orient antenna away from noise sources.'
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim().toLowerCase();
    if(!q){
      answer.innerHTML = '<div class="placeholder">Please enter a question for the Oracle.</div>';
      return;
    }
    let found = null;
    Object.keys(staticResponses).forEach(k => {
      if(q.includes(k) || k.includes(q) || q.includes(k.split(' ')[0])) found = staticResponses[k];
    });
    if(found){
      answer.innerHTML = `<div class="example"><div class="a">${found}</div></div>`;
    } else {
      answer.innerHTML = `<div class="placeholder">Future AI integration: this Oracle will answer ham radio questions using a trusted knowledge base. Example static reply: "${staticResponses['best band to work europe tonight']}"</div>`;
    }
    input.value = '';
  });
})();

/* Utility functions */
function setBandCondition(bandId, condition, pathsText){
  const band = document.getElementById(bandId);
  if(!band) return;
  const cond = band.querySelector('.band-condition');
  const paths = band.querySelector('.band-paths');
  if(cond) cond.setAttribute('data-condition', condition);
  if(cond && cond.querySelector('.cond-text')) cond.querySelector('.cond-text').textContent = condition.charAt(0).toUpperCase() + condition.slice(1);
  if(paths && pathsText) paths.textContent = pathsText;
}

function injectAISummary(selector, text){
  const el = document.querySelector(selector);
  if(!el) return;
  el.textContent = text;
}
