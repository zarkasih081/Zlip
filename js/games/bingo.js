// ═══════════════════════════════════════════
//  4. BINGO
// ═══════════════════════════════════════════
let _bgDr=[];
let _bgAutoDrawInt = null;
let _bgMax = 75;

const BINGO_COLS=['B','I','N','G','O'];

function getBingoMax() {
  const sel = $('bgMode');
  return sel ? parseInt(sel.value, 10) : 75;
}

function getBingoLetter(n){
  const perCol = _bgMax / 5;
  let idx = Math.ceil(n / perCol) - 1;
  if(idx < 0) idx = 0;
  if(idx > 4) idx = 4;
  return BINGO_COLS[idx];
}

function initBg(){
  _bgMax = getBingoMax();
  if($('bgMaxText')) $('bgMaxText').textContent = _bgMax;
  
  const g=$('bgG'), cl=$('bgColLabels');
  if(!g) return;
  g.innerHTML=''; 
  if(cl) cl.innerHTML='';
  
  const perCol = _bgMax / 5;
  g.style.gridTemplateColumns = `repeat(${perCol}, minmax(15px, 36px))`;
  g.style.justifyContent = 'center';
  
  if(cl) {
    cl.style.gridTemplateColumns = `repeat(${perCol}, minmax(15px, 36px))`;
    cl.style.justifyContent = 'center';
    cl.style.display = 'none';
  }
  
  for(let i=1;i<=_bgMax;i++){
    const d=document.createElement('div'); 
    d.className='bg-num'; 
    d.id='bgn'+i; 
    d.textContent=i; 
    
    // Add base color class if drawn
    if(_bgDr.includes(i)) {
       const letter = getBingoLetter(i).toLowerCase();
       d.classList.add('on', `${letter}-on`);
    }
    
    g.appendChild(d);
  }
  $('bgCount').textContent = _bgDr.length;
}

function drawBg(){
  if(_bgDr.length >= _bgMax) {
    if(_bgAutoDrawInt) toggleAutoDrawBg();
    return msg(t('bg_err_full') || t('bg_err_full'));
  }
  
  let n; 
  do {
    n = Math.floor(cryptoRandom() * _bgMax)+1;
  } while(_bgDr.includes(n));
  
  _bgDr.push(n);
  const letter=getBingoLetter(n);
  const colLetter = letter.toLowerCase();
  
  // Create 3D Ball
  const tray = $('bgBallTray');
  tray.innerHTML = ''; // clear previous
  
  const ball = document.createElement('div');
  ball.className = `bingo-ball bg-col-${colLetter}`;
  ball.innerHTML = `
    <div class="bingo-ball-letter">${letter}</div>
    <div class="bingo-ball-num">${n}</div>
  `;
  tray.appendChild(ball);
  
  // Highlight Grid Number
  const el=$('bgn'+n); 
  if(el) {
    el.classList.add('on', `${colLetter}-on`, 'new-draw');
    setTimeout(()=>el.classList.remove('new-draw'), 500);
  }
  
  $('bgCount').textContent = _bgDr.length;
  
  // History chips
  const hist=$('bgHist');
  const chip=document.createElement('div'); 
  chip.className=`bg-hist-num ${colLetter}-on`;
  chip.textContent=`${letter}${n}`; 
  hist.insertBefore(chip,hist.firstChild);
  
  playWin();
  if (typeof announceA11y === 'function') announceA11y(`Bingo: ${letter}${n}`);
}

function toggleAutoDrawBg() {
  const btn = $('btnAutoBg');
  if(_bgAutoDrawInt) {
    clearInterval(_bgAutoDrawInt);
    _bgAutoDrawInt = null;
    btn.innerHTML = t('bg_btn_auto');
    if (window.lucide) lucide.createIcons({ root: btn });
    btn.classList.remove('btn-r');
    btn.classList.add('btn-p');
  } else {
    if(_bgDr.length >= _bgMax) return msg(t('bg_err_full') || t('bg_err_full'));
    drawBg(); // Draw immediately
    _bgAutoDrawInt = setInterval(drawBg, 3500); // Draw every 3.5 seconds
    btn.innerHTML = t('bg_btn_stop');
    if (window.lucide) lucide.createIcons({ root: btn });
    btn.classList.remove('btn-p');
    btn.classList.add('btn-r');
  }
}

function rstBg(force = false){ 
  const doReset = () => {
    if(_bgAutoDrawInt) toggleAutoDrawBg();
    _bgDr=[]; 
    
    const tray = $('bgBallTray');
    if(tray) tray.innerHTML = `
      <div class="bingo-ball" style="background:var(--bg3); opacity:0.6; filter:grayscale(1); animation:none;">
        <div class="bingo-ball-letter" style="color:var(--t3)">?</div>
        <div class="bingo-ball-num" style="color:var(--t3)">-</div>
      </div>
    `;
    
    if($('bgHist')) $('bgHist').innerHTML=''; 
    initBg(); 
    msg(t('bg_rst') || 'Papan di-reset!');
  };

  if(force || _bgDr.length === 0) {
    doReset();
    return;
  }

  openConfirmModal(t('mdl_rst_bg_title'), t('mdl_rst_bg_msg'), doReset);
}

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('bgMode')?.addEventListener('change', initBg);
  });
} else {
  document.getElementById('bgMode')?.addEventListener('change', initBg);
}
