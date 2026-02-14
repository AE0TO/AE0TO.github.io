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
