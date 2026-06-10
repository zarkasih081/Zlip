// ═══════════════════════════════════════════
//  MAIN & ROUTING
// ═══════════════════════════════════════════

function cryptoRandom() {
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }
  return Math.random();
}

async function copyTextSafe(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    textarea.remove();
    return success;
  } catch {
    return false;
  }
}

function announceA11y(text) {
  const announcer = document.getElementById('a11y-announcer');
  if (announcer) {
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = text; }, 50);
  }
}

function toggleTheme() {
  const current = GlobalState.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  GlobalState.theme = next;
  saveGlobalState();
  applyTheme();
  if (typeof dW === 'function') dW(); // Redraw spinner if active
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', GlobalState.theme);
  const tBtn = $('settingThemeToggle');
  if(tBtn) tBtn.checked = (GlobalState.theme === 'dark');
}

function toggleSound() {
  GlobalState.sound = $('settingSoundToggle') ? !$('settingSoundToggle').checked : !GlobalState.sound;
  saveGlobalState();
  msg(GlobalState.sound ? t('msg_snd_on') : t('msg_snd_off'), 1000);
}

function toggleAnim() {
  GlobalState.animations = $('settingAnimToggle') ? !$('settingAnimToggle').checked : !GlobalState.animations;
  saveGlobalState();
  initAmbient();
  msg(GlobalState.animations ? t('msg_anim_on') : t('msg_anim_off'), 1000);
}

function go(n) {
  if (typeof stopTimerAlarm === 'function') stopTimerAlarm();
  if (typeof toggleAutoDrawBg === 'function' && typeof _bgAutoDrawInt !== 'undefined' && _bgAutoDrawInt) toggleAutoDrawBg();

  document.querySelectorAll('.pn').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.sb-i').forEach(s => s.classList.remove('on'));
  
  const page = $('p-' + n);
  if(page) page.classList.add('on');
  
  const btn = document.querySelector(`.sb-i[data-page="${n}"]`);
  if (btn) btn.classList.add('on');
}

function toggleMobileMenu() {
  const drawer = document.getElementById('mobileDrawer');
  if (drawer) {
    drawer.classList.toggle('open');
  }
}

function toggleFullscreen() {
  const isFs = document.body.classList.toggle('fs-mode');
  if (isFs) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  } else {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }
  // Resize spinner if active
  if (typeof resizeSpCanvas === 'function') setTimeout(resizeSpCanvas, 400);
}


function renderFavorites() {
  const container = $('homeFavorites');
  if(!container) return;
  container.innerHTML = '';
  
  const allFeatures = {
    'sp': { icon: 'pie-chart', name: t('nav_sp'), color: 'var(--acc)' },
    'dc': { icon: 'dice-5', name: t('nav_dc'), color: 'var(--violet)' },
    'cn': { icon: 'coins', name: t('nav_cn'), color: 'var(--acc)' },
    'cd': { icon: 'layers', name: t('nav_cd'), color: 'var(--rose)' },
    'bg': { icon: 'grid-3x3', name: t('nav_bg'), color: 'var(--sky)' },
    'lt': { icon: 'ticket', name: t('nav_lt'), color: 'var(--cyan)' },
    'tm': { icon: 'timer', name: t('nav_tm'), color: 'var(--grn)' },
    'tg': { icon: 'users', name: t('nav_tg'), color: 'var(--ora)' },
    'pw': { icon: 'key', name: t('nav_pw'), color: '#ff69b4' } // Merah muda
  };
  
  Object.keys(allFeatures).forEach(f => {
    if(!allFeatures[f]) return;
    const btn = document.createElement('button');
    btn.className = 'fav-btn card';
    btn.onclick = () => {
      go(f);
    };
    btn.innerHTML = `
      <i data-lucide="${allFeatures[f].icon}" class="ic" style="color:${allFeatures[f].color};margin-bottom:8px"></i>
      <span style="font-size:0.75rem;font-weight:700">${allFeatures[f].name}</span>
    `;
    container.appendChild(btn);
  });
  
  if(window.lucide) lucide.createIcons({root: container});
}

function initSettingsUI() {
  const lBtn = $('langSelect');
  if(lBtn) lBtn.value = GlobalState.lang;

  const tBtn = $('settingThemeToggle');
  if(tBtn) tBtn.checked = (GlobalState.theme === 'dark');
  
  const sBtn = $('settingSoundToggle');
  if(sBtn) sBtn.checked = !GlobalState.sound;
  
  const aBtn = $('settingAnimToggle');
  if(aBtn) aBtn.checked = !GlobalState.animations;
}

// ═══════════════════════════════════════════
//  APP INITIALIZATION
// ═══════════════════════════════════════════
window.onload = () => {
  // 1. Apply Settings
  applyTheme();
  initSettingsUI();
  
  // 2. Initialize Features
  if(typeof initSpinner === 'function') initSpinner();
  if(typeof initBg === 'function') initBg();
  if(typeof renderTimer === 'function') renderTimer();
  if(typeof updateIdleCoins === 'function') updateIdleCoins();
  
  const storedTg = getStore('tg', "Andi, Budi, Citra, Dian, Eka, Fajar, Gina, Hadi");
  const tgInp = $('tgI');
  if(tgInp) tgInp.value = storedTg;

  const tgTasks = $('tgTasks');
  if(tgTasks) tgTasks.value = getStore('tgTasks', '');

  const tgTaskMode = $('tgTaskMode');
  if(tgTaskMode) tgTaskMode.value = getStore('tgTaskMode', 'person');

  const tgUniqueTasks = $('tgUniqueTasks');
  if(tgUniqueTasks) tgUniqueTasks.checked = getStore('tgUniqueTasks', false);

  if(typeof restoreTeamResult === 'function') restoreTeamResult();
  
  const pwLen = $('pwLen');
  if(pwLen) {
    const pwVal = $('pwLenVal');
    if(pwVal) pwVal.innerText = pwLen.value;
    if(typeof genPw === 'function') genPw();
  }
  
  // 3. Render Home widgets
  renderFavorites();
  
  // 4. Lucide Icons & Language
  if (typeof applyLanguage === 'function') applyLanguage();
  else if (window.lucide) lucide.createIcons();
  
  // 5. PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => {
        console.log('SW Registered', reg);
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              const banner = document.createElement('div');
              banner.id = 'updateBanner';
              banner.style.cssText = `
                position: fixed; bottom: 0; left: 0; right: 0;
                background: var(--acc); color: white;
                padding: 12px 16px; z-index: 9999;
                display: flex; align-items: center; justify-content: space-between;
              `;
              const m = typeof t === 'function' ? (t('msg_update') || 'Pembaruan tersedia!') : 'Pembaruan tersedia!';
              banner.innerHTML = `
                <span style="font-weight:600">🔄 ${m}</span>
                <button onclick="location.reload()" style="background:white;color:var(--acc);border:0;padding:8px 16px;border-radius:4px;cursor:pointer;font-weight:700;">
                  Refresh
                </button>
              `;
              document.body.appendChild(banner);
            }
          };
        };
      })
      .catch(err => console.log('SW Registration failed', err));
  }
};

// ── PWA INSTALL PROMPT ──
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome from showing the mini-infobar
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can install the PWA
  const pwaCard = document.getElementById('pwaCard');
  if(pwaCard) pwaCard.style.display = 'flex';
});

document.addEventListener('DOMContentLoaded', () => {
  const btnInstall = document.getElementById('btnInstallPwa');
  if(btnInstall) {
    btnInstall.addEventListener('click', async () => {
      if (deferredPrompt) {
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          const pwaCard = document.getElementById('pwaCard');
          if(pwaCard) pwaCard.style.display = 'none';
        }
        deferredPrompt = null;
      }
    });
  }
});
