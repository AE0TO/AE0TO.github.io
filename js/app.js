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
  setInterval(updateKIndex, 60000);

  // Oracle hook
  document.getElementById('oracle-ask').addEventListener('click', ()=>{
    const q = document.getElementById('oracle-input').value.trim();
    if(!q) return;
    document.getElementById('oracle-answer').textContent = 'Oracle is thinking... (local mode)';
    setTimeout(()=>document.getElementById('oracle-answer').textContent = 'Local Oracle: I can answer that. (This starter is offline; connect a knowledge source to enable full answers.)',800);
  });
}
