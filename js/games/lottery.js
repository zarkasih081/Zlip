// ═══════════════════════════════════════════
//  5. LOTTERY
// ═══════════════════════════════════════════
let _lotoHist=[];
const BALL_COLORS=['#ef4444','#f97316','#eab308','#22c55e','#FFD54F','#3b82f6','#8b5cf6','#ec4899'];
let _isDrawingLoto = false;

function lotoPreset(count,max){ 
  if(_isDrawingLoto) return;
  $('lotoCount').value = count; 
  $('lotoMax').value = max; 
  drawLoto(); 
}

function clearLotoHist(){
  if(_isDrawingLoto) return;
  openConfirmModal(
    t('mdl_rst_lt_title'),
    t('mdl_rst_lt_msg'),
    () => {
      _lotoHist = [];
      renderLotoHist();
      const area = $('lotoBalls');
      if(area) area.innerHTML = `
        <div class="loto-ball" style="background:var(--bg3); opacity:0.8; animation:none; color:var(--t3); font-size:2.5rem; filter:grayscale(1);">?</div>
        <div class="loto-ball" style="background:var(--bg3); opacity:0.4; animation:none; color:var(--t3); font-size:2.5rem; filter:grayscale(1); transform:scale(0.8);">?</div>
        <div class="loto-ball" style="background:var(--bg3); opacity:0.15; animation:none; color:var(--t3); font-size:2.5rem; filter:grayscale(1); transform:scale(0.6);">?</div>
      `;
      msg(t('lt_hist_del') || t('lt_hist_del'));
    }
  );
}

function drawLoto(){
  if(_isDrawingLoto) return;
  
  const count=parseInt($('lotoCount').value)||6;
  const max=parseInt($('lotoMax').value)||49;
  
  if(count > max) return msg(t('lt_err_max') || t('lt_err_max'));
  if(count <= 0 || max < 2) return msg(t('lt_err_invalid') || t('lt_err_invalid'));
  
  const pool = Array.from({length:max}, (_,i)=>i+1);
  const drawn = []; 
  for(let i=0; i<count; i++){ 
    const ri = Math.floor(cryptoRandom()*(pool.length)); 
    drawn.push(pool.splice(ri,1)[0]); 
  }
  drawn.sort((a,b)=>a-b);
  
  const area = $('lotoBalls'); 
  area.innerHTML = '';
  
  // Lock UI
  _isDrawingLoto = true;
  const btn = $('btnLotoGen');
  if(btn) {
    btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Mengacak...';
    btn.classList.add('disabled');
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';
  }
  
  let i = 0;
  
  function dropNextBall() {
    if(i >= count) {
      // Done drawing
      _isDrawingLoto = false;
      if(btn) {
        btn.innerHTML = t('lt_btn_gen');
        btn.classList.remove('disabled');
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      }
      
      // Save History
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
      _lotoHist.unshift({nums: drawn, time: timeStr});
      if(_lotoHist.length > 20) _lotoHist.pop();
      renderLotoHist();
      
      conf();
      playWin();
      addGlobalHistory(t('nav_lt'), drawn.join(', '));
      if (typeof announceA11y === 'function') announceA11y(`Angka lotere: ${drawn.join(', ')}`);
      return;
    }
    
    // Create ball
    const n = drawn[i];
    const ball = document.createElement('div'); 
    ball.className = 'loto-ball';
    ball.style.background = BALL_COLORS[i % BALL_COLORS.length];
    ball.textContent = n; 
    area.appendChild(ball);
    
    // Play tick sound for each ball
    if(typeof playTick === 'function') playTick();
    
    i++;
    setTimeout(dropNextBall, 500); // 500ms delay between balls
  }
  
  dropNextBall();
}

function renderLotoHist(){
  const hist = $('lotoHist'); 
  if(!hist) return;
  hist.innerHTML = '';
  _lotoHist.forEach(({nums, time}) => {
    const row = document.createElement('div'); 
    row.className = 'loto-hist-row';
    const balls = nums.map((n, i) => `<span class="loto-hist-num" style="background:${BALL_COLORS[i % BALL_COLORS.length]}">${n}</span>`).join(' ');
    row.innerHTML = `${balls}<span class="loto-hist-time">${time}</span>`;
    hist.appendChild(row);
  });
}
