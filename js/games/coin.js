// ═══════════════════════════════════════════
//  3. COIN (Mega 3D)
// ═══════════════════════════════════════════
let _cCount=1, _cFlipping=false, _cTheme='gold';
let _coinStatH=0, _coinStatT=0;
let _coinFlipCount = 0;
let _lastResArray = ['H']; // Default to Heads on initial load
let _lastFlipTime = 0;

document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'visible') {
    setTimeout(() => {
      if(_cFlipping && Date.now() - _lastFlipTime > 2000) {
        _cFlipping = false;
        updateIdleCoins();
      }
    }, 2000);
  }
});

function setCoinTheme(th, btn) {
  if(_cFlipping) return;
  _cTheme = th;
  document.querySelectorAll('#p-cn .d-type-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  updateIdleCoins();
}

function adjCoinCount(d){ 
  if(_cFlipping) return;
  _cCount = Math.max(1, Math.min(10, _cCount+d)); 
  $('cCount').textContent = _cCount; 
  updateIdleCoins();
}

function resetCoinStats() {
  _coinStatH = 0; _coinStatT = 0;
  updateCoinStats();
}

function updateCoinStats() {
  $('cStatH').textContent = _coinStatH;
  $('cStatT').textContent = _coinStatT;
  let total = _coinStatH + _coinStatT;
  if(total === 0) {
    $('cStatHBar').style.width = '0%';
    $('cStatHBar').textContent = '';
    $('cStatTBar').style.width = '0%';
    $('cStatTBar').textContent = '';
  } else {
    let pHead = Math.round((_coinStatH/total)*100);
    let pTail = Math.round((_coinStatT/total)*100);
    $('cStatHBar').style.width = pHead + '%';
    $('cStatHBar').textContent = pHead > 10 ? pHead + '%' : '';
    $('cStatTBar').style.width = pTail + '%';
    $('cStatTBar').textContent = pTail > 10 ? pTail + '%' : '';
  }
}

function create3DCoin() {
  const pWrap = document.createElement('div');
  pWrap.className = `coin-perspective coin-theme-${_cTheme}`;
  
  const wrap = document.createElement('div');
  wrap.className = 'coin-3d rolling';
  
  const heads = document.createElement('div');
  heads.className = 'coin-face coin-heads';
  heads.style.webkitBackfaceVisibility = 'hidden';
  heads.style.backfaceVisibility = 'hidden';
  heads.innerHTML = '<img src="assets/images/coin-heads.webp" style="width:100%; height:100%; border-radius:50%; object-fit:cover; pointer-events:none; position:relative; z-index:5; opacity: 1; filter: contrast(1.06) saturate(1.08);">';
  
  const tails = document.createElement('div');
  tails.className = 'coin-face coin-tails';
  tails.style.webkitBackfaceVisibility = 'hidden';
  tails.style.backfaceVisibility = 'hidden';
  tails.innerHTML = '<img src="assets/images/coin-tails.webp" style="width:100%; height:100%; border-radius:50%; object-fit:cover; pointer-events:none; position:relative; z-index:5; opacity: 1; filter: contrast(1.06) saturate(1.08);">';
  
  // 3D Cylinder Edge Layers
  const edgeWrap = document.createElement('div');
  edgeWrap.className = 'coin-edge-wrap';
  for(let i=1; i<=8; i++) { // 8 layers of thickness (from -4px to 4px)
    let layer = document.createElement('div');
    layer.className = 'coin-layer';
    layer.style.transform = `translateZ(${i - 4}px)`;
    edgeWrap.appendChild(layer);
  }
  
  wrap.appendChild(heads);
  wrap.appendChild(tails);
  wrap.appendChild(edgeWrap);
  pWrap.appendChild(wrap);
  
  return { pWrap, wrap };
}

function updateIdleCoins() {
  if(_cFlipping) return;
  const stg = $('cS');
  if(!stg) return;
  
  stg.innerHTML = '';
  for(let i=0; i<_cCount; i++) {
    const { pWrap, wrap } = create3DCoin();
    wrap.classList.remove('rolling');
    
    let isHeads = true;
    if(_lastResArray && i < _lastResArray.length) {
      isHeads = (_lastResArray[i] === 'H');
    }
    
    wrap.style.transform = isHeads ? 'rotateY(0deg) rotateX(0deg)' : 'rotateY(180deg) rotateX(0deg)';
    stg.appendChild(pWrap);
  }
}

function flipCoin(){
  if(_cFlipping) return; 
  _cFlipping=true;
  _lastFlipTime = Date.now();
  
  const stg=$('cS');
  if(!stg) return;
  
  stg.innerHTML=''; 
  $('cR').innerHTML='<div style="font-size:1.3rem;font-weight:800;color:var(--t2);animation:pulseText 0.5s ease-in-out infinite alternate">Melempar...</div>';
  
  _coinFlipCount++;
  _lastResArray = []; // Reset and rebuild for this flip
  
  for(let i=0; i<_cCount; i++) {
    const isHeads = cryptoRandom() > 0.5;
    _lastResArray.push(isHeads ? 'H' : 'T');
    
    const { pWrap, wrap } = create3DCoin();
    
    // Initial random rotation for "spinning in air"
    const baseTurn = _coinFlipCount * 360 * 6; // Spin very fast
    const initialRot = baseTurn - 720;
    wrap.style.transform = `rotateY(${initialRot}deg) rotateX(${Math.random()*90}deg)`;
    
    stg.appendChild(pWrap);
    
    setTimeout(() => {
      pWrap.classList.add('jump');
      if(typeof playTickPremium === 'function') playTickPremium();
      else playTick();
    }, i * 60);
    
    setTimeout(() => {
      wrap.classList.remove('rolling');
      // Calculate landing rotation
      let finalY = baseTurn;
      if(!isHeads) finalY += 180; // Tails
      
      wrap.style.transform = `rotateY(${finalY}deg) rotateX(0deg)`;
    }, 50 + (i * 60));
  }
  
  setTimeout(()=>{
    let headsCount = _lastResArray.filter(x => x === 'H').length;
    let tailsCount = _lastResArray.filter(x => x === 'T').length;
    
    _coinStatH += headsCount;
    _coinStatT += tailsCount;
    updateCoinStats();
    
    let resHtml = '';
    if(_cCount === 1) {
      resHtml = `<div style="font-size:2.8rem;font-weight:900;color:var(--acc);line-height:1;text-shadow:0 4px 16px rgba(255,179,0,0.3)">${_lastResArray[0]==='H'?t('cn_res_head'):t('cn_res_tail')}</div>`;
    } else {
      resHtml = `
        <div style="font-size:2.2rem;font-weight:900;color:var(--acc);line-height:1;margin-bottom:8px">${headsCount} Gambar, ${tailsCount} Angka</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;">
          ${_lastResArray.map(r => `<span style="background:var(--bg3);border:1px solid var(--glass-border);border-radius:6px;padding:2px 8px;font-size:0.75rem;color:var(--t1);font-weight:700">${r==='H'?t('cn_head_cap'):t('cn_tail_cap')}</span>`).join('')}
        </div>
      `;
    }
    
    $('cR').innerHTML = resHtml;
    
    // Add to History
    let histWrap = $('cHist');
    if(histWrap.innerHTML.includes('—')) histWrap.innerHTML = '';
    
    const chip = document.createElement('div');
    chip.className = 'sp-hist-chip';
    chip.style.fontSize = '0.75rem';
    chip.style.padding = '4px 12px';
    chip.innerHTML = `<span style="color:var(--t3)">${_cCount} Koin ➔</span> <strong style="color:var(--acc)">${_cCount===1?(_lastResArray[0]==='H'?t('cn_head_cap'):t('cn_tail_cap')):(headsCount+'G, '+tailsCount+'A')}</strong>`;
    histWrap.prepend(chip);
    if(histWrap.children.length > 20) histWrap.removeChild(histWrap.lastChild);
    
    if(typeof playWinPremium === 'function') playWinPremium();
    else playWin();
    if (typeof announceA11y === 'function') announceA11y('Koin menunjukkan ' + (_cCount===1?(_lastResArray[0]==='H'?'Gambar':'Angka'):(headsCount+' Gambar, '+tailsCount+' Angka')));
    _cFlipping=false;
  }, 1500 + (_cCount * 60)); // Wait for all animations to finish
}


function clearCHist() {
  $('cHist').innerHTML = '<span style="color:var(--t3)">—</span>';
  if (typeof playTick === 'function') playTick();
}
