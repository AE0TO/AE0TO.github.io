/* scripts.js
   - Updates local/UTC time
   - Renders simple SVG gauge arcs based on data-score attribute
   - IntersectionObserver toggles theme variables for progressive visual evolution
*/

/* Time updater */
function updateTimes(){
  const localEl = document.getElementById('local-time');
  const utcEl = document.getElementById('utc-time');
  const now = new Date();
  const localStr = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  const utcStr = now.toUTCString().match(/\d{2}:\d{2}/)[0] + ' UTC';
  if(localEl) localEl.textContent = localStr;
  if(utcEl) utcEl.textContent = utcStr;
}
setInterval(updateTimes, 30*1000);
updateTimes();

/* Simple function to draw gauge arcs in the inline SVGs */
function drawGauges(){
  document.querySelectorAll('.gauge').forEach(g=>{
    const score = parseInt(g.getAttribute('data-score') || '50',10); // 0-100
    // Convert score to arc length (0-270 degrees)
    const deg = Math.max(0, Math.min(270, Math.round(score * 2.7)));
    // SVG arc path for a circle segment (approx)
    const start = polarToCartesian(18,18,14, -135);
    const end = polarToCartesian(18,18,14, -135 + deg);
    const largeArc = deg > 180 ? 1 : 0;
    const d = `M ${start.x} ${start.y} A 14 14 0 ${largeArc} 1 ${end.x} ${end.y}`;
    const arc = g.querySelector('.gauge-arc');
    if(arc) arc.setAttribute('d', d);
    // set text label
    const txt = g.querySelector('.gauge-text');
    if(txt){
      if(score >= 75) txt.textContent = 'Good';
      else if(score >= 45) txt.textContent = 'Fair';
      else txt.textContent = 'Poor';
    }
  });
}
function polarToCartesian(cx,cy,r,deg){
  const rad = (deg) * Math.PI/180.0;
  return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
}
drawGauges();

/* IntersectionObserver to evolve theme as user scrolls */
const sections = document.querySelectorAll('section');
const root = document.documentElement;
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const id = e.target.id;
    // Evolve theme based on section
    if(id === 'section-hero-console'){
      root.style.setProperty('--accent','#00ffd5');
      root.style.setProperty('--accent-2','#7b61ff');
      root.style.setProperty('--bg','#07101a');
    } else if(id === 'section-radio-intel'){
      root.style.setProperty('--accent','#ffd166');
      root.style.setProperty('--accent-2','#ff6b6b');
      root.style.setProperty('--bg','#08121a');
    } else if(id === 'section-career'){
      root.style.setProperty('--accent','#7b61ff');
      root.style.setProperty('--accent-2','#00ffd5');
      root.style.setProperty('--bg','#0b0f1a');
    }
  });
},{threshold:0.35});
sections.forEach(s=>io.observe(s));

/* Accessibility: keyboard focus outlines */
document.addEventListener('keydown', e=>{
  if(e.key === 'Tab') document.body.classList.add('show-focus');
});

/* Add to scripts.js or a new module */
/* Lightweight gallery controls with swipe support and keyboard accessibility */

document.querySelectorAll('.gallery').forEach(gallery => {
  const track = gallery.querySelector('.gallery-track');
  const prev = gallery.querySelector('.g-prev');
  const next = gallery.querySelector('.g-next');

  // Button navigation
  if(prev) prev.addEventListener('click', () => scrollByItem(track, -1));
  if(next) next.addEventListener('click', () => scrollByItem(track, 1));

  // Keyboard support
  gallery.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowRight') scrollByItem(track, 1);
    if(e.key === 'ArrowLeft') scrollByItem(track, -1);
  });

  // Touch swipe support
  let startX = 0, isDown = false;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
  track.addEventListener('touchend', e => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if(Math.abs(diff) > 40) scrollByItem(track, diff > 0 ? 1 : -1);
  });

  // Helper: scroll by one item width
  function scrollByItem(trackEl, direction){
    const item = trackEl.querySelector('.gallery-item');
    if(!item) return;
    const width = item.getBoundingClientRect().width + parseFloat(getComputedStyle(trackEl).gap || 10);
    trackEl.scrollBy({ left: direction * width, behavior: 'smooth' });
  }
});

/* Utility: function to update band condition programmatically
   Example usage: setBandCondition('band-20m','closed','Poor propagation to EU');
*/
function setBandCondition(bandId, condition, pathsText){
  const band = document.getElementById(bandId);
  if(!band) return;
  const cond = band.querySelector('.band-condition');
  const paths = band.querySelector('.band-paths');
  if(cond) cond.setAttribute('data-condition', condition);
  if(cond && cond.querySelector('.cond-text')) cond.querySelector('.cond-text').textContent = condition.charAt(0).toUpperCase() + condition.slice(1);
  if(paths && pathsText) paths.textContent = pathsText;
}

/* Add to scripts.js */

/* Simple function to populate a widget slot with HTML safely (developer responsibility) */
function populateWidgetSlot(slotId, htmlString){
  const slot = document.getElementById(slotId);
  if(!slot) return;
  // Basic sanitization: remove <script> tags to avoid accidental execution
  const sanitized = htmlString.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  slot.querySelector('.widget-body').innerHTML = sanitized;
}

/* Example: populateWidgetSlot('widget-slot-1','<div>Live tool placeholder</div>'); */

/* Lazy-load YouTube iframes when visible to save bandwidth */
const ytObserver = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const iframe = e.target.querySelector('iframe');
    if(iframe && !iframe.src){
      // Developer: set iframe.src to the desired embed URL when ready
      // e.g., iframe.src = 'https://www.youtube.com/embed?listType=user_uploads&list=UCkXjdDQ-db0xz8f4PKgKsag';
    }
    ytObserver.unobserve(e.target);
  });
},{threshold:0.25});
document.querySelectorAll('.video-card').forEach(card => ytObserver.observe(card));

/* Accessibility: announce updates to widget slots */
function announceWidgetUpdate(slotId, message){
  const slot = document.getElementById(slotId);
  if(slot){
    const live = slot;
    live.setAttribute('aria-live','polite');
    // Optionally set a visually hidden element for screen readers
    let sr = slot.querySelector('.sr-announcer');
    if(!sr){
      sr = document.createElement('div');
      sr.className = 'sr-announcer';
      sr.style.position = 'absolute';
      sr.style.left = '-9999px';
      slot.appendChild(sr);
    }
    sr.textContent = message;
  }
}

/* Jukebox behavior (add to scripts.js) */
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

  let current = 0;
  let isPlaying = false;

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
    if(audio.paused){
      audio.play();
    } else {
      audio.pause();
    }
  }

  // Event bindings
  playBtn.addEventListener('click', () => playPause());
  prevBtn.addEventListener('click', () => { loadTrack((current-1+playlist.length)%playlist.length); audio.play(); });
  nextBtn.addEventListener('click', () => { loadTrack((current+1)%playlist.length); audio.play(); });

  playlist.forEach((item, idx) => {
    item.addEventListener('click', () => { loadTrack(idx); audio.play(); });
    item.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadTrack(idx); audio.play(); }});
  });

  audio.addEventListener('play', () => {
    isPlaying = true;
    playBtn.textContent = '⏸';
    playBtn.setAttribute('aria-pressed','true');
    equalizer.classList.add('playing');
  });
  audio.addEventListener('pause', () => {
    isPlaying = false;
    playBtn.textContent = '▶';
    playBtn.setAttribute('aria-pressed','false');
    equalizer.classList.remove('playing');
  });

  audio.addEventListener('timeupdate', () => {
    if(audio.duration){
      const pct = (audio.currentTime / audio.duration) * 100;
      seek.value = pct;
      curTime.textContent = formatTime(audio.currentTime);
      durTime.textContent = formatTime(audio.duration);
    }
  });

  seek.addEventListener('input', () => {
    if(audio.duration) audio.currentTime = (seek.value/100) * audio.duration;
  });

  volume.addEventListener('input', () => { audio.volume = volume.value; });

  audio.addEventListener('ended', () => {
    // auto-advance
    loadTrack((current+1)%playlist.length);
    audio.play();
  });

  function formatTime(sec){
    if(isNaN(sec)) return '0:00';
    const m = Math.floor(sec/60);
    const s = Math.floor(sec%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  // Initialize first track if present
  if(playlist.length) loadTrack(0);

  // Accessibility: keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if(e.target.tagName === 'INPUT' || e.target.isContentEditable) return;
    if(e.key === ' '){ e.preventDefault(); playPause(); }
    if(e.key === 'ArrowRight'){ loadTrack((current+1)%playlist.length); audio.play(); }
    if(e.key === 'ArrowLeft'){ loadTrack((current-1+playlist.length)%playlist.length); audio.play(); }
  });
})();
