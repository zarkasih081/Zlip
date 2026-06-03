// ═══════════════════════════════════════════
//  AUDIO MANAGER (Web Audio API Synthesizer)
// ═══════════════════════════════════════════

let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Master volume control
const MASTER_VOL = 0.5;

// Helper to play a smooth tone with ADSR envelope
function playTone(freq, type, duration, vol = 0.1) {
  if (typeof GlobalState !== 'undefined' && !GlobalState.sound) return;
  
  initAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  const now = audioCtx.currentTime;
  const actualVol = vol * MASTER_VOL;
  
  // Smooth envelope to prevent popping/clicking
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(actualVol, now + 0.01); // Attack
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Decay/Release
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start(now);
  osc.stop(now + duration);
}

// ── STANDARD AUDIO EFFECTS ──

window.playTick = function() {
  if (typeof GlobalState !== 'undefined' && !GlobalState.sound) return;
  // Short, muted wooden tick
  playTone(600, 'triangle', 0.05, 0.2);
};

window.playWin = function() {
  if (typeof GlobalState !== 'undefined' && !GlobalState.sound) return;
  // Pleasant major arpeggio
  setTimeout(() => playTone(523.25, 'sine', 0.4, 0.4), 0);    // C5
  setTimeout(() => playTone(659.25, 'sine', 0.4, 0.4), 100);  // E5
  setTimeout(() => playTone(783.99, 'sine', 0.4, 0.4), 200);  // G5
  setTimeout(() => playTone(1046.50, 'sine', 0.6, 0.5), 300); // C6
};

// ── PREMIUM AUDIO EFFECTS ──

window.playTickPremium = function() {
  if (typeof GlobalState !== 'undefined' && !GlobalState.sound) return;
  // Crisp glass/crystal tick
  playTone(1200, 'sine', 0.03, 0.15);
  setTimeout(() => playTone(800, 'triangle', 0.04, 0.1), 10);
};

window.playWinPremium = function() {
  if (typeof GlobalState !== 'undefined' && !GlobalState.sound) return;
  // Rich, magical chord chime
  setTimeout(() => playTone(523.25, 'sine', 0.6, 0.3), 0);
  setTimeout(() => playTone(659.25, 'sine', 0.6, 0.3), 40);
  setTimeout(() => playTone(783.99, 'sine', 0.6, 0.3), 80);
  setTimeout(() => playTone(1046.50, 'triangle', 0.8, 0.4), 150);
  setTimeout(() => playTone(1318.51, 'sine', 1.0, 0.3), 250); // E6 sparkle
};

window.playDiceRoll = function() {
  if (typeof GlobalState !== 'undefined' && !GlobalState.sound) return;
  // Smooth rumbling
  for (let i = 0; i < 4; i++) {
    setTimeout(() => playTone(250 + Math.random()*150, 'triangle', 0.08, 0.15), i * 50);
  }
};

window.playDiceHit = function() {
  if (typeof GlobalState !== 'undefined' && !GlobalState.sound) return;
  // Heavy thud
  playTone(150, 'square', 0.3, 0.2); 
  // Satisfying chime
  setTimeout(() => playTone(1046.50, 'triangle', 0.5, 0.3), 30); 
};

