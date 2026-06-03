// ═══════════════════════════════════════════
//  6. CARD DRAW (Tarik Kartu)
// ═══════════════════════════════════════════
let _cardDeck = [];
let _cardTheme = 'red';
let _cardIncludeJoker = false;
let _cardInfinite = false;
let _isCardDrawing = false;
let _cardsRemaining = 0;

const SUITS = [
  { s: '♠', c: 'card-black', n_key: 'cd_spade' },
  { s: '♥', c: 'card-red', n_key: 'cd_heart' },
  { s: '♣', c: 'card-black', n_key: 'cd_club' },
  { s: '♦', c: 'card-red', n_key: 'cd_diamond' }
];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function initCardDeck() {
  _cardDeck = [];
  for (let suit of SUITS) {
    for (let val of VALUES) {
      _cardDeck.push({ suit, val, type: 'standard' });
    }
  }
  if (_cardIncludeJoker) {
    _cardDeck.push({ suit: {s: '🃏', c: 'card-black', n_key: 'cd_joker_black'}, val: 'JOKER', type: 'joker' });
    _cardDeck.push({ suit: {s: '🃏', c: 'card-red', n_key: 'cd_joker_red'}, val: 'JOKER', type: 'joker' });
  }
  shuffleArray(_cardDeck);
  _cardsRemaining = _cardDeck.length;
  updateCardUI();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(cryptoRandom() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function setCardTheme(theme, btn) {
  if(_isCardDrawing) return;
  _cardTheme = theme;
  document.querySelectorAll('#cdThemeRow .d-type-btn').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  updateCardUI();
}

function toggleCardJoker() {
  if(_isCardDrawing) return;
  _cardIncludeJoker = !_cardIncludeJoker;
  const btn = $('cdJokerBtn');
  if (btn) {
    btn.classList.toggle('on', _cardIncludeJoker);
    btn.innerHTML = _cardIncludeJoker ? t('cd_joker_on') : t('cd_joker_off');
  }
  initCardDeck();
}

function toggleCardMode() {
  if(_isCardDrawing) return;
  _cardInfinite = !_cardInfinite;
  const btn = $('cdModeBtn');
  if (btn) {
    btn.classList.toggle('on', _cardInfinite);
    btn.innerHTML = _cardInfinite ? t('cd_mode_inf') : t('cd_mode_stk');
    if(window.lucide) lucide.createIcons({ root: btn });
  }
  initCardDeck();
}

function reshuffleCards() {
  if(_isCardDrawing) return;
  initCardDeck();
  $('cdResult').innerHTML = `<div style="font-size:1.2rem;color:var(--t3);font-weight:700">${t('cd_reshuffled')}</div>`;
  if (typeof playTick === 'function') playTick();
}

function updateCardUI() {
  $('cdRemaining').textContent = _cardsRemaining;
  
  const stage = $('cdStage');
  if(!stage) return;
  
  stage.innerHTML = '';
  
  if (_cardsRemaining > 0) {
    const scene = document.createElement('div');
    scene.className = 'card-scene';
    
    // Create stack effect (3 layers)
    let layers = Math.min(3, Math.ceil(_cardsRemaining / 17));
    if (_cardInfinite) layers = 3;
    
    for (let i=0; i<layers; i++) {
      const card = document.createElement('div');
      card.className = 'playing-card';
      card.style.top = (i * -2) + 'px';
      card.style.left = (i * -2) + 'px';
      
      const front = document.createElement('div');
      front.className = 'card-face card-front';
      
      const back = document.createElement('div');
      back.className = `card-face card-back theme-${_cardTheme}`;
      
      card.appendChild(front);
      card.appendChild(back);
      
      if (i === layers - 1) {
        card.id = 'topCard';
        card.onclick = drawCard;
      }
      
      scene.appendChild(card);
    }
    stage.appendChild(scene);
  } else {
    stage.innerHTML = `
      <div style="text-align:center; padding: 40px 0;">
        <i data-lucide="ghost" style="width:48px;height:48px;color:var(--t3);margin-bottom:12px;"></i>
        <div style="font-size:1.2rem;font-weight:800;color:var(--t2)">${t('cd_empty')}</div>
        <button class="btn btn-g" style="margin-top:16px" onclick="reshuffleCards()">${t('cd_reshuffle_btn')}</button>
      </div>
    `;
    if(window.lucide) lucide.createIcons({ root: stage });
  }
}

function drawCard() {
  if(_isCardDrawing || _cardsRemaining <= 0) return;
  _isCardDrawing = true;
  
  if (typeof playTick === 'function') playTick();
  
  const topCard = $('topCard');
  if (topCard) {
    let drawn = _cardDeck.pop();
    if (_cardInfinite) {
      _cardDeck.unshift(drawn); // Put it at the bottom to pretend infinite shuffle
      shuffleArray(_cardDeck);
    } else {
      _cardsRemaining--;
    }
    
    const front = topCard.querySelector('.card-front');
    if (drawn.type === 'joker') {
      front.innerHTML = `
        <div class="card-corner top-left ${drawn.suit.c}"><span>JOKER</span></div>
        <div class="card-suit ${drawn.suit.c}">🃏</div>
        <div class="card-corner bottom-right ${drawn.suit.c}"><span>JOKER</span></div>
      `;
    } else {
      front.innerHTML = `
        <div class="card-corner top-left ${drawn.suit.c}"><span>${drawn.val}</span><span>${drawn.suit.s}</span></div>
        <div class="card-value ${drawn.suit.c}">${drawn.val}</div>
        <div class="card-suit ${drawn.suit.c}">${drawn.suit.s}</div>
        <div class="card-corner bottom-right ${drawn.suit.c}"><span>${drawn.val}</span><span>${drawn.suit.s}</span></div>
      `;
    }
    
    topCard.classList.add('flipped');
    
    setTimeout(() => {
      if (typeof playWin === 'function') playWin();
      
      let suitName = t(drawn.suit.n_key);
      let cardName = drawn.type === 'joker' ? suitName : `${drawn.val} ${suitName}`;
      $('cdResult').innerHTML = `
        <div style="font-size:2rem;font-weight:900;color:var(--acc);line-height:1;text-shadow:0 4px 16px rgba(255,179,0,0.3)">${cardName}</div>
      `;
      $('cdResult').classList.add('win');
      setTimeout(()=>$('cdResult').classList.remove('win'), 600);
      
      // History
      let histWrap = $('cdHist');
      if(histWrap.innerHTML.includes('—')) histWrap.innerHTML = '';
      const chip = document.createElement('div');
      chip.className = 'sp-hist-chip';
      chip.style.fontSize = '0.75rem';
      chip.style.padding = '4px 12px';
      
      let iconColor = drawn.suit.c === 'card-red' ? 'var(--rose)' : 'var(--t1)';
      chip.innerHTML = `<span style="color:${iconColor};font-size:1.1rem;margin-right:4px">${drawn.suit.s}</span> <strong>${drawn.val}</strong>`;
      histWrap.prepend(chip);
      if(histWrap.children.length > 20) histWrap.removeChild(histWrap.lastChild);
      
      addGlobalHistory(t('nav_cd'), cardName);
      if (typeof announceA11y === 'function') announceA11y(cardName);
      
      setTimeout(() => {
        topCard.classList.add('drawn-away');
        setTimeout(() => {
          _isCardDrawing = false;
          updateCardUI();
        }, 500);
      }, 1000); // Keep it visible before throwing away
    }, 600); // Wait for flip to complete
  }
}

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initCardDeck();
  });
} else {
  initCardDeck();
}
