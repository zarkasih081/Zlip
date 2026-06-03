// ═══════════════════════════════════════════
//  2. DICE (3D & RPG Upgrade)
// ═══════════════════════════════════════════
let _dCount=2, _dType=6, _dMod=0, _dCond='normal', _dTheme='default';
let _diceRollCount = 0;
let _lastDiceResArray = [6, 6]; // Initial default
let _diceStats = {};

function setDTheme(theme, btn) {
  _dTheme = theme;
  document.querySelectorAll('#diceThemeRow .d-type-btn').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  updateIdleDice();
}

function adjDice(d){ 
  _dCount = Math.max(1, Math.min(10, _dCount+d)); 
  $('dCount').textContent = _dCount; 
  updateIdleDice();
}

function adjMod(d){
  _dMod += d;
  $('dMod').textContent = _dMod >= 0 ? `+${_dMod}` : _dMod;
}

function setDType(t, btn){ 
  _dType = t; 
  document.querySelectorAll('.d-type-row .d-type-btn').forEach(b => b.classList.remove('on')); 
  if(btn) btn.classList.add('on'); 
  else {
    let b = Array.from(document.querySelectorAll('.d-type-row .d-type-btn')).find(el => el.textContent === `D${t}`);
    if(b) b.classList.add('on');
  }
  updateIdleDice();
  renderDiceStats();
}

function loadDPreset(c, t, m, cond) {
  _dCount = c; $('dCount').textContent = _dCount;
  setDType(t);
  _dMod = m; $('dMod').textContent = _dMod >= 0 ? `+${_dMod}` : _dMod;
  _dCond = cond; $('dCond').value = cond;
  roll();
}

function createD6Face(num) {
  const f = document.createElement('div');
  f.className = `die-face face-${num}`;
  
  if (num === 1) f.innerHTML = `<div class="die-dot dot-c" style="width:18px;height:18px;background:var(--rose)"></div>`;
  else if (num === 2) f.innerHTML = `<div class="die-dot dot-tl"></div><div class="die-dot dot-br"></div>`;
  else if (num === 3) f.innerHTML = `<div class="die-dot dot-tl"></div><div class="die-dot dot-c"></div><div class="die-dot dot-br"></div>`;
  else if (num === 4) f.innerHTML = `<div class="die-dot dot-tl"></div><div class="die-dot dot-tr"></div><div class="die-dot dot-bl"></div><div class="die-dot dot-br"></div>`;
  else if (num === 5) f.innerHTML = `<div class="die-dot dot-tl"></div><div class="die-dot dot-tr"></div><div class="die-dot dot-c"></div><div class="die-dot dot-bl"></div><div class="die-dot dot-br"></div>`;
  else if (num === 6) f.innerHTML = `<div class="die-dot dot-tl"></div><div class="die-dot dot-ml"></div><div class="die-dot dot-bl"></div><div class="die-dot dot-tr"></div><div class="die-dot dot-mr"></div><div class="die-dot dot-br"></div>`;
  
  return f;
}

function updateIdleDice() {
  const stg=$('dS');
  if(!stg || ($('dR').innerHTML && $('dR').innerHTML.includes('Mengocok'))) return;
  
  stg.innerHTML=''; 
  for(let i=0;i<_dCount;i++){
    const v = (_lastDiceResArray && i < _lastDiceResArray.length) ? _lastDiceResArray[i] : _dType;
    
    if(_dType===6) {
      const pWrap = document.createElement('div');
      pWrap.className = `die-perspective die-theme-${_dTheme}`;
      
      const wrap = document.createElement('div');
      wrap.className = 'die-3d-wrap';
      
      for(let f=1; f<=6; f++) {
        wrap.appendChild(createD6Face(f));
      }
      
      let finalX = 0;
      let finalY = 0;
      switch(v) {
        case 1: break;
        case 6: finalY += 180; break;
        case 2: finalY -= 90; break;
        case 5: finalY += 90; break;
        case 3: finalX -= 90; break;
        case 4: finalX += 90; break;
      }
      wrap.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;
      
      pWrap.appendChild(wrap);
      stg.appendChild(pWrap);
    } else {
      const df = document.createElement('div'); 
      df.className = `die-flat roll-anim die-theme-${_dTheme}`;
      df.innerHTML = `<span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:${_dType>12?1.4:1.8}rem;font-weight:900;color:var(--acc)">${v}</span><span style="position:absolute;bottom:5px;right:8px;font-size:.55rem;color:var(--t3);font-weight:700">D${_dType}</span>`;
      stg.appendChild(df);
    }
  }
}

function roll(){
  if(_dCount <= 0 || _dType <= 0) {
    if(typeof msg === 'function') msg(t('msg_err_invalid') || 'Invalid dice count/type');
    return;
  }

  const stg=$('dS'), res=[];
  if(!stg) return;
  
  _dCond = $('dCond').value;
  _diceRollCount++;
  
  stg.innerHTML=''; 
  $('dR').innerHTML='<div style="font-size:1.3rem;font-weight:800;color:var(--t2);animation:pulseText 0.5s ease-in-out infinite alternate">Mengocok...</div>';
  $('dR').classList.remove('win');
  
  if (['gold', 'neon', 'dark'].includes(_dTheme) && typeof playDiceRoll === 'function') {
    playDiceRoll();
  } else if (typeof playTick === 'function') {
    playTick(); 
  } 
  
  for(let i=0;i<_dCount;i++){
    const v=Math.floor(cryptoRandom()*_dType)+1; 
    res.push(v);
    _lastDiceResArray = res;
    if (_dType === 6) {
      _diceStats[v] = (_diceStats[v] || 0) + 1;
    }

    
    if(_dType===6) {
      // 3D D6
      const pWrap = document.createElement('div');
      pWrap.className = `die-perspective die-theme-${_dTheme}`;
      
      const wrap = document.createElement('div');
      wrap.className = 'die-3d-wrap rolling';
      
      for(let f=1; f<=6; f++) {
        wrap.appendChild(createD6Face(f));
      }
      
      const baseTurn = _diceRollCount * 360 * 2;
      const rx = Math.floor(Math.random()*4)*90 + baseTurn - 360;
      const ry = Math.floor(Math.random()*4)*90 + baseTurn - 360;
      wrap.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      
      pWrap.appendChild(wrap);
      stg.appendChild(pWrap);
      
      // Delay to allow CSS to register initial rotation before starting transition
      setTimeout(() => {
        wrap.classList.remove('rolling');
        let finalX = baseTurn;
        let finalY = baseTurn;
        
        switch(v) {
          case 1: break;
          case 6: finalY += 180; break;
          case 2: finalY -= 90; break;
          case 5: finalY += 90; break;
          case 3: finalX -= 90; break;
          case 4: finalX += 90; break;
        }
        wrap.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;
      }, 50 + (i*100)); // Stagger animations slightly
      
    } else {
      // Flat Non-D6
      const df = document.createElement('div'); 
      df.className = `die-flat die-theme-${_dTheme}`;
      df.innerHTML = `<span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:${_dType>12?1.4:1.8}rem;font-weight:900;color:var(--acc)">${v}</span><span style="position:absolute;bottom:5px;right:8px;font-size:.55rem;color:var(--t3);font-weight:700">D${_dType}</span>`;
      df.style.animationDelay = `${i*80}ms`;
      stg.appendChild(df);
      setTimeout(()=>df.classList.add('roll-anim'), i*80);
    }
  }
  
  setTimeout(()=>{
    let sum = 0;
    let condHtml = '';
    
    if(_dCond === 'adv') {
      const max = res.length > 0 ? Math.max(...res) : 0;
      sum = max + _dMod;
      condHtml = `<div style="margin-top:6px"><span style="font-size:0.75rem;color:var(--mint);background:rgba(16,185,129,0.1);padding:4px 10px;border-radius:12px;font-weight:700">Advantage: Diambil ${max}</span></div>`;
    } else if(_dCond === 'dis') {
      const min = res.length > 0 ? Math.min(...res) : 0;
      sum = min + _dMod;
      condHtml = `<div style="margin-top:6px"><span style="font-size:0.75rem;color:var(--rose);background:rgba(244,63,94,0.1);padding:4px 10px;border-radius:12px;font-weight:700">Disadvantage: Diambil ${min}</span></div>`;
    } else {
      sum = res.reduce((a,b)=>a+b,0) + _dMod;
    }
    
    let modStr = _dMod !== 0 ? (_dMod > 0 ? ` +${_dMod}` : ` ${_dMod}`) : '';
    let formula = `${_dCount}D${_dType}${modStr}`;
    if(_dCond === 'adv') formula += ' (Adv)';
    if(_dCond === 'dis') formula += ' (Dis)';
    
    // Critical hit check: rolled maximum possible on dice
    let isCritical = false;
    let maxPossible = (_dCond === 'adv' || _dCond === 'dis' ? _dType : _dCount * _dType) + _dMod;
    if (sum >= maxPossible && _dType > 1) {
      isCritical = true;
    }
    
    $('dR').innerHTML = `
      <div style="font-size:0.8rem;color:var(--t3);font-weight:700;margin-bottom:4px">${formula}</div>
      <div class="${isCritical ? 'critical-hit' : ''}" style="font-size:2.8rem;font-weight:900;color:var(--acc);line-height:1;letter-spacing:-1px;text-shadow:0 4px 16px rgba(255,179,0,0.3)">${sum}</div>
      ${_dCount>1 && _dCond==='normal' ? `<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-top:8px;">${res.map(r=>`<span style="background:var(--bg3);border:1px solid var(--glass-border);border-radius:6px;padding:2px 8px;font-size:0.75rem;color:var(--t1);font-family:'JetBrains Mono',monospace;">${r}</span>`).join('')}</div>` : ''}
      ${condHtml}
    `;
    $('dR').classList.add('win'); 
    setTimeout(()=>$('dR').classList.remove('win'), 600);
    
    if (isCritical && typeof playDiceHit === 'function') {
      playDiceHit();
    } else if (['gold', 'neon', 'dark'].includes(_dTheme) && typeof playWinPremium === 'function') {
      playWinPremium();
    } else if (typeof playWin === 'function') {
      playWin();
    }
    
    // Update Dice History
    let histWrap = $('dHist');
    if(histWrap.innerHTML.includes('—')) histWrap.innerHTML = '';
    
    const chip = document.createElement('div');
    chip.className = 'sp-hist-chip';
    chip.style.fontSize = '0.75rem';
    chip.style.padding = '4px 12px';
    chip.innerHTML = `<span style="color:var(--t3)">${formula} ➔</span> <strong style="color:var(--acc)">${sum}</strong>`;
    histWrap.prepend(chip);
    if(histWrap.children.length > 20) histWrap.removeChild(histWrap.lastChild);
    
    addGlobalHistory(t('nav_dc'), `${formula} = ${sum}`);
    if (typeof announceA11y === 'function') announceA11y(`Dadu menunjukkan ${sum}`);
    
    if (_dType === 6) {
      setStore('diceStats', _diceStats);
      renderDiceStats();
    }
  }, 1050); // Wait >1s for 3D animation to finish
}

function resetDiceStats() {
  _diceStats = {};
  setStore('diceStats', _diceStats);
  renderDiceStats();
  if(typeof msg === 'function') msg(t('sp_reset') || 'Di-reset!');
}

function renderDiceStats() {
  const container = $('dStatsContainer');
  if(!container) return;
  
  if(_dType !== 6) {
    container.innerHTML = '<div style="color:var(--t3);font-size:0.75rem;padding:8px">Statistik visual grafik hanya tersedia untuk Dadu 6 (D6).</div>';
    return;
  }
  
  const entries = Object.entries(_diceStats).map(e => [parseInt(e[0]), e[1]]).filter(e => e[0] >= 1 && e[0] <= 6);
  if(entries.length === 0) {
    container.innerHTML = '<div style="color:var(--t3);font-size:0.75rem;padding:8px">Belum ada data lemparan D6.</div>';
    return;
  }
  
  container.innerHTML = '';
  const maxCount = Math.max(...entries.map(e => e[1]));
  const totalCount = entries.reduce((a,b) => a + b[1], 0);
  
  // Sort from 6 down to 1
  entries.sort((a,b) => b[0] - a[0]);
  
  entries.forEach(([num, count]) => {
    const row = document.createElement('div');
    row.className = 'sp-stat-row';
    const pct = ((count / totalCount) * 100).toFixed(0);
    const barPct = ((count / maxCount) * 100).toFixed(0);
    const color = `var(--acc)`; 
    
    row.innerHTML = `
      <span class="sp-stat-name" style="font-family:'JetBrains Mono',monospace;">Angka ${num}</span>
      <div class="sp-stat-bar-wrap">
        <div class="sp-stat-bar" style="width:${barPct}%;background:${color}">${pct > 5 ? pct + '%' : ''}</div>
      </div>
      <span class="sp-stat-count">${count}×</span>
    `;
    container.appendChild(row);
  });
}

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    _diceStats = getStore('diceStats', {});
    updateIdleDice();
    renderDiceStats();
  });
} else {
  _diceStats = getStore('diceStats', {});
  updateIdleDice();
  renderDiceStats();
}
