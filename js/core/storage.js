// ═══════════════════════════════════════════
//  STORAGE & GLOBAL STATE
// ═══════════════════════════════════════════
const STORAGE_PREFIX = 'zl_';
const EXTRA_PREFIXES = ['zlip_cls_'];

function isZlipKey(key) {
  return key.startsWith(STORAGE_PREFIX) || EXTRA_PREFIXES.some(p => key.startsWith(p));
}

function getStore(k, d) {
  try {
    const val = localStorage.getItem(STORAGE_PREFIX + k);
    if (val !== null) {
      // Try to parse as JSON first
      try {
        return JSON.parse(val);
      } catch {
        return val; // Fallback for raw strings
      }
    }
  } catch(e) {}
  return d;
}

function setStore(k, v) {
  try {
    const value = typeof v === 'object' ? JSON.stringify(v) : String(v);
    localStorage.setItem(STORAGE_PREFIX + k, value);
  } catch (error) {
    console.warn("Storage failed:", error);
  }
}

const GlobalState = {
  lang: getStore('lang', 'id'),
  theme: getStore('theme', 'light'),
  sound: getStore('sound', true),
  animations: getStore('animations', true),
  favorites: getStore('favorites', ['sp', 'dc', 'cn', 'tm'])
};

function saveGlobalState() {
  setStore('lang', GlobalState.lang);
  setStore('theme', GlobalState.theme);
  setStore('sound', GlobalState.sound);
  setStore('animations', GlobalState.animations);
  setStore('favorites', GlobalState.favorites);

}

function exportData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (isZlipKey(key)) {
      data[key] = localStorage.getItem(key);
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zlip_backup_${new Date().getTime()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  msg(t('msg_data_exp'));
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      for (const key in data) {
        if (isZlipKey(key)) {
          localStorage.setItem(key, data[key]);
        }
      }
      msg(t('msg_data_imp'));
      setTimeout(() => location.reload(), 1500);
    } catch(err) {
      msg(t('msg_err_imp'));
    }
  };
  reader.readAsText(file);
}

function resetAllData() {
  const doReset = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      if (isZlipKey(localStorage.key(i))) {
        keys.push(localStorage.key(i));
      }
    }
    keys.forEach(k => localStorage.removeItem(k));
    if (typeof msg === 'function') msg(t('msg_data_rst'));
    setTimeout(() => location.reload(), 1000);
  };

  if (typeof openConfirmModal === 'function') {
    openConfirmModal(
      'Reset Data',
      t('mdl_rst_msg'),
      doReset
    );
  } else {
    if(confirm(t('mdl_rst_all_fallback'))) {
      doReset();
    }
  }
}
