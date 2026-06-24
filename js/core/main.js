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

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(cryptoRandom() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
    const isOpen = drawer.classList.toggle('open');
    const content = drawer.querySelector('.mobile-drawer-content');
    drawer.dataset.open = isOpen ? 'true' : 'false';
    drawer.setAttribute('aria-hidden', String(!isOpen));
    drawer.style.transition = 'none';
    drawer.style.opacity = isOpen ? '1' : '0';
    drawer.style.pointerEvents = isOpen ? 'auto' : 'none';
    if (content) {
      content.style.transition = 'none';
      content.style.transform = isOpen ? 'translateY(0)' : 'translateY(100%)';
    }
    document.body.classList.toggle('drawer-open', isOpen);
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
    'sp': { icon: 'pie-chart', name: t('nav_sp') || 'Roda', color: 'var(--acc)' },
    'dc': { icon: 'dice-5', name: t('nav_dc') || 'Dadu', color: 'var(--violet)' },
    'cn': { icon: 'coins', name: t('nav_cn') || 'Koin', color: 'var(--acc)' },
    'tg': { icon: 'users', name: t('nav_tg') || 'Tim', color: 'var(--ora)' },
    'class': { icon: 'graduation-cap', name: t('nav_class') || 'Kelas', color: 'var(--sky)' },
    'num': { icon: 'hash', name: t('nav_num') || 'Angka', color: 'var(--cyan)' },
    'tm': { icon: 'timer', name: t('nav_tm') || 'Timer', color: 'var(--grn)' }
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
  
  // removed pw init
  
  // 3. Render Home widgets
  renderFavorites();
  
  // 4. Lucide Icons & Language
  if (typeof applyLanguage === 'function') applyLanguage();
  else if (window.lucide) lucide.createIcons();
  if (typeof updateDynamicTexts === 'function') updateDynamicTexts();
  
  // 5. PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => {
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
                <span style="font-weight:600; display:flex; align-items:center; gap:6px;">
                  <i data-lucide="refresh-cw" style="width:16px;"></i> ${m}
                </span>
                <button onclick="location.reload()" style="background:white;color:var(--acc);border:0;padding:8px 16px;border-radius:4px;cursor:pointer;font-weight:700;">
                  Refresh
                </button>
              `;
              document.body.appendChild(banner);
              if (typeof lucide !== 'undefined') lucide.createIcons();
            }
          };
        };
      })
      .catch(err => console.warn('SW Registration failed', err));
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
          const pwaCard = document.getElementById('pwaCard');
          if(pwaCard) pwaCard.style.display = 'none';
        }
        deferredPrompt = null;
      }
    });
  }
  
  // iOS PWA instructions
  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };
  const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);
  
  if (isIos() && !isInStandaloneMode()) {
    setTimeout(() => {
      const iosBanner = document.createElement('div');
      iosBanner.className = 'card cls-pop-anim';
      iosBanner.style.cssText = 'position:fixed; bottom:80px; left:50%; transform:translateX(-50%); width:90%; max-width:400px; z-index:9999; background:var(--bg2); border:2px solid var(--acc); box-shadow:0 10px 30px rgba(0,0,0,0.3); padding:16px; text-align:center; display:flex; flex-direction:column; gap:8px; align-items:center;';
      iosBanner.innerHTML = `
        <button onclick="this.parentElement.remove()" style="position:absolute; top:8px; right:8px; background:none; border:none; color:var(--t2); cursor:pointer;"><i data-lucide="x" style="width:16px; height:16px;"></i></button>
        <div style="font-weight:800; color:var(--t1);">Pasang Aplikasi Zlip</div>
        <div style="font-size:0.85rem; color:var(--t2);">Untuk pengalaman lebih cepat (Offline), pasang Zlip di perangkat iOS Anda.</div>
        <div style="font-size:0.8rem; background:var(--bg3); padding:8px; border-radius:8px; width:100%; margin-top:4px;">Tap ikon <strong>Share</strong> di browser lalu pilih <br/><strong>"Add to Home Screen"</strong> <i data-lucide="plus-square" style="width:14px; vertical-align:middle;"></i></div>
      `;
      document.body.appendChild(iosBanner);
      if (window.lucide) lucide.createIcons({ root: iosBanner });
    }, 3000);
  }
});
