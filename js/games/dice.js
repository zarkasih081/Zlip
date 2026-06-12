// ═══════════════════════════════════════════
//  DICE (Simplified)
// ═══════════════════════════════════════════
let _dCount = 2, _dType = 6, _dTheme = 'default';
let _diceRollCount = 0;
let _lastDiceResArray = [6, 6];
let _diceStats = { 4:{}, 6:{}, 8:{}, 10:{}, 12:{}, 20:{} };
let _isRolling = false;

function setDTheme(theme, btn) {
  _dTheme = theme;
  document.querySelectorAll('#diceThemeRow .d-type-btn').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  setStore('dTheme', _dTheme);
  updateIdleDice();
}

function adjDice(d){ 
  _dCount = Math.max(1, Math.min(10, _dCount+d)); 
  $('dCount').textContent = _dCount; 
  setStore('dCount', _dCount);
  updateIdleDice();
}

function setDType(t, btn){ 
  _dType = t; 
  document.querySelectorAll('#diceTypeRow .d-type-btn').forEach(b => b.classList.remove('on')); 
  if(btn) btn.classList.add('on'); 
  if (!btn) {
    let b = Array.from(document.querySelectorAll('#diceTypeRow .d-type-btn')).find(el => el.textContent === `D${t}`);
    if(b) b.classList.add('on');
  }
  setStore('dType', _dType);
  updateIdleDice();
  renderDiceStats();
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

function getDieSvg(type, val, theme) {
  const isDark = theme === 'dark';
  const c1 = isDark ? '#333' : theme === 'neon' ? '#111' : theme === 'gold' ? '#D4AF37' : '#fff';
  const c2 = isDark ? '#111' : theme === 'neon' ? '#ff006e' : theme === 'gold' ? '#996515' : '#ccc';
  const tC = isDark ? '#fff' : theme === 'neon' ? '#06d6a0' : theme === 'gold' ? '#fff' : 'var(--acc)';
  
  let p = '';
  if(type===4) p = `<polygon points="50,5 95,90 5,90" fill="${c1}" stroke="${c2}" stroke-width="2"/><polygon points="50,5 50,90 95,90" fill="${c2}" opacity="0.3"/>`;
  else if(type===8) p = `<polygon points="50,5 95,50 50,95 5,50" fill="${c1}" stroke="${c2}" stroke-width="2"/><polygon points="50,5 95,50 50,95" fill="${c2}" opacity="0.3"/><line x1="5" y1="50" x2="95" y2="50" stroke="${c2}" stroke-width="1"/>`;
  else if(type===10) p = `<polygon points="50,5 95,40 50,95 5,40" fill="${c1}" stroke="${c2}" stroke-width="2"/><polygon points="50,5 95,40 50,95" fill="${c2}" opacity="0.3"/><polygon points="5,40 95,40 50,60" fill="none" stroke="${c2}" stroke-width="1"/>`;
  else if(type===12) p = `<polygon points="50,5 95,35 80,90 20,90 5,35" fill="${c1}" stroke="${c2}" stroke-width="2"/><polygon points="50,25 75,45 65,75 35,75 25,45" fill="${c2}" opacity="0.3" stroke="${c2}"/>`;
  else if(type===20) p = `<polygon points="50,5 95,30 95,70 50,95 5,70 5,30" fill="${c1}" stroke="${c2}" stroke-width="2"/><polygon points="50,5 95,30 50,60" fill="${c2}" opacity="0.2" stroke="${c2}"/><polygon points="50,5 5,30 50,60" fill="${c2}" opacity="0.4" stroke="${c2}"/><polygon points="50,95 95,70 50,60" fill="${c2}" opacity="0.6" stroke="${c2}"/><polygon points="50,95 5,70 50,60" fill="${c2}" opacity="0.8" stroke="${c2}"/>`;
  else p = `<rect x="5" y="5" width="90" height="90" rx="10" fill="${c1}" stroke="${c2}" stroke-width="2"/>`;

  return `<svg viewBox="0 0 100 100" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:0">${p}</svg><div style="position:relative;z-index:1;font-family:'Plus Jakarta Sans',sans-serif;font-size:${type>12?1.3:1.6}rem;font-weight:900;color:${tC};text-shadow:0 1px 2px rgba(0,0,0,0.3)">${val}</div>`;
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
      df.style.display = 'flex';
      df.style.alignItems = 'center';
      df.style.justifyContent = 'center';
      df.style.position = 'relative';
      df.innerHTML = getDieSvg(_dType, v, _dTheme) + `<span style="position:absolute;bottom:5px;right:8px;font-size:.55rem;color:var(--t3);font-weight:700;z-index:2">D${_dType}</span>`;
      stg.appendChild(df);
    }
  }
}

function roll(){
  if(_dCount <= 0 || _dType <= 0 || _isRolling) return;
  _isRolling = true;

  const stg=$('dS'), res=[];
  if(!stg) return;
  
  _diceRollCount++;
  
  stg.innerHTML=''; 
  $('dR').innerHTML='<div style="font-size:1.3rem;font-weight:800;color:var(--t2);animation:pulseText 0.5s ease-in-out infinite alternate">Mengocok...</div>';
  $('dR').classList.remove('win');
  
  if (typeof playTick === 'function') playTick(); 
  
  for(let i=0;i<_dCount;i++){
    const v=Math.floor(cryptoRandom()*_dType)+1; 
    res.push(v);
    _lastDiceResArray = res;
    if(!_diceStats[_dType]) _diceStats[_dType] = {};
    _diceStats[_dType][v] = (_diceStats[_dType][v] || 0) + 1;
    
    if(_dType===6) {
      const pWrap = document.createElement('div');
      pWrap.className = `die-perspective die-theme-${_dTheme}`;
      
      const wrap = document.createElement('div');
      wrap.className = 'die-3d-wrap rolling';
      
      for(let f=1; f<=6; f++) {
        wrap.appendChild(createD6Face(f));
      }
      
      const baseTurn = _diceRollCount * 360 * 2;
      const rx = Math.floor(cryptoRandom()*4)*90 + baseTurn - 360;
      const ry = Math.floor(cryptoRandom()*4)*90 + baseTurn - 360;
      wrap.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      
      pWrap.appendChild(wrap);
      stg.appendChild(pWrap);
      
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
      }, 50 + (i*100));
      
    } else {
      const df = document.createElement('div'); 
      df.className = `die-flat die-theme-${_dTheme}`;
      df.style.display = 'flex';
      df.style.alignItems = 'center';
      df.style.justifyContent = 'center';
      df.style.position = 'relative';
      df.innerHTML = getDieSvg(_dType, v, _dTheme) + `<span style="position:absolute;bottom:5px;right:8px;font-size:.55rem;color:var(--t3);font-weight:700;z-index:2">D${_dType}</span>`;
      df.style.animationDelay = `${i*80}ms`;
      stg.appendChild(df);
      setTimeout(()=>df.classList.add('roll-anim'), i*80);
    }
  }
  
  setTimeout(()=>{
    let sum = res.reduce((a,b)=>a+b,0);
    let formula = `${_dCount}D${_dType}`;
    
    let isCritical = false;
    let maxPossible = _dCount * _dType;
    if (sum >= maxPossible && _dType > 1) {
      isCritical = true;
    }
    
    $('dR').innerHTML = `
      <div style="font-size:0.8rem;color:var(--t3);font-weight:700;margin-bottom:4px">${formula}</div>
      <div class="${isCritical ? 'critical-hit' : ''}" style="font-size:2.8rem;font-weight:900;color:var(--acc);line-height:1;letter-spacing:-1px;text-shadow:0 4px 16px rgba(255,179,0,0.3)">${sum}</div>
      ${_dCount>1 ? `<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-top:8px;">${res.map(r=>`<span style="background:var(--bg3);border:1px solid var(--glass-border);border-radius:6px;padding:2px 8px;font-size:0.75rem;color:var(--t1);font-family:'JetBrains Mono',monospace;">${r}</span>`).join('')}</div>` : ''}
    `;
    $('dR').classList.add('win'); 
    setTimeout(()=>$('dR').classList.remove('win'), 600);
    
    if (isCritical && typeof playDiceHit === 'function') {
      playDiceHit();
    } else if (typeof playWin === 'function') {
      playWin();
    }
    
    let histWrap = $('dHist');
    if(histWrap && histWrap.innerHTML.includes('—')) histWrap.innerHTML = '';
    
    if (histWrap) {
      const chip = document.createElement('div');
      chip.className = 'sp-hist-chip';
      chip.style.fontSize = '0.75rem';
      chip.style.padding = '4px 12px';
      chip.innerHTML = `<span style="color:var(--t3)">${formula} ➔</span> <strong style="color:var(--acc)">${sum}</strong>`;
      histWrap.prepend(chip);
      if(histWrap.children.length > 20) histWrap.removeChild(histWrap.lastChild);
    }
    
    if (typeof announceA11y === 'function') announceA11y(`Dadu menunjukkan ${sum}`);
    
    setStore('diceStats', _diceStats);
    renderDiceStats();
    
    _isRolling = false;
  }, 1050);
}

function resetDiceStats() {
  _diceStats[_dType] = {};
  setStore('diceStats', _diceStats);
  renderDiceStats();
  if(typeof msg === 'function') msg(t('sp_reset') || 'Di-reset!');
}

function renderDiceStats() {
  const container = $('dStatsContainer');
  if(!container) return;
  
  let currentStats = _diceStats[_dType] || {};
  const entries = Object.entries(currentStats).map(e => [parseInt(e[0]), e[1]]).filter(e => e[0] >= 1 && e[0] <= _dType);
  if(entries.length === 0) {
    container.innerHTML = `<div style="color:var(--t3);font-size:0.75rem;padding:8px">Belum ada data lemparan D${_dType}.</div>`;
    return;
  }
  
  container.innerHTML = '';
  const maxCount = Math.max(...entries.map(e => e[1]));
  const totalCount = entries.reduce((a,b) => a + b[1], 0);
  
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

function clearDHist() {
  if($('dHist')) $('dHist').innerHTML = '<span style="color:var(--t3)">—</span>';
  if (typeof playTick === 'function') playTick();
}

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    _dCount = getStore('dCount', 2);
    _dType = getStore('dType', 6);
    _dTheme = getStore('dTheme', 'default');
    _diceStats = getStore('diceStats', { 4:{}, 6:{}, 8:{}, 10:{}, 12:{}, 20:{} });
    if($('dCount')) $('dCount').textContent = _dCount;
    setDType(_dType);
    setDTheme(_dTheme);
    updateIdleDice();
    renderDiceStats();
  });
} else {
  _dCount = getStore('dCount', 2);
  _dType = getStore('dType', 6);
  _dTheme = getStore('dTheme', 'default');
  _diceStats = getStore('diceStats', { 4:{}, 6:{}, 8:{}, 10:{}, 12:{}, 20:{} });
  if($('dCount')) $('dCount').textContent = _dCount;
  setDType(_dType);
  setDTheme(_dTheme);
  updateIdleDice();
  renderDiceStats();
}
