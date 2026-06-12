// ═══════════════════════════════════════════
//  6. TIMER
// ═══════════════════════════════════════════
let _tmTotal=0, _tmLeft=0, _tmInterval=null, _tmRunning=false;
let _tmAlarmInt=null;
let _tmSoundEnabled = true;
const CIRC=2*Math.PI*90;

function toggleTimerSound() {
  const chk = document.getElementById('tmSoundToggle');
  if (chk) _tmSoundEnabled = chk.checked;
}

function setTimer(h = 0, m = 0, s = 0) {
  stopTimerAlarm();
  clearTimer();

  if (arguments.length === 1) {
    _tmTotal = h;
  } else {
    _tmTotal = h * 3600 + m * 60 + s;
  }

  _tmLeft = _tmTotal;
  $('tmH').value = Math.floor(_tmTotal / 3600);
  $('tmM').value = Math.floor((_tmTotal % 3600) / 60);
  $('tmS').value = _tmTotal % 60;
  renderTimer();
  $('tmLabel').textContent = typeof t === 'function' ? (t('tm_ready') || 'Siap') : 'Siap';
}

function timerApply() {
  timerReset();
  if(typeof msg === 'function') msg(typeof t === 'function' ? (t('tm_applied') || 'Timer diterapkan') : 'Timer diterapkan');
}

function getInputSecs(){ 
  return parseInt($('tmH').value||0)*3600 + parseInt($('tmM').value||0)*60 + parseInt($('tmS').value||0); 
}

function timerToggle(){
  if(_tmAlarmInt) stopTimerAlarm();
  
  if(_tmRunning){ 
    clearInterval(_tmInterval); 
    _tmInterval = null;
    _tmRunning=false; 
    const btn = $('tmStart');
    if(btn) {
      btn.innerHTML=t('tm_btn_resume');
      if(window.lucide) lucide.createIcons({ root: btn });
    }
    $('tmLabel').textContent='Dijeda'; 
  } else {
    if(_tmLeft<=0){ 
      _tmLeft=getInputSecs(); 
      _tmTotal=_tmLeft; 
    }
    if(_tmLeft<=0) return msg(t('msg_err_tm_set') || t('msg_err_tm_set'));
    
    if(_tmInterval) {
      clearInterval(_tmInterval);
      _tmInterval = null;
    }

    _tmRunning=true; 
    const btn = $('tmStart');
    if(btn) {
      btn.innerHTML=t('tm_btn_pause');
      if(window.lucide) lucide.createIcons({ root: btn });
    }
    $('tmLabel').textContent=t('msg_tm_run');
    
    _tmInterval=setInterval(()=>{
      _tmLeft--;
      renderTimer();
      
      const pct = _tmTotal>0 ? (_tmLeft/_tmTotal) : 1;
      if(pct <= 0.25 && _tmLeft > 0 && typeof playTick === 'function') {
        // Play tick sound when urgent
        if(_tmLeft % 2 === 0 && _tmSoundEnabled) playTick();
      }
      
      if(_tmLeft<=0){ 
        clearInterval(_tmInterval); 
        _tmInterval = null;
        _tmRunning=false; 
        const btn = $('tmStart');
        if(btn) {
          btn.innerHTML=t('tm_btn_start_icon');
          if(window.lucide) lucide.createIcons({ root: btn });
        }
        $('tmLabel').textContent='SELESAI!'; 
        
        // Start Alarm
        startTimerAlarm();
      }
    },1000);
  }
}

function startTimerAlarm() {
  const face = document.querySelector('.tm-container');
  if(face) face.classList.add('alarm-active');
  
  $('tmStart').style.display = 'none';
  $('tmStopAlarm').style.display = 'block';
  
  if (_tmSoundEnabled) {
    if(typeof playWin === 'function') playWin();
    if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
    _tmAlarmInt = setInterval(() => {
      if(typeof playWin === 'function') playWin();
      if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }, 1200);
  } else {
    // visual blink only
    _tmAlarmInt = setInterval(() => {}, 1200);
  }
  
  msg(t('msg_tm_timeup'), 3000);
  if (typeof announceA11y === 'function') announceA11y('Waktu habis!');
}

function stopTimerAlarm() {
  const hadAlarm = !!_tmAlarmInt;

  if(_tmAlarmInt) {
    clearInterval(_tmAlarmInt);
    _tmAlarmInt = null;
  }

  const face = document.querySelector('.tm-container');
  if(face) face.classList.remove('alarm-active');

  const tmStart = $('tmStart');
  const tmStopAlarm = $('tmStopAlarm');
  if(tmStart) tmStart.style.display = 'block';
  if(tmStopAlarm) tmStopAlarm.style.display = 'none';

  if (hadAlarm && $('tmLabel')) {
    $('tmLabel').textContent = t('tm_status_done');
  }
}

function timerReset(){ 
  stopTimerAlarm();
  clearTimer(); 
  _tmLeft=getInputSecs(); 
  _tmTotal=_tmLeft; 
  renderTimer(); 
  $('tmLabel').textContent='Siap'; 
  const btn = $('tmStart');
  if(btn) {
    btn.innerHTML=t('tm_btn_start_icon');
    if(window.lucide) lucide.createIcons({ root: btn });
  }
}

function clearTimer(){ 
  if(_tmInterval){ clearInterval(_tmInterval); _tmInterval=null; } 
  _tmRunning=false; 
}

function renderTimer(){
  const h=Math.floor(_tmLeft/3600), m=Math.floor((_tmLeft%3600)/60), s=_tmLeft%60;
  
  // Format MM:SS or HH:MM:SS
  $('tmDisplay').textContent = _tmTotal>=3600 
    ? `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}` 
    : `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    
  const prog=$('tmProg');
  const face=document.querySelector('.tm-container');
  const disp=$('tmDisplay');
  
  if(prog) {
    const pct=_tmTotal>0?(_tmLeft/_tmTotal):1;
    prog.style.strokeDashoffset=(CIRC*(1-pct)).toFixed(2);
    
    if(pct<=0.25 && pct>0 && _tmLeft > 0) {
      prog.classList.add('urgent');
      if(face) face.classList.add('urgent');
      if(disp) disp.classList.add('urgent');
    } else {
      prog.classList.remove('urgent');
      if(face) face.classList.remove('urgent');
      if(disp) disp.classList.remove('urgent');
    }
  }
}
