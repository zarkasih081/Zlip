// ═══════════════════════════════════════════
//  1. SPINNER — MEGA UPGRADE
// ═══════════════════════════════════════════
let _si = [], _sAng = 0, _sPalette = 'rainbow', _spSpin = false;
let _spElimMode = false;
let _spStats = {};
const _imgCache = {};
const SP_COLORS = {
  default: ['#ef4444','#f97316','#eab308','#22c55e','#FFD54F','#3b82f6','#8b5cf6','#ec4899'],
  neon:    ['#ff006e','#fb5607','#ffbe0b','#3a86ff','#8338ec','#06d6a0','#118ab2','#ff006e'],
  gold:    ['#FFDF00','#D4AF37','#CFB53B','#C5B358','#E6C200','#996515','#B8860B','#DAA520'],
  dark:    ['#1a1a1a','#2b2b2b','#333333','#1f1f1f','#222222','#292929','#303030','#111111'],
  };
let _spHistory = [];

function getSpPresets() {
  return {
    food:   { label: t('sp_pre_food_lbl'), items: (t('sp_pre_food_items')||'').split(',') },
    yesno:  { label: t('sp_pre_yes') + ' / ' + t('sp_pre_no'), items: [t('sp_pre_yes'),t('sp_pre_no')] },
    number: { label: t('sp_pre_num_lbl'), items: ['1','2','3','4','5','6','7','8','9','10'] },
    color:  { label: t('sp_pre_color_lbl'), items: (t('sp_pre_color_items')||'').split(',') },
    day:    { label: t('sp_pre_day_lbl'), items: (t('sp_pre_day_items')||'').split(',') },
  };
}

// ── RESPONSIVE CANVAS ──
let _spCanvasSize = 320;

function resizeSpCanvas() {
  const wrap = document.querySelector('.sp-wrap');
  if (!wrap) return;
  const parentW = wrap.parentElement.offsetWidth;
  const maxSize = Math.min(400, parentW - 16);
  const size = Math.max(240, maxSize);
  _spCanvasSize = size;
  
  const cv = $('spCv');
  if (!cv) return;
  cv.width = size;
  cv.height = size;
  wrap.style.width = size + 'px';
  wrap.style.height = size + 'px';
  dW();
}

// ── COLOR PALETTE ──
function setSpColor(p, btn) {
  _sPalette = p;
  document.querySelectorAll('#spColorRow .d-type-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  setStore('spPalette', p);
  renderSpList();
}

// ── PRESETS ──
function loadSpPreset(key) {
  const presets = getSpPresets();
  const preset = presets[key];
  if (!preset) return;
  _si = preset.items.map(t => ({text: t, weight: 1}));
  renderSpList();
  msg(`Preset "${preset.label}" loaded!`);
}

// ── ELIMINATION MODE ──
function toggleElimMode() {
  _spElimMode = !_spElimMode;
  const textEl = $('elimToggleText');
  const btnEl = $('elimToggle');
  
  if (textEl) {
    textEl.innerHTML = _spElimMode ? (t('sp_elim_on') || '<i data-lucide="minus-circle" style="width:16px"></i> Eliminasi: AKTIF') : (t('sp_elim_off') || '<i data-lucide="minus-circle" style="width:16px"></i> Eliminasi: Nonaktif');
    if (window.lucide) lucide.createIcons({ root: textEl });
  }
  if (btnEl) {
    btnEl.classList.toggle('on', _spElimMode);
  }
  setStore('spElimMode', _spElimMode);
}

// ── STATISTICS ──
function recordStat(item) {
  if (!_spStats[item]) _spStats[item] = 0;
  _spStats[item]++;
  setStore('spStats', _spStats);
  renderSpStats();
}

function resetSpStats() {
  _spStats = {};
  setStore('spStats', _spStats);
  renderSpStats();
  msg(t('sp_reset') + '!');
}

function renderSpStats() {
  const container = $('spStatsContainer');
  if (!container) return;
  container.innerHTML = '';
  
  const entries = Object.entries(_spStats).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    container.innerHTML = '<div style="color:var(--t3);font-size:0.75rem">Belum ada data.</div>';
    return;
  }
  
  const maxCount = Math.max(...entries.map(e => e[1]));
  
  entries.forEach(([name, count]) => {
    const row = document.createElement('div');
    row.className = 'sp-stat-row';
    const pct = (count / maxCount * 100).toFixed(0);
    const C = SP_COLORS[_sPalette] || SP_COLORS.default;
    const idx = _si.findIndex(s => s.text === name);
    const color = idx >= 0 ? C[idx % C.length] : 'var(--acc)';
    
    row.innerHTML = `
      <span class="sp-stat-name"></span>
      <div class="sp-stat-bar-wrap">
        <div class="sp-stat-bar" style="width:${pct}%;background:${color}">${pct > 10 ? pct + '%' : ''}</div>
      </div>
      <span class="sp-stat-count">${count}×</span>
    `;
    row.querySelector('.sp-stat-name').textContent = name;
    container.appendChild(row);
  });
}

// ── ITEM LIST ──
function renderSpList() {
  const list = $('spList');
  if (!list) return;
  list.innerHTML = '';
  _si.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'sp-item-row';
    row.style.flexDirection = 'column';
    row.style.alignItems = 'stretch';
    row.style.gap = '8px';
    row.style.flexShrink = '0';
    const C = SP_COLORS[_sPalette] || SP_COLORS.default;
    const color = C[i % C.length];
    
    const textVal = item.text || '';
    const weightVal = item.weight || 1;
    
    row.innerHTML = `
      <div style="display:flex; width:100%; gap:8px; align-items:center;">
        <div class="sp-item-color" style="background:${color}; flex-shrink:0;"></div>
        <input type="text" class="sp-item-text" style="flex:1" placeholder="Nama opsi...">
        <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
          <span style="font-size:0.65rem; color:var(--t3); font-weight:700;" title="Semakin besar bobot, semakin luas area opsi di roda">BOBOT:</span>
          <input type="number" class="inp sp-item-weight" min="1" max="100" title="Bobot Peluang" style="width:48px; padding:4px; font-size:0.75rem; text-align:center;">
        </div>
        <button class="sp-item-del" style="flex-shrink:0;"><i data-lucide="trash-2" style="width:16px;height:16px"></i></button>
      </div>
    `;
    
    const textInput = row.querySelector('.sp-item-text');
    textInput.value = textVal;
    textInput.addEventListener('input', (e) => updSpItem(i, 'text', e.target.value));
    
    const delBtn = row.querySelector('.sp-item-del');
    delBtn.addEventListener('click', () => delSpItem(i));
    
    const weightInput = row.querySelector('.sp-item-weight');
    weightInput.value = weightVal;
    weightInput.addEventListener('change', (e) => updSpItem(i, 'weight', e.target.value));
    
    list.appendChild(row);
  });
  if (window.lucide) lucide.createIcons({ root: list });
  setStore('sp_v2', _si);
  if (typeof dW === 'function') dW();
}

function updSpItem(idx, field, val) {
  if (field === 'weight') {
    val = Math.max(1, parseInt(val) || 1);
    val = Math.min(100, val);
  }
  if (field === 'text') {
    val = String(val).trim().substring(0, 50);
  }
  _si[idx][field] = val;
  setStore('sp_v2', _si);
  if (typeof dW === 'function') dW();
}

function delSpItem(idx) {
  if (_si.length <= 2) return msg(t('sp_err_min') || 'Minimal 2 item!');
  _si.splice(idx, 1);
  renderSpList();
}

function addSpItem() {
  const val = $('spNewInp').value.trim();
  if (!val) return;
  _si.push({text: val, weight: 1});
  $('spNewInp').value = '';
  setStore('sp_v2', _si);
  renderSpList();
}

function handleSpPaste(e) {
  e.preventDefault();
  
  const pasteHtml = (e.clipboardData || window.clipboardData).getData('text/html');
  const pasteText = (e.clipboardData || window.clipboardData).getData('text');
  
  if (!pasteHtml && !pasteText) return;
  
  let items = [];
  
  if (pasteHtml) {
    let safeHtml = pasteHtml.replace(/><\/?[a-z]/gi, match => `>\n<` + match.substring(2));
    safeHtml = safeHtml.replace(/<br[^>]*>/gi, '\n');
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(safeHtml, 'text/html');
    let text = doc.body.textContent || doc.body.innerText || '';
    items = text.split(/[\n\r,\t]+/);
  } else if (pasteText) {
    items = pasteText.split(/[\n\r,\t]+/);
  }
  
  // Bersihkan: Hapus karakter bullet point, dash, angka, dan spasi kosong
  items = items.map(s => {
    return s.replace(/^[\u2022\u2023\u25E6\u2043\-\*\s]+/, '') 
            .replace(/^\d+[\.\)]\s*/, '') 
            .trim();
  }).filter(s => s.length > 0);
  
  if (items.length > 0) {
    items.forEach(t => _si.push({text: t, weight: 1}));
    $('spNewInp').value = '';
    renderSpList();
    if (typeof msg === 'function') msg(`${items.length} items added`);
  }
}

// ── DRAW WHEEL ──
function dW() {
  if (!_si.length) return;
  const cv = $('spCv');
  if (!cv) return;
  const x = cv.getContext('2d'), W = cv.width, cx = W / 2;
  const outerRingW = Math.max(8, W * 0.03);
  const nubR = Math.max(4, W * 0.018);
  const R = cx - outerRingW - 4;
  const n = _si.length, a = 2 * Math.PI / n;
  const C = SP_COLORS[_sPalette] || SP_COLORS.default;
  
  // Premium Glow wrapping
  const wrap = document.querySelector('.sp-wrap');
  if (wrap) {
    wrap.className = 'sp-wrap';
    if (_sPalette === 'gold') wrap.classList.add('sp-glow-gold', 'sp-glow');
    else if (_sPalette === 'neon') wrap.classList.add('sp-glow-neon', 'sp-glow');
    else if (_sPalette === 'crystal') wrap.classList.add('sp-glow-crystal', 'sp-glow');
  }

  x.clearRect(0, 0, W, W);
  
  // ── Outer ring (metallic/premium) ──
  x.beginPath();
  x.arc(cx, cx, cx - 2, 0, 2 * Math.PI);
  const ringGrad = x.createRadialGradient(cx, cx * 0.6, 0, cx, cx, cx);
  if (['dark'].includes(_sPalette)) {
    ringGrad.addColorStop(0, '#555');
    ringGrad.addColorStop(0.5, '#222');
    ringGrad.addColorStop(1, '#111');
  } else if (_sPalette === 'crystal') {
    ringGrad.addColorStop(0, '#FFFFFF');
    ringGrad.addColorStop(0.5, '#E0FFFF');
    ringGrad.addColorStop(1, '#AFEEEE');
  } else if (_sPalette === 'neon') {
    ringGrad.addColorStop(0, '#ff006e');
    ringGrad.addColorStop(0.5, '#3a86ff');
    ringGrad.addColorStop(1, '#06d6a0');
  } else {
    ringGrad.addColorStop(0, '#FFE082');
    ringGrad.addColorStop(0.4, '#FFB300');
    ringGrad.addColorStop(0.7, '#FF8F00');
    ringGrad.addColorStop(1, '#FFB300');
  }
  x.fillStyle = ringGrad;
  x.fill();
  
  // Inner cut for wheel area
  x.beginPath();
  x.arc(cx, cx, R + 1, 0, 2 * Math.PI);
  x.fillStyle = ['dark'].includes(_sPalette) ? '#111' : '#000';
  x.fill();
  
  // ── Segments with gradient ──
  const totalWeight = _si.reduce((sum, item) => sum + (item.weight || 1), 0);
  let currentAngle = 0;
  
  _si.forEach((item, i) => {
    const w = item.weight || 1;
    const sliceAngle = (w / totalWeight) * 2 * Math.PI;
    const startAngle = currentAngle - Math.PI / 2;
    const endAngle = startAngle + sliceAngle;
    
    // Segment fill with subtle gradient
    x.beginPath();
    x.moveTo(cx, cx);
    x.arc(cx, cx, R, startAngle, endAngle);
    x.closePath();
    
    const midAngle = startAngle + sliceAngle / 2;
    const gradX = cx + Math.cos(midAngle) * R * 0.5;
    const gradY = cx + Math.sin(midAngle) * R * 0.5;
    const segGrad = x.createRadialGradient(gradX, gradY, 0, cx, cx, R);
    const baseColor = C[i % C.length];
    segGrad.addColorStop(0, lightenColor(baseColor, 20));
    segGrad.addColorStop(1, baseColor);
    x.fillStyle = segGrad;
    x.fill();
    
    // Segment border
    x.strokeStyle = 'rgba(0,0,0,.18)';
    x.lineWidth = 1.5;
    x.stroke();
    
    // Inner edge highlight
    x.save();
    x.beginPath();
    x.moveTo(cx, cx);
    x.arc(cx, cx, R, startAngle, endAngle);
    x.closePath();
    x.clip();
    x.beginPath();
    x.arc(cx, cx, R, startAngle, endAngle);
    x.strokeStyle = 'rgba(255,255,255,0.25)';
    x.lineWidth = 3;
    x.stroke();
    x.restore();
    
    // Text & Image
    x.save();
    x.translate(cx, cx);
    x.rotate(startAngle + sliceAngle / 2);
    
    let textOffset = R - 14;
    
    x.textAlign = 'right';
    x.fillStyle = 'rgba(255,255,255,.95)';
    const textStr = item.text || '';
    const avgSliceAngle = 2 * Math.PI / n;
    const fs = Math.max(10, Math.min(16, (R * 0.62) / n));
    x.font = `700 ${fs}px Inter, sans-serif`;
    x.shadowColor = 'rgba(0,0,0,.5)';
    x.shadowBlur = 3;
    const maxTextLen = Math.max(6, Math.floor((textOffset + 14) / (fs * 0.55)));
    let displayText = textStr.length > maxTextLen ? textStr.substring(0, maxTextLen - 1) + '…' : textStr;
    x.fillText(displayText, textOffset, fs / 3);
    x.restore();
    
    currentAngle += sliceAngle;
  });
  
  // ── Nubs / Pegs on outer ring ──
  const nubCount = Math.max(n, 16);
  for (let i = 0; i < nubCount; i++) {
    const angle = (i / nubCount) * 2 * Math.PI - Math.PI / 2;
    const nubX = cx + Math.cos(angle) * (R + outerRingW / 2 + 1);
    const nubY = cx + Math.sin(angle) * (R + outerRingW / 2 + 1);
    
    x.beginPath();
    x.arc(nubX, nubY, nubR, 0, 2 * Math.PI);
    
    const nubGrad = x.createRadialGradient(nubX - 1, nubY - 1, 0, nubX, nubY, nubR);
    nubGrad.addColorStop(0, '#FFF8E1');
    nubGrad.addColorStop(0.5, '#FFD54F');
    nubGrad.addColorStop(1, '#F57F17');
    x.fillStyle = nubGrad;
    x.fill();
    
    x.strokeStyle = 'rgba(0,0,0,.2)';
    x.lineWidth = 0.5;
    x.stroke();
  }
  
  // ── Center hub (3D) ──
  const hubR = Math.max(16, R * 0.15);
  
  // Hub shadow
  x.beginPath();
  x.arc(cx, cx + 2, hubR + 2, 0, 2 * Math.PI);
  x.fillStyle = 'rgba(0,0,0,0.2)';
  x.fill();
  
  // Hub body
  const hubGrad = x.createRadialGradient(cx - hubR * 0.3, cx - hubR * 0.3, 0, cx, cx, hubR);
  if (['dark'].includes(_sPalette)) {
    hubGrad.addColorStop(0, '#555');
    hubGrad.addColorStop(1, '#111');
  } else if (_sPalette === 'neon') {
    hubGrad.addColorStop(0, '#ff006e');
    hubGrad.addColorStop(1, '#111');
  } else {
    hubGrad.addColorStop(0, '#FFE082');
    hubGrad.addColorStop(0.5, '#FFB300');
    hubGrad.addColorStop(1, '#E65100');
  }
  x.beginPath();
  x.arc(cx, cx, hubR, 0, 2 * Math.PI);
  x.fillStyle = hubGrad;
  x.fill();
  x.strokeStyle = ['dark'].includes(_sPalette) ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.15)';
  x.lineWidth = 2;
  x.stroke();
  
  // Hub highlight
  x.beginPath();
  x.arc(cx - hubR * 0.15, cx - hubR * 0.2, hubR * 0.45, 0, 2 * Math.PI);
  x.fillStyle = 'rgba(255,255,255,0.35)';
  x.fill();
}

function lightenColor(hex, percent) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  let r = (num >> 16) + Math.round(255 * percent / 100);
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100);
  let b = (num & 0x0000FF) + Math.round(255 * percent / 100);
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

// ── HELPER: GET WINNER BY ANGLE ──
function getWinnerIdx(ang) {
  const totalWeight = _si.reduce((sum, item) => sum + (item.weight || 1), 0);
  const norm = ((360 - (ang % 360)) % 360);
  let current = 0;
  for (let i = 0; i < _si.length; i++) {
    const w = _si[i].weight || 1;
    const sliceDeg = (w / totalWeight) * 360;
    if (norm >= current && norm < current + sliceDeg) {
      return i;
    }
    current += sliceDeg;
  }
  return 0;
}

// ── DRAG TO SPIN ──
let _dragStartAngle = null, _dragLastAngle = null, _dragVelocity = 0, _dragTimestamp = 0;

function getAngleFromCenter(clientX, clientY) {
  const cv = $('spCv');
  if (!cv) return 0;
  const rect = cv.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
}

function onDragStart(e) {
  if (_spSpin) return;
  e.preventDefault();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  _dragStartAngle = getAngleFromCenter(clientX, clientY);
  _dragLastAngle = _dragStartAngle;
  _dragVelocity = 0;
  _dragTimestamp = Date.now();
  
  const cv = $('spCv');
  if (cv) cv.style.cursor = 'grabbing';
}

function onDragMove(e) {
  if (_dragStartAngle === null || _spSpin) return;
  e.preventDefault();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const currentAngle = getAngleFromCenter(clientX, clientY);
  let delta = currentAngle - _dragLastAngle;
  
  // Handle wrap-around
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  
  _sAng += delta;
  $('spCv').style.transform = `rotate(${_sAng}deg)`;
  
  const now = Date.now();
  const dt = now - _dragTimestamp;
  if (dt > 0) {
    _dragVelocity = delta / dt * 16; // Normalize to ~60fps
  }
  
  _dragLastAngle = currentAngle;
  _dragTimestamp = now;
}

function onDragEnd(e) {
  if (_dragStartAngle === null) return;
  _dragStartAngle = null;
  
  const cv = $('spCv');
  if (cv) cv.style.cursor = 'grab';
  
  // Only spin if there's enough velocity
  const absVel = Math.abs(_dragVelocity);
  if (absVel > 1.5 && _si.length >= 2) {
    _spSpin = true;
    $('spBtn').disabled = true;
    
    // Set pointer pulse
    const ptr = document.querySelector('.sp-ptr');
    if (ptr) ptr.classList.add('spinning');
    
    let vel = _dragVelocity * 2;
    // Ensure minimum spin
    if (Math.abs(vel) < 8) vel = (vel > 0 ? 1 : -1) * 8;
    
    _spLastTickAng = _sAng;
    $('spR').textContent = '';
    $('spR').classList.remove('win');
    
    function animateDrag() {
      _sAng += vel;
      vel *= 0.985;
      
      const oldIdx = getWinnerIdx(_spLastTickAng);
      const newIdx = getWinnerIdx(_sAng);
      if (oldIdx !== newIdx) {
        if (['gold', 'neon', 'dark', 'crystal'].includes(_sPalette)) {
          if (typeof playTickPremium === 'function') playTickPremium();
        } else {
          if (typeof playTick === 'function') playTick();
        }
        _spLastTickAng = _sAng;
      }
      
      $('spCv').style.transform = `rotate(${_sAng}deg)`;
      
      if (Math.abs(vel) > 0.08) {
        requestAnimationFrame(animateDrag);
      } else {
        finishSpin();
      }
    }
    requestAnimationFrame(animateDrag);
  }
}

function initDragSpin() {
  const cv = $('spCv');
  if (!cv) return;
  cv.style.cursor = 'grab';
  
  // Mouse events
  cv.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);
  
  // Touch events
  cv.addEventListener('touchstart', onDragStart, { passive: false });
  window.addEventListener('touchmove', onDragMove, { passive: false });
  window.addEventListener('touchend', onDragEnd);
}

// ── SPIN (BUTTON) ──
let _spVel = 0, _spLastTickAng = 0;

function spin() {
  if (_spSpin || !_si.length) {
    if (_si.length < 2) msg(t('sp_err_min') || t('sp_err_min_spin'));
    return;
  }
  _spSpin = true;
  $('spBtn').disabled = true;
  
  // Pointer animation
  const ptr = document.querySelector('.sp-ptr');
  if (ptr) ptr.classList.add('spinning');
  
  $('spCv').style.transition = 'none';
  _spVel = cryptoRandom() * 15 + 25;
  _spLastTickAng = _sAng;
  
  function animate() {
    _sAng += _spVel;
    _spVel *= 0.985;
    
    const oldIdx = getWinnerIdx(_spLastTickAng);
    const newIdx = getWinnerIdx(_sAng);
    if (oldIdx !== newIdx) {
      if (['gold', 'neon', 'dark', 'crystal'].includes(_sPalette)) {
        if (typeof playTickPremium === 'function') playTickPremium();
      } else {
        if (typeof playTick === 'function') playTick();
      }
      _spLastTickAng = _sAng;
    }
    
    $('spCv').style.transform = `rotate(${_sAng}deg)`;
    
    if (_spVel > 0.08) {
      requestAnimationFrame(animate);
    } else {
      finishSpin();
    }
  }
  
  $('spR').textContent = '';
  $('spR').classList.remove('win');
  requestAnimationFrame(animate);
}

// ── FINISH SPIN ──
function finishSpin() {
  _spSpin = false;
  $('spBtn').disabled = false;
  
  // Stop pointer animation
  const ptr = document.querySelector('.sp-ptr');
  if (ptr) ptr.classList.remove('spinning');
  
  const winnerIdx = getWinnerIdx(_sAng);
  const winner = _si[winnerIdx] || _si[0];
  const winnerText = winner.text;
  
  const C = SP_COLORS[_sPalette] || SP_COLORS.default;
  const winColor = C[winnerIdx % C.length];
  
  $('spR').innerHTML = '';
  const strong = document.createElement('strong');
  strong.textContent = winnerText;
  $('spR').appendChild(strong);
  $('spR').classList.add('win');
  _spHistory.unshift({ name: winnerText, color: winColor });
  if (_spHistory.length > 8) _spHistory.pop();
  renderSpHistory();
  
  recordStat(winnerText);
  
  if (['gold', 'neon', 'dark', 'crystal'].includes(_sPalette)) {
    if (typeof playWinPremium === 'function') playWinPremium();
  } else {
    if (typeof playWin === 'function') playWin();
  }
  if (typeof conf === 'function') conf();

  if (typeof msg === 'function') msg(`Terpilih: ${winnerText}`, 4000, 'none');
  if (typeof announceA11y === 'function') announceA11y(`Roda berhenti di ${winnerText}`);
  
  // Auto eliminate if mode is on
  if (_spElimMode && _si.length > 2) {
    setTimeout(() => {
      delSpItem(winnerIdx);
      msg(`Opsi "${winnerText}" dieliminasi`, 3000, 'none');
    }, 2000);
  }
}

// ── HISTORY RENDER (colored chips) ──
function renderSpHistory() {
  const container = $('spHist');
  if (!container) return;
  container.innerHTML = '';
  
  if (_spHistory.length === 0) {
    container.innerHTML = '<span style="color:var(--t3)">—</span>';
    return;
  }
  
  _spHistory.forEach(h => {
    const chip = document.createElement('span');
    chip.className = 'sp-hist-chip';
    chip.style.borderColor = h.color;
    chip.style.color = h.color;
    chip.textContent = h.name;
    container.appendChild(chip);
  });
}

// ── WIN MODAL ──

let _spResizeObserver = null;
let _spResizeHandler = null;

// ── INIT ──
function initSpinner() {
  if (_spResizeObserver) {
    _spResizeObserver.disconnect();
  }
  if (_spResizeHandler) {
    window.removeEventListener('resize', _spResizeHandler);
  }

  const storedSp2 = getStore('sp_v2', null);
  if (storedSp2 && Array.isArray(storedSp2) && storedSp2.length > 0 && typeof storedSp2[0] === 'object') {
    _si = storedSp2;
  } else {
    // Fallback for v1 data
    const storedSp = getStore('sp', "Pizza\nBurger\nSushi\nNasi Goreng\nMie Ayam\nBakso");
    _si = storedSp.split('\n').filter(x => x.trim()).map(t => ({text: t, weight: 1, image: ''}));
  }
  
  _sPalette = getStore('spPalette', 'default');
  _spElimMode = getStore('spElimMode', false);
  _spStats = getStore('spStats', {});
  
  if (typeof dW === 'function') dW();
  renderSpList();
  renderSpStats();
  
  // Set elimination button state
  const elimBtn = $('elimToggle');
  const elimText = $('elimToggleText');
  if (elimBtn) {
    elimBtn.classList.toggle('on', _spElimMode);
  }
  if (elimText) {
    elimText.innerHTML = _spElimMode ? t('sp_elim_on') : t('sp_elim_off');
    if (window.lucide) lucide.createIcons({ root: elimText });
  }
  
  // Set palette button state
  const paletteBtns = document.querySelectorAll('#spColorRow .d-type-btn');
  paletteBtns.forEach(btn => {
    btn.classList.remove('on');
    if (btn.textContent.toLowerCase().includes(_sPalette)) {
      btn.classList.add('on');
    }
  });
  
  // Responsive canvas
  setTimeout(resizeSpCanvas, 100);
  
  // ResizeObserver for auto-resize
  const wrap = document.querySelector('.sp-wrap');
  if (wrap && window.ResizeObserver) {
    _spResizeObserver = new ResizeObserver(() => {
      if (!_spSpin) resizeSpCanvas();
    });
    _spResizeObserver.observe(wrap.parentElement);
  }
  
  // Drag to spin
  initDragSpin();
  
  // Window resize handler
  _spResizeHandler = () => {
    if (!_spSpin) resizeSpCanvas();
  };
  window.addEventListener('resize', _spResizeHandler);
}

function clearSpHist() {
  _spHistory = [];
  $('spHist').innerHTML = '<span style="color:var(--t3)">—</span>';
  if (typeof playTick === 'function') playTick();
}
