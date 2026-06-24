// ═══════════════════════════════════════════
//  ALAT KELAS (Menu Kelas)
// ═══════════════════════════════════════════

// ── 0. LOCAL STORAGE ──
function saveClassData() {
  localStorage.setItem('zlip_cls_name', $('clsNameInp')?.value || '');
  localStorage.setItem('zlip_cls_quest', $('clsQuestInp')?.value || '');
  localStorage.setItem('zlip_cls_flash', $('clsFlashInp')?.value || '');
  localStorage.setItem('zlip_cls_role_mem', $('clsRoleMemInp')?.value || '');
  localStorage.setItem('zlip_cls_role_list', $('clsRoleListInp')?.value || '');
  localStorage.setItem('zlip_cls_act', $('clsActInp')?.value || '');
}

function loadClassData() {
  if (localStorage.getItem('zlip_cls_name')) {
    const el = $('clsNameInp');
    if (el) el.value = localStorage.getItem('zlip_cls_name');
  }
  if (localStorage.getItem('zlip_cls_quest')) {
    const el = $('clsQuestInp');
    if (el) el.value = localStorage.getItem('zlip_cls_quest');
  }
  if (localStorage.getItem('zlip_cls_flash')) {
    const el = $('clsFlashInp');
    if (el) el.value = localStorage.getItem('zlip_cls_flash');
  }
  if (localStorage.getItem('zlip_cls_role_mem')) {
    const el = $('clsRoleMemInp');
    if (el) el.value = localStorage.getItem('zlip_cls_role_mem');
  }
  if (localStorage.getItem('zlip_cls_role_list')) {
    const el = $('clsRoleListInp');
    if (el) el.value = localStorage.getItem('zlip_cls_role_list');
  }
  if (localStorage.getItem('zlip_cls_act')) {
    const el = $('clsActInp');
    if (el) el.value = localStorage.getItem('zlip_cls_act');
  }
  updateClassNameTotal();
}

// ── 1. PILIH NAMA ──
function getClassNameList() {
  const inp = $('clsNameInp');
  if(!inp) return [];
  return inp.value.split(/[\n,]+/).map(x => x.trim()).filter(x => x !== '');
}

function updateClassNameTotal() {
  const total = getClassNameList().length;
  const el = $('clsNameTotal');
  if (el) el.textContent = 'Total nama: ' + total;
}

function fillSampleNames() {
  const inp = $('clsNameInp');
  if(inp) {
    inp.value = "Ahmad\nAisyah\nBilal\nFatimah\nHasan\nHusain";
    updateClassNameTotal();
    saveClassData();
  }
}

async function copyClassResult(elementId, title) {
  const el = $(elementId);
  if (!el) return;
  let text = el.innerText || el.textContent;
  if (!text || text.trim() === '') return typeof msg === 'function' ? msg('Belum ada hasil untuk disalin!') : alert('Kosong');
  
  if (elementId === 'clsNameResult') {
     const spans = Array.from(el.querySelectorAll('span'));
     if(spans.length > 0) text = spans.map(s => s.textContent).join('\n');
  }
  
  const finalTitle = title || 'HASIL UNDIAN';
  const finalText = `*${finalTitle}*\n\n${text}`;
  
  const success = typeof copyTextSafe === 'function'
    ? await copyTextSafe(finalText)
    : false;
    
  if (typeof msg === 'function') {
    msg(success ? 'Disalin ke clipboard!' : 'Gagal menyalin');
  }
}

function attachClassStorageListeners() {
  const inputs = ['clsNameInp', 'clsQuestInp', 'clsFlashInp', 'clsRoleMemInp', 'clsRoleListInp', 'clsActInp'];
  inputs.forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('input', saveClassData);
  });
  if($('clsNameInp')) {
    $('clsNameInp').addEventListener('input', updateClassNameTotal);
  }
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
  
  // Langsung eksekusi tanpa interval berlebihan
  let finalNames = [];
  let pool = [...list];
  for(let i=0; i<pickCount; i++) {
    if(pool.length === 0) break;
    let rIdx = Math.floor(cryptoRandom() * pool.length);
    finalNames.push(pool.splice(rIdx, 1)[0]);
  }
  
  res.innerHTML = '';
  finalNames.forEach(n => {
    const span = document.createElement('span');
    span.className = 'cls-pop-anim';
    span.style.cssText = 'display:inline-block; padding:4px 8px; margin:4px; background:var(--bg3); border-radius:6px; border:1px solid var(--bdr); font-weight:bold;';
    span.textContent = n;
    res.appendChild(span);
  });
  res.style.transform = 'scale(1)';
  
  const copyBtn = $('clsNameCopyBtn');
  if(copyBtn) copyBtn.style.display = 'block';
  
  if(removeOpt && removeOpt.checked) {
    list = list.filter(n => !finalNames.includes(n));
    $('clsNameInp').value = list.join('\n');
    updateClassNameTotal();
    saveClassData();
  }
  

  if (typeof playWin === 'function') playWin();
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
      
      // Trigger animation
      res.classList.remove('cls-pop-anim');
      void res.offsetWidth;
      res.classList.add('cls-pop-anim');
      
      const copyBtn = $('clsQuestCopyBtn');
      if(copyBtn) copyBtn.style.display = 'block';
      
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

function loadFlashPreset(key, silent = false) {
  if (FLASH_PRESETS[key]) {
    $('clsFlashInp').value = FLASH_PRESETS[key].join('\n');
    saveClassData();
    loadCustomFlashcards();
    if (!silent && typeof msg === 'function') msg('Preset dimuat!');
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
  
  if ($('clsFlashCount')) $('clsFlashCount').textContent = `Total kartu: ${_flashcards.length}`;
  
  nextClassFlash();
}

function prevClassFlash() {
  if (_flashcards.length === 0) return;
  _flashIndex--;
  if (_flashIndex < 0) _flashIndex = _flashcards.length - 1;
  _isFlashFront = true;
  updateFlashcardUI();
  
  const card = $('clsFlashCard');
  if(card) card.style.transform = 'rotateY(0deg)';
}

function nextClassFlash(ordered = false) {
  const inp = $('clsFlashInp');
  if(!inp) return;
  const lines = inp.value.split('\n').map(x => x.trim()).filter(x => x.includes('|'));
  if(lines.length === 0) return msg(typeof t === 'function' ? (t('cls_fc_err') || 'Format salah. Gunakan: Soal | Jawaban') : 'Format salah. Gunakan: Soal | Jawaban');
  
  _flashcards = lines.map(line => {
    let parts = line.split('|');
    return { front: parts[0].trim(), back: parts[1].trim() };
  });

  if (ordered) {
    _flashIndex++;
    if (_flashIndex >= _flashcards.length) _flashIndex = 0;
  } else {
    let nextIdx = _flashIndex;
    if (_flashcards.length > 1) {
      while(nextIdx === _flashIndex) {
        nextIdx = Math.floor(cryptoRandom() * _flashcards.length);
      }
    } else {
      nextIdx = 0;
    }
    _flashIndex = nextIdx;
  }
  
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
    if ($('clsFlashCount')) $('clsFlashCount').textContent = `Kartu ${_flashIndex + 1} dari ${_flashcards.length}`;
  }
}

// ── 3.5. ACAK AKTIVITAS ──
function pickClassAct() {
  const inp = $('clsActInp');
  if(!inp) return;
  let list = inp.value.split(/[\n,]+/).map(x => x.trim()).filter(x => x !== '');
  if(list.length === 0) return typeof msg === 'function' ? msg('Daftar aktivitas kosong!') : alert('Daftar kosong!');
  
  const res = $('clsActResult');
  let ticks = 0;
  
  const interval = setInterval(() => {
    res.innerText = list[Math.floor(cryptoRandom() * list.length)];
    res.style.opacity = '0.5';
    if(typeof playTick === 'function') playTick();
    ticks++;
    if(ticks >= 15) {
      clearInterval(interval);
      let finalAct = list[Math.floor(cryptoRandom() * list.length)];
      res.innerText = finalAct;
      res.style.opacity = '1';
      res.style.color = 'var(--acc)';
      
      // Trigger animation
      res.classList.remove('cls-pop-anim');
      void res.offsetWidth;
      res.classList.add('cls-pop-anim');
      
      if (typeof playWin === 'function') playWin();
    }
  }, 60);
}

// ── 3.6. CONTOH DATA ──
function loadSampleData(type) {
  if (type === 'quest') {
    const inp = $('clsQuestInp');
    if (inp) {
      inp.value = "Apa makanan favoritmu?\nSiapa pahlawan idolamu?\nJika punya kekuatan super, kamu ingin apa?\nApa kenangan masa kecilmu yang paling berkesan?";
      saveClassData();
      if(typeof msg === 'function') msg('Contoh pertanyaan dimuat!');
    }
  } else if (type === 'role') {
    const inp = $('clsRoleListInp');
    if (inp) {
      inp.value = "Leader\nTimekeeper\nDokumentasi\nPresenter";
      saveClassData();
      if(typeof msg === 'function') msg('Contoh peran dimuat!');
    }
  }
}


// ── 4. ACAK PERAN ──
function copyNamesToRoles() {
  const nameInp = $('clsNameInp');
  const roleMemInp = $('clsRoleMemInp');
  if (nameInp && roleMemInp) {
    roleMemInp.value = nameInp.value;
    saveClassData();
    if(typeof msg === 'function') msg('Daftar nama berhasil disalin!');
  }
}

function assignClassRoles() {
  const memInp = $('clsRoleMemInp');
  const roleInp = $('clsRoleListInp');
  if(!memInp || !roleInp) return;
  
  let members = memInp.value.split(/[\n,]+/).map(x => x.trim()).filter(x => x !== '');
  let roles = roleInp.value.split(/[\n,]+/).map(x => x.trim()).filter(x => x !== '');
  
  if (members.length === 0) return msg('Daftar anggota kosong!');
  if (roles.length === 0) return msg('Daftar peran kosong!');
  
  // Acak anggota
  members = shuffleArray(members);
  
  let assignments = [];
  members.forEach((m, i) => {
    let r = roles[i % roles.length];
    assignments.push({ member: m, role: r });
  });
  
  const res = $('clsRoleResult');
  res.innerHTML = '';
  
  // Tampilkan dengan animasi masuk
  assignments.forEach((assignment, i) => {
    setTimeout(() => {
      let div = document.createElement('div');
      div.className = 'sp-stat-row cls-pop-anim';
      div.style.padding = '8px 12px';
      
      let strong = document.createElement('strong');
      strong.textContent = assignment.member;
      
      let arrow = document.createElement('span');
      arrow.style.color = 'var(--t3)';
      arrow.textContent = ' ➔ ';
      
      let roleSpan = document.createElement('span');
      roleSpan.style.color = 'var(--acc)';
      roleSpan.textContent = assignment.role;
      
      div.appendChild(strong);
      div.appendChild(arrow);
      div.appendChild(roleSpan);
      
      res.appendChild(div);
      if(typeof playTick === 'function') playTick();
    }, i * 200);
  });
  
  _lastRolesText = "*HASIL ACAK PERAN*\n\n" + assignments.map(a => `*${a.member}* ➔ ${a.role}`).join("\n");

  setTimeout(() => {
    if (typeof playWin === 'function') playWin();
    const copyBtn = $('clsRoleCopyBtn');
    if(copyBtn) copyBtn.style.display = 'block';
  }, assignments.length * 200);
}

let _lastRolesText = "";
async function copyClassRoles() {
  if (!_lastRolesText) return;
  const success = typeof copyTextSafe === 'function' ? await copyTextSafe(_lastRolesText) : false;
  if (typeof msg === 'function') msg(success ? 'Disalin ke clipboard!' : 'Gagal menyalin');
}

// ── 5. RESET DATA ──
function resetClassTab(tab) {
  if (tab === 'nama') {
    if($('clsNameInp')) $('clsNameInp').value = '';
    if($('clsNameResult')) $('clsNameResult').innerHTML = '';
    if($('clsNameCopyBtn')) $('clsNameCopyBtn').style.display = 'none';
    updateClassNameTotal();
  } else if (tab === 'tanya') {
    if($('clsQuestInp')) $('clsQuestInp').value = '';
    if($('clsQuestResult')) $('clsQuestResult').innerText = '';
    if($('clsQuestCopyBtn')) $('clsQuestCopyBtn').style.display = 'none';
  } else if (tab === 'flash') {
    if($('clsFlashInp')) $('clsFlashInp').value = '';
    _flashcards = [];
    _flashIndex = -1;
    if($('clsFlashFront')) $('clsFlashFront').innerText = '---';
    if($('clsFlashBack')) $('clsFlashBack').innerText = '---';
    if($('clsFlashCount')) $('clsFlashCount').textContent = 'Total kartu: 0';
  } else if (tab === 'role') {
    if($('clsRoleMemInp')) $('clsRoleMemInp').value = '';
    if($('clsRoleListInp')) $('clsRoleListInp').value = '';
    if($('clsRoleResult')) $('clsRoleResult').innerHTML = '';
    if($('clsRoleCopyBtn')) $('clsRoleCopyBtn').style.display = 'none';
    _lastRolesText = '';
  }
  saveClassData();
  if (typeof msg === 'function') msg('Data dibersihkan!');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  attachClassStorageListeners();
  loadClassData();
  
  // Attach tab listeners
  document.querySelectorAll('.cls-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = e.currentTarget.getAttribute('data-tab');
      if (tabId) switchClassTab(tabId);
    });
  });

  // Load Default Flashcards on boot ONLY IF local storage has no flashcards
  if($('clsFlashInp') && !localStorage.getItem('zlip_cls_flash')) {
    loadFlashPreset('umum', true);
  }
});

function switchClassTab(tabId) {
  // Hide all sections
  document.querySelectorAll('.cls-content-section').forEach(el => {
    el.style.display = 'none';
    el.classList.remove('on');
  });
  
  // Remove 'on' from all tabs
  document.querySelectorAll('.cls-tab-bar .cls-tab-btn').forEach(el => {
    el.classList.remove('on');
  });
  
  // Show target section
  const targetSec = document.getElementById('cls-sec-' + tabId);
  if (targetSec) {
    targetSec.style.display = 'block';
    // Small timeout to allow display:block to apply before adding 'on' for potential transition
    setTimeout(() => {
      targetSec.classList.add('on');
    }, 10);
  }
  
  // Highlight target tab
  const targetTab = document.getElementById('tab-cls-' + tabId);
  if (targetTab) {
    targetTab.classList.add('on');
  }
}
