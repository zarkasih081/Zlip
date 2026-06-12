// ═══════════════════════════════════════════
//  NUMBER RANDOMIZER (Acak Angka)
// ═══════════════════════════════════════════
let _lastNumResultText = '';

function generateNumber() {
  const minInp = $('numMin');
  const maxInp = $('numMax');
  const countInp = $('numCount');
  const dupCheck = $('numDuplicate');
  
  if(!minInp || !maxInp || !countInp) return;
  
  let min = parseInt(minInp.value) || 1;
  let max = parseInt(maxInp.value) || 100;
  let count = parseInt(countInp.value) || 1;
  let allowDup = dupCheck ? dupCheck.checked : false;
  
  if (min > max) {
    let temp = min;
    min = max;
    max = temp;
    minInp.value = min;
    maxInp.value = max;
  }
  
  const range = max - min + 1;
  
  if (!allowDup && count > range) {
    if(typeof msg === 'function') msg(t('num_err_range') || 'Jumlah angka unik melebihi rentang yang tersedia!');
    return;
  }
  
  const resArea = $('numResult');
  const listArea = $('numList');
  if(!resArea) return;
  
  const btn = $('btnNumGen');
  if(btn) {
    btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Mengacak...';
    btn.classList.add('disabled');
    btn.style.pointerEvents = 'none';
  }
  
  // Animasi mengacak
  let animTicks = 0;
  const animMax = 15;
  const animInterval = setInterval(() => {
    let tempNum = Math.floor(cryptoRandom() * range) + min;
    resArea.textContent = tempNum;
    if(listArea) listArea.innerHTML = '';
    animTicks++;
    
    if(animTicks >= animMax) {
      clearInterval(animInterval);
      finalizeNumbers(min, max, count, allowDup, range, resArea, listArea, btn);
    }
  }, 50);
}

function finalizeNumbers(min, max, count, allowDup, range, resArea, listArea, btn) {
  let results = [];
  
  if (allowDup) {
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(cryptoRandom() * range) + min);
    }
  } else {
    // Generate unique numbers
    if (range < 10000) {
      // Pool method for small ranges
      let pool = Array.from({length: range}, (_, i) => i + min);
      for (let i = 0; i < count; i++) {
        let rIdx = Math.floor(cryptoRandom() * pool.length);
        results.push(pool.splice(rIdx, 1)[0]);
      }
    } else {
      // Set method for large ranges
      let set = new Set();
      while (set.size < count) {
        set.add(Math.floor(cryptoRandom() * range) + min);
      }
      results = Array.from(set);
    }
  }
  
  // If count is 1, just show it big
  if (count === 1) {
    resArea.textContent = results[0];
    resArea.style.fontSize = '6rem';
    if(listArea) listArea.innerHTML = '';
  } else {
    // If multiple, show the first big, the rest in list, or all in list
    resArea.textContent = results.length + " Angka";
    resArea.style.fontSize = '2.5rem';
    
    if(listArea) {
      listArea.innerHTML = '';
      results.forEach((n, idx) => {
        const chip = document.createElement('div');
        chip.className = 'sp-stat-row';
        chip.style.display = 'inline-block';
        chip.style.padding = '8px 16px';
        chip.style.fontSize = '1.2rem';
        chip.style.fontWeight = '800';
        chip.style.color = 'var(--t1)';
        chip.style.background = 'var(--bg3)';
        chip.style.border = '1px solid var(--bdr)';
        chip.style.borderRadius = '8px';
        chip.textContent = n;
        // Animasi masuk satu per satu
        chip.style.opacity = '0';
        chip.style.transform = 'translateY(10px)';
        chip.style.transition = 'all 0.3s ease';
        listArea.appendChild(chip);
        
        setTimeout(() => {
          chip.style.opacity = '1';
          chip.style.transform = 'translateY(0)';
        }, idx * 50);
      });
    }
  }
  
  // Restore button
  if(btn) {
    btn.innerHTML = typeof t === 'function' ? (t('num_btn') || '<i data-lucide="hash" style="width:18px"></i> Acak Angka') : '<i data-lucide="hash" style="width:18px"></i> Acak Angka';
    btn.classList.remove('disabled');
    btn.style.pointerEvents = 'auto';
  }
  
  const copyBtn = $('btnNumCopy');
  if(copyBtn) copyBtn.style.display = 'inline-flex';
  
  _lastNumResultText = `*HASIL ACAK ANGKA*\n\n${results.join(', ')}`;
  
  let histWrap = $('numHist');
  if(histWrap && histWrap.innerHTML.includes('—')) histWrap.innerHTML = '';
  if (histWrap) {
    const chip = document.createElement('div');
    chip.className = 'sp-hist-chip';
    chip.style.fontSize = '0.75rem';
    chip.style.padding = '4px 12px';
    let resStr = results.join(', ');
    if(resStr.length > 50) resStr = resStr.substring(0, 47) + '...';
    chip.innerHTML = `<span style="color:var(--t3)">[${min}-${max}] ➔</span> <strong style="color:var(--acc)">${resStr}</strong>`;
    histWrap.prepend(chip);
    if(histWrap.children.length > 30) histWrap.removeChild(histWrap.lastChild);
  }
  
  if (typeof conf === 'function') conf();
  if (typeof playWin === 'function') playWin();
  

  if (typeof announceA11y === 'function') {
    announceA11y(`Angka diacak: ${results.join(', ')}`);
  }
}

async function copyNumResult() {
  if(!_lastNumResultText) return;
  const success = typeof copyTextSafe === 'function' ? await copyTextSafe(_lastNumResultText) : false;
  if(typeof msg === 'function') {
    msg(success ? (typeof t === 'function' ? t('msg_copied')||'Disalin!' : 'Disalin!') : 'Gagal menyalin');
  }
}

function clearNumHist() {
  const h = $('numHist');
  if(h) h.innerHTML = '<span style="color:var(--t3)">—</span>';
  if(typeof playTick === 'function') playTick();
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof getStore === 'function') {
    const minInp = $('numMin');
    if(minInp) minInp.value = getStore('numMin', 1);
    
    const maxInp = $('numMax');
    if(maxInp) maxInp.value = getStore('numMax', 100);
    
    const countInp = $('numCount');
    if(countInp) countInp.value = getStore('numCount', 1);
    
    const dupCheck = $('numDuplicate');
    if(dupCheck) dupCheck.checked = getStore('numDuplicate', false) === 'true' || getStore('numDuplicate', false) === true;
    
    const inputs = ['numMin', 'numMax', 'numCount'];
    inputs.forEach(id => {
      const el = $(id);
      if (el) el.addEventListener('input', saveNumSettings);
    });
    
    if(dupCheck) dupCheck.addEventListener('change', saveNumSettings);
  }
});

function saveNumSettings() {
  if (typeof setStore === 'function') {
    setStore('numMin', $('numMin')?.value || 1);
    setStore('numMax', $('numMax')?.value || 100);
    setStore('numCount', $('numCount')?.value || 1);
    setStore('numDuplicate', $('numDuplicate')?.checked || false);
  }
}
