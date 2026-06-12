// ═══════════════════════════════════════════
//  CORE UTILS & UI COMPONENTS
// ═══════════════════════════════════════════
const $ = id => document.getElementById(id);

let _toastTimeout;
function msg(m, dur = 2500, iconType = 'info') {
  const e = $('toast');
  if(!e) return;
  
  let ic = '';
  const isSuccess = iconType === 'success' || m.toLowerCase().includes('berhasil') || m.toLowerCase().includes('reset') || m.toLowerCase().includes('dimuat');
  if (iconType === 'none') {
    ic = '';
  } else if (isSuccess) {
    ic = '<i data-lucide="check-circle" style="width:18px;height:18px;color:#10b981;stroke-width:2.5px"></i>';
  } else if (iconType === 'error') {
    ic = '<i data-lucide="alert-triangle" style="width:18px;height:18px;color:#ef4444;stroke-width:2.5px"></i>';
  } else {
    ic = '<i data-lucide="info" style="width:18px;height:18px;color:#3b82f6;stroke-width:2.5px"></i>';
  }
  
  e.innerHTML = `<div style="display:flex;align-items:center;gap:${ic ? '10px' : '0'}">${ic} <span id="toast-text"></span></div>`;
  e.querySelector('#toast-text').textContent = m;
  if (window.lucide) lucide.createIcons({ root: e });
  
  // Re-trigger animation
  e.classList.remove('show');
  void e.offsetWidth; 
  e.classList.add('show');
  
  clearTimeout(_toastTimeout);
  _toastTimeout = setTimeout(() => e.classList.remove('show'), dur);
}

// ═══════════════════════════════════════════
//  AMBIENT BACKGROUND
// ═══════════════════════════════════════════
function initAmbient() {
  const cv = document.getElementById('ambientBg');
  if(!cv) return;
  if (!GlobalState.animations) {
    cv.style.display = 'none';
    return;
  }
  cv.style.display = 'block';
  const ctx = cv.getContext('2d');
  let w, h;
  const orbs = [];
  const ORB_COUNT = window.innerWidth < 768 ? 3 : 5;
  const COLORS_DARK = ['rgba(0,229,255,.06)','rgba(168,85,247,.05)','rgba(96,165,250,.04)','rgba(34,197,94,.04)','rgba(251,113,133,.04)'];
  const COLORS_LIGHT = ['rgba(0,180,200,.06)','rgba(140,80,220,.04)','rgba(60,130,246,.03)','rgba(34,197,94,.03)','rgba(249,115,22,.03)'];

  function resize(){
    w = cv.width = innerWidth;
    h = cv.height = innerHeight;
  }
  function makeOrb(i){
    return {
      x: Math.random()*w, y: Math.random()*h,
      r: 120 + Math.random()*180,
      vx: (Math.random()-.5)*.15,
      vy: (Math.random()-.5)*.12,
      ci: i % ORB_COUNT
    };
  }
  function init(){
    resize();
    orbs.length = 0;
    for(let i=0;i<ORB_COUNT;i++) orbs.push(makeOrb(i));
  }
  function draw(){
    if (!GlobalState.animations) return; // Stop if disabled
    ctx.clearRect(0,0,w,h);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const cols = isDark ? COLORS_DARK : COLORS_LIGHT;
    orbs.forEach(o=>{
      o.x += o.vx; o.y += o.vy;
      if(o.x<-o.r) o.x=w+o.r; if(o.x>w+o.r) o.x=-o.r;
      if(o.y<-o.r) o.y=h+o.r; if(o.y>h+o.r) o.y=-o.r;
      const g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
      g.addColorStop(0, cols[o.ci]);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(o.x,o.y,o.r,0,Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  init();
  draw();
}

// ═══════════════════════════════════════════
//  CONFETTI
// ═══════════════════════════════════════════
function conf(){
  if (!GlobalState.animations) return;
  const cv=$('cfC');
  if(!cv) return;
  const x=cv.getContext('2d');
  cv.width=innerWidth; cv.height=innerHeight;
  const P=[], C=['#FB7185','#FFB300','#22C55E','#3b82f6','#A855F7','#F59E0B','#fb923c'];
  for(let i=0;i<60;i++) P.push({x:Math.random()*cv.width,y:-20,w:Math.random()*6+3,h:Math.random()*6+3,c:C[Math.floor(Math.random()*C.length)],vx:(Math.random()-.5)*5,vy:Math.random()*4+2,r:Math.random()*360,rv:Math.random()*6-3,o:1});
  let f=0;(function go(){
    x.clearRect(0,0,cv.width,cv.height); let al=false;
    P.forEach(p=>{if(p.o<=0)return; al=true; p.x+=p.vx; p.y+=p.vy; p.r+=p.rv; if(f>40)p.o-=.02;
      x.save(); x.globalAlpha=Math.max(0,p.o); x.translate(p.x,p.y); x.rotate(p.r*Math.PI/180); x.fillStyle=p.c; x.fillRect(-p.w/2,-p.h/2,p.w,p.h); x.restore();
    }); f++;
    if(al&&f<120) requestAnimationFrame(go); else x.clearRect(0,0,cv.width,cv.height);
  })();
}

// ═══════════════════════════════════════════
//  SOUND ENGINE (Dipindahkan ke js/audio.js)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
//  CUSTOM CONFIRM MODAL
// ═══════════════════════════════════════════
let _confirmCallback = null;

function openConfirmModal(title, message, onConfirm) {
  const modal = $('confirmModal');
  if(!modal) return;
  
  $('confirmTitle').textContent = title;
  $('confirmMsg').textContent = message;
  _confirmCallback = onConfirm;
  
  // Clean up old listeners to avoid multiple triggers
  const btn = $('confirmYesBtn');
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  
  newBtn.addEventListener('click', () => {
    const cb = _confirmCallback;
    closeConfirmModal();
    if(cb) cb();
  });
  
  modal.style.display = 'flex';
}

function closeConfirmModal() {
  const modal = $('confirmModal');
  if(modal) modal.style.display = 'none';
  _confirmCallback = null;
}
