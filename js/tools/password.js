// ═══════════════════════════════════════════
//  7. PASSWORD
// ═══════════════════════════════════════════
let _pwHist = [];

function genPw(){
  let parsedLen = parseInt($('pwLen').value) || 16;
  const len = Math.max(1, Math.min(64, parsedLen));
  let uc = $('pwUc').checked;
  const lc = $('pwLc').checked;
  const nu = $('pwNum').checked;
  const sy = $('pwSym').checked;
  
  if(!uc && !lc && !nu && !sy) {
    if(typeof msg === 'function') msg(t('pw_err_type') || 'Select at least one character type!');
    $('pwUc').checked = true;
    uc = true;
  }
  
  let charSets = [];
  let chars = '';
  let types = 0;
  if(uc) { const s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; charSets.push(s); chars += s; types++; }
  if(lc) { const s = 'abcdefghijklmnopqrstuvwxyz'; charSets.push(s); chars += s; types++; }
  if(nu) { const s = '0123456789'; charSets.push(s); chars += s; types++; }
  if(sy) { const s = '!@#$%^&*()_+~`|}{[]:;?><,./-='; charSets.push(s); chars += s; types++; }
  
  const getRandomChar = (charset) => {
    const randomArray = new Uint32Array(1);
    window.crypto.getRandomValues(randomArray);
    return charset[randomArray[0] % charset.length];
  };

  let resArray = [];
  // Pastikan minimal ada 1 karakter dari setiap set yang dipilih
  charSets.forEach(set => resArray.push(getRandomChar(set)));
  
  // Penuhi sisa panjang sandi
  while(resArray.length < len) {
    resArray.push(getRandomChar(chars));
  }
  
  // Acak urutan hasil (Fisher-Yates shuffle dengan crypto)
  for (let i = resArray.length - 1; i > 0; i--) {
    const randomArray = new Uint32Array(1);
    window.crypto.getRandomValues(randomArray);
    const j = randomArray[0] % (i + 1);
    [resArray[i], resArray[j]] = [resArray[j], resArray[i]];
  }
  
  let res = resArray.join('');
  if (res.length > len) res = res.substring(0, len);
  
  const display = $('pwR');
  display.value = res;
  display.classList.add('win'); 
  setTimeout(()=>display.classList.remove('win'), 400);
  
  playTick();
  updatePwStrength(len, types);
  addPwHist(res);
  if (typeof announceA11y === 'function') announceA11y('Sandi baru berhasil dibuat');
}

function evaluateCustomPw() {
  const text = $('pwR').value;
  if (!text) {
    const fill = $('pwStrengthFill');
    const txt = $('pwStrengthText');
    if(fill) fill.style.width = '0%';
    if(txt) {
      txt.textContent = t('pw_strength_empty');
      txt.style.color = 'var(--t3)';
    }
    return;
  }
  
  let types = 0;
  if (/[A-Z]/.test(text)) types++;
  if (/[a-z]/.test(text)) types++;
  if (/[0-9]/.test(text)) types++;
  if (/[^A-Za-z0-9]/.test(text)) types++;
  
  updatePwStrength(text.length, types);
}

function updatePwStrength(len, types) {
  const fill = $('pwStrengthFill');
  const txt = $('pwStrengthText');
  if(!fill || !txt) return;
  
  // Basic entropy estimation
  let score = 0;
  if (len > 8) score += 1;
  if (len >= 12) score += 1;
  if (len >= 16) score += 1;
  score += (types - 1); // up to +3
  
  if(score <= 2) {
    fill.style.width = '30%';
    fill.style.background = 'var(--rose)';
    txt.textContent = t('pw_strength_weak');
    txt.style.color = 'var(--rose)';
  } else if (score <= 4) {
    fill.style.width = '65%';
    fill.style.background = 'var(--warn)';
    txt.textContent = t('pw_strength_fair');
    txt.style.color = 'var(--warn)';
  } else {
    fill.style.width = '100%';
    fill.style.background = 'var(--mint)';
    txt.textContent = t('pw_strength_strong');
    txt.style.color = 'var(--mint)';
  }
}

async function copyPw(text) {
  if(!text || text === 'P@ssw0rd!') return;
  const success = await copyTextSafe(text);
  if(success) {
    msg(t('msg_pw_copied'));
  } else {
    msg("Gagal menyalin. Salin manual dari teks yang ditampilkan.");
  }
}

function addPwHist(pw) {
  _pwHist.unshift(pw);
  if(_pwHist.length > 5) _pwHist.pop();
  renderPwHist();
}

function renderPwHist() {
  const hist = $('pwHist');
  if(!hist) return;
  
  if(_pwHist.length === 0) {
    hist.innerHTML = '<div style="color:var(--t3); font-size:0.75rem; text-align:center; padding:12px 0;">' + (t('pw_no_hist') || (t('pw_no_hist') || 'Belum ada riwayat')) + '</div>';
    return;
  }
  
  hist.innerHTML = '';
  _pwHist.forEach(pw => {
    const masked = pw.substring(0, 4) + '***' + pw.substring(pw.length - 2);
    const item = document.createElement('div');
    item.className = 'pw-hist-item';
    
    const spanPw = document.createElement('span');
    spanPw.className = 'pw-hist-pw';
    spanPw.title = 'Klik untuk salin';
    spanPw.textContent = masked;
    spanPw.addEventListener('click', () => copyPw(pw));
    
    const spanCopy = document.createElement('span');
    spanCopy.className = 'pw-hist-copy';
    spanCopy.innerHTML = '<i data-lucide="copy" style="width:14px; height:14px;"></i>';
    spanCopy.addEventListener('click', () => copyPw(pw));
    
    item.appendChild(spanPw);
    item.appendChild(spanCopy);
    hist.appendChild(item);
  });
  lucide.createIcons();
}

function clearPwHist() {
  if(_pwHist.length === 0) return;
  openConfirmModal(t('mdl_rst_pw_title'), t('mdl_rst_pw_msg'), () => {
      _pwHist = [];
      renderPwHist();
      msg(t('pw_hist_del') || t('pw_hist_del'));
    }
  );
}
