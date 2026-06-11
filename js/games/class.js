// ═══════════════════════════════════════════
//  ALAT KELAS (Menu Kelas)
// ═══════════════════════════════════════════

function switchClassTab(tabId) {
  // Hide all contents and sidebars
  document.querySelectorAll('.cls-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.cls-sb-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.cls-tab-btn').forEach(el => el.classList.remove('on'));
  
  // Show selected
  const tabContent = document.getElementById(tabId);
  if (tabContent) tabContent.style.display = 'block';
  
  const sbContent = document.getElementById(tabId.replace('cls-', 'cls-sb-'));
  if (sbContent) sbContent.style.display = 'block';
  
  // Update button state
  const btn = document.querySelector(`.cls-tab-btn[onclick="switchClassTab('${tabId}')"]`);
  if (btn) btn.classList.add('on');
}

// ── 1. PILIH NAMA ──
function getClassNameList() {
  const inp = $('clsNameInp');
  if(!inp) return [];
  return inp.value.split(/[\n,]+/).map(x => x.trim()).filter(x => x !== '');
}

function updateClassNameCount() {
  const countSpan = $('clsNameCount');
  if(countSpan) countSpan.innerText = getClassNameList().length;
}

if($('clsNameInp')) {
  $('clsNameInp').addEventListener('input', updateClassNameCount);
}

function pickClassName() {
  let list = getClassNameList();
  if(list.length === 0) return msg(typeof t === 'function' ? (t('cls_nm_err_emp') || 'Daftar nama kosong!') : 'Daftar nama kosong!');
  
  const countInp = $('clsNameCount');
  let pickCount = countInp ? parseInt(countInp.value) || 1 : 1;
  if(pickCount > list.length) return msg(typeof t === 'function' ? (t('cls_nm_err_max') || 'Jumlah melebihi daftar nama!') : 'Jumlah melebihi daftar nama!');
  if(pickCount < 1) pickCount = 1;
  
  const res = $('clsNameResult');
  const removeOpt = $('clsNameRemove');
  
  let ticks = 0;
  const maxTicks = 20;
  res.style.transform = 'scale(1.1)';
  
  const interval = setInterval(() => {
    // Show random visual
    let temp = [];
    for(let i=0; i<pickCount; i++){
      temp.push(list[Math.floor(cryptoRandom() * list.length)]);
    }
    res.innerHTML = temp.join('<br>');
    
    if(typeof playTick === 'function') playTick();
    ticks++;
    if(ticks >= maxTicks) {
      clearInterval(interval);
      
      // Final pick without duplication if possible
      let finalNames = [];
      let pool = [...list];
      for(let i=0; i<pickCount; i++) {
        if(pool.length === 0) break;
        let rIdx = Math.floor(cryptoRandom() * pool.length);
        finalNames.push(pool.splice(rIdx, 1)[0]);
      }
      
      res.innerHTML = finalNames.map(n => `<span style="display:inline-block; padding:4px 8px; margin:4px; background:var(--bg3); border-radius:6px; border:1px solid var(--bdr); font-weight:bold;">${n}</span>`).join('');
      res.style.transform = 'scale(1)';
      
      if(removeOpt && removeOpt.checked) {
        list = list.filter(n => !finalNames.includes(n));
        $('clsNameInp').value = list.join('\n');
        updateClassNameCount();
      }
      
      if (typeof conf === 'function') conf();
      if (typeof playWin === 'function') playWin();
    }
  }, 50);
}

// ── 2. PERTANYAAN ACAK ──
function pickClassQuest() {
  const inp = $('clsQuestInp');
  if(!inp) return;
  let list = inp.value.split('\n').map(x => x.trim()).filter(x => x !== '');
  if(list.length === 0) return msg('Daftar pertanyaan kosong!');
  
  const res = $('clsQuestResult');
  let ticks = 0;
  
  const interval = setInterval(() => {
    res.innerText = list[Math.floor(cryptoRandom() * list.length)];
    res.style.opacity = '0.5';
    if(typeof playTick === 'function') playTick();
    ticks++;
    if(ticks >= 15) {
      clearInterval(interval);
      let finalQuest = list[Math.floor(cryptoRandom() * list.length)];
      res.innerText = finalQuest;
      res.style.opacity = '1';
      res.style.color = 'var(--acc)';
      
      if (typeof playWin === 'function') playWin();
    }
  }, 60);
}

// ── 3. FLASHCARD ──
let _flashcards = [];
let _flashIndex = -1;
let _isFlashFront = true;

const FLASH_PRESETS = {
  'hijaiyah': [
    'ا | Alif', 'ب | Ba', 'ت | Ta', 'ث | Tsa', 'ج | Jim', 'ح | Ha', 'خ | Kha', 'د | Dal', 'ذ | Dzal', 'ر | Ra', 'ز | Zai', 'س | Sin', 'ش | Syin', 'ص | Shad', 'ض | Dhad', 'ط | Tha', 'ظ | Zha', 'ع | \'Ain', 'غ | Ghain', 'ف | Fa', 'ق | Qaf', 'ك | Kaf', 'ل | Lam', 'م | Mim', 'ن | Nun', 'هـ | Ha', 'و | Waw', 'ي | Ya'
  ],
  'tajwid': [
    'Izhar | Jelas (Tanpa Dengung)', 'Idgham Bighunnah | Masuk dengan Dengung', 'Idgham Bilaghunnah | Masuk tanpa Dengung', 'Iqlab | Menukar jadi Mim', 'Ikhfa | Samar-samar (Dengung)'
  ],
  'umum': [
    'Ibukota Indonesia | Jakarta', 'Ibukota Jepang | Tokyo', 'Planet Terbesar | Yupiter', 'Pusat Tata Surya | Matahari'
  ],
  'math': [
    '12 x 12 | 144', '15 x 15 | 225', 'Akar 169 | 13', 'Akar 64 | 8', '11 x 11 | 121'
  ]
};

function loadFlashPreset(key) {
  if (FLASH_PRESETS[key]) {
    $('clsFlashInp').value = FLASH_PRESETS[key].join('\n');
    loadCustomFlashcards();
    msg('Preset dimuat!');
  }
}

function loadCustomFlashcards() {
  const inp = $('clsFlashInp');
  if(!inp) return;
  const lines = inp.value.split('\n').map(x => x.trim()).filter(x => x.includes('|'));
  if(lines.length === 0) return msg('Format tidak valid. Gunakan: Depan | Belakang');
  
  _flashcards = lines.map(line => {
    let parts = line.split('|');
    return { front: parts[0].trim(), back: parts[1].trim() };
  });
  
  nextClassFlash();
}

function nextClassFlash() {
  const inp = $('clsFlashInp');
  if(!inp) return;
  const lines = inp.value.split('\n').map(x => x.trim()).filter(x => x.includes('|'));
  if(lines.length === 0) return msg(typeof t === 'function' ? (t('cls_fc_err') || 'Format salah. Gunakan: Soal | Jawaban') : 'Format salah. Gunakan: Soal | Jawaban');
  
  _flashcards = lines.map(line => {
    let parts = line.split('|');
    return { front: parts[0].trim(), back: parts[1].trim() };
  });

  _flashIndex = Math.floor(cryptoRandom() * _flashcards.length);
  _isFlashFront = true;
  updateFlashcardUI();
  
  const card = $('clsFlashCard');
  if(card) {
    card.style.transform = 'rotateY(0deg)';
  }
}

function flipClassFlash() {
  if (_flashcards.length === 0) return;
  _isFlashFront = !_isFlashFront;
  const card = $('clsFlashCard');
  if(card) {
    card.style.transform = _isFlashFront ? 'rotateY(0deg)' : 'rotateY(180deg)';
    if(typeof playTick === 'function') playTick();
  }
}

function updateFlashcardUI() {
  if (_flashIndex >= 0 && _flashIndex < _flashcards.length) {
    $('clsFlashFront').innerText = _flashcards[_flashIndex].front;
    $('clsFlashBack').innerText = _flashcards[_flashIndex].back;
  }
}

// ── 4. ACAK AKTIVITAS ──
function pickClassAct() {
  const inp = $('clsActInp');
  if(!inp) return;
  let list = inp.value.split(/[\n,]+/).map(x => x.trim()).filter(x => x !== '');
  if(list.length === 0) return msg(typeof t === 'function' ? (t('cls_act_err') || 'Daftar aktivitas kosong!') : 'Daftar aktivitas kosong!');
  
  const res = $('clsActResult');
  let ticks = 0;
  
  const interval = setInterval(() => {
    res.innerText = list[Math.floor(cryptoRandom() * list.length)];
    if(typeof playTick === 'function') playTick();
    ticks++;
    if(ticks >= 20) {
      clearInterval(interval);
      let finalAct = list[Math.floor(cryptoRandom() * list.length)];
      res.innerText = finalAct;
      if (typeof conf === 'function') conf();
      if (typeof playWin === 'function') playWinPremium();
    }
  }, 40);
}

// ── 5. ACAK PERAN ──
function assignClassRoles() {
  const memInp = $('clsRoleMemInp');
  const roleInp = $('clsRoleListInp');
  if(!memInp || !roleInp) return;
  
  let members = memInp.value.split(/[\n,]+/).map(x => x.trim()).filter(x => x !== '');
  let roles = roleInp.value.split(/[\n,]+/).map(x => x.trim()).filter(x => x !== '');
  
  if (members.length === 0) return msg('Daftar anggota kosong!');
  if (roles.length === 0) return msg('Daftar peran kosong!');
  
  // Acak anggota
  members.sort(() => cryptoRandom() - 0.5);
  
  let assignments = [];
  members.forEach((m, i) => {
    let r = roles[i % roles.length];
    assignments.push(`<strong>${m}</strong> <span style="color:var(--t3)">➔</span> <span style="color:var(--acc)">${r}</span>`);
  });
  
  const res = $('clsRoleResult');
  res.innerHTML = '';
  
  // Tampilkan dengan animasi masuk
  assignments.forEach((html, i) => {
    setTimeout(() => {
      let div = document.createElement('div');
      div.className = 'sp-stat-row';
      div.style.padding = '8px 12px';
      div.innerHTML = html;
      res.appendChild(div);
      if(typeof playTick === 'function') playTick();
    }, i * 200);
  });
  
  setTimeout(() => {
    if (typeof playWin === 'function') playWin();
  }, assignments.length * 200);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Load Default Flashcards on boot
  if($('clsFlashInp')) {
    loadFlashPreset('umum');
  }
});
