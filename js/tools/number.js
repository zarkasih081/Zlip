// ═══════════════════════════════════════════
//  NUMBER RANDOMIZER (Acak Angka)
// ═══════════════════════════════════════════

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
  
  if (typeof conf === 'function') conf();
  if (typeof playWin === 'function') playWin();
  

  if (typeof announceA11y === 'function') {
    announceA11y(`Angka diacak: ${results.join(', ')}`);
  }
}
