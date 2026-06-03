// ═══════════════════════════════════════════
//  8. TEAM GENERATOR
// ═══════════════════════════════════════════
let _lastTeams = [];

function guessGender(name) {
  let n = name.toLowerCase().trim();
  // Kata kunci kuat Laki-laki (Lokal + Global)
  if (/\b(muhammad|ahmad|putra|wan|udin|man|to|budi|andi|agus|arif|dika|fajar|gilang|hendra|ilham|joko|kevin|lukman|rez|riz|arya|bima|candra|dimas|john|michael|david|james|robert|william|joseph|richard|thomas|charles|christopher|daniel|matthew|anthony|mark|paul|steven|andrew|joshua|brian|george|edward|ronald|timothy|jason|jeffrey|ryan|jacob|gary|nicholas|eric|jonathan|stephen|larry|justin|scott|brandon|benjamin|samuel|gregory|alexander|patrick|jack|dennis|tyler|aaron|jose|adam|henry|nathan|douglas|zachary|peter|kyle|ethan|jeremy|christian|sean|austin|dylan|jesse|jordan|bryan)\b/i.test(n)) return 'L';
  // Kata kunci kuat Perempuan (Lokal + Global)
  if (/\b(putri|wati|ningsih|ayu|sari|siti|sri|nur|indah|fitri|aulia|annisa|dina|eka|gita|intan|kartika|lestari|maya|novi|ratna|susi|tina|yuni|des|dewi|mega|nia|rani|risa|mary|patricia|linda|barbara|elizabeth|jennifer|maria|susan|margaret|dorothy|lisa|nancy|karen|betty|helen|sandra|donna|carol|ruth|sharon|michelle|laura|sarah|kimberly|deborah|jessica|shirley|cynthia|angela|melissa|brenda|amy|anna|rebecca|virginia|kathleen|pamela|martha|debra|amanda|stephanie|carolyn|christine|marie|janet|catherine|frances|ann|joyce|diane|alice|julie|heather|teresa|doris|gloria|evelyn|jean|cheryl|mildred|katherine|joan|ashley|judith|rose|janice|kelly|nicole|judy|christina|kathy|theresa|beverly|denise|tammy|irene|jane|lori|rachel|marilyn|andrea|kathryn|louise|sara|anne|jacqueline|wanda|bonnie|julia|ruby|emily|emma|olivia|sophia|isabella|mia)\b/i.test(n)) return 'P';
  
  // Cek akhiran pada kata terakhir
  let parts = n.split(' ');
  let last = parts[parts.length - 1];
  if (/(o|wan|udin|man|to|son|er|or|us|as|is)$/i.test(last)) return 'L';
  if (/(wati|sih|ayu|ti|ni|na|ia|ra|ta|sha|belle|line|lyn|a)$/i.test(last)) return 'P';
  
  // Cek awalan/akhiran pada kata pertama
  let first = parts[0];
  if (/(o|wan|udin|man|to|son)$/i.test(first)) return 'L';
  if (/(wati|sih|ayu|ti|ni|na|ia|ra|ta|sha|a)$/i.test(first)) return 'P';

  // Fallback acak yang deterministik berdasarkan panjang string
  return n.length % 2 === 0 ? 'P' : 'L';
}

function genTeams(){
  const txt=$('tgI').value;
  let names=txt.split(/[\n,]+/).map(x=>x.trim()).filter(x=>x);
  if(names.length<2) return msg(t('msg_tg_err_min') || t('msg_tg_err_min'));
  
  const tc=Math.max(2,parseInt($('tgCount').value)||2);
  if(tc > names.length) return msg(t('msg_tg_err_max') || t('msg_tg_err_max'));
  
  const useAuto = $('tgAutoGender') ? $('tgAutoGender').checked : false;
  
  let males = [], females = [], unknowns = [];
  names.forEach(n => {
    let match = n.match(/\(\s*(L|P|M|F)\s*\)/i);
    if(match) {
      let g = match[1].toLowerCase();
      if(g === 'l' || g === 'm') males.push(n);
      else if(g === 'p' || g === 'f') females.push(n);
    } else {
      if(useAuto) {
        let guessed = guessGender(n);
        if(guessed === 'L') males.push(n);
        else females.push(n);
      } else {
        unknowns.push(n);
      }
    }
  });

  males.sort(()=>cryptoRandom()-.5);
  females.sort(()=>cryptoRandom()-.5);
  unknowns.sort(()=>cryptoRandom()-.5);
  
  const teams=Array.from({length:tc},()=>[]);
  const allPlayers = [...females, ...males, ...unknowns];
  
  allPlayers.forEach((player, idx) => {
    teams[idx % tc].push(player);
  });
  
  _lastTeams = teams;
  
  const r=$('tgR'); 
  r.innerHTML='';
  
  $('btnCopyTeams').style.display = 'inline-flex';
  
  // Animate sequentially
  teams.forEach((team, i) => {
    if(!team.length) return;
    
    setTimeout(() => {
      const p=document.createElement('div'); 
      p.className='team-card';
      const tmStr = typeof window.t === 'function' ? (window.t('tg_res_team')||'Tim') : 'Tim';
      const pplStr = typeof window.t === 'function' ? (window.t('tg_res_ppl')||'Orang') : 'Orang';
      p.innerHTML=`
        <div class="team-card-header">
          <div class="team-card-title">${tmStr} ${i+1}</div>
          <div class="team-card-count"><i data-lucide="users" style="width:12px; display:inline-block; vertical-align:-2px;"></i> ${team.length} ${pplStr}</div>
        </div>
        <div class="team-members" style="display:flex;gap:8px;flex-wrap:wrap"></div>`;
      
      const memberContainer = p.querySelector('.team-members');
      team.forEach(name => {
        const span = document.createElement('span');
        span.className = 'team-badge';
        span.innerHTML = '<i data-lucide="user" style="width:10px;"></i> ';
        span.appendChild(document.createTextNode(name));
        memberContainer.appendChild(span);
      });
      r.appendChild(p);
      lucide.createIcons({ root: p });
    }, i * 150); // 150ms delay per team card
  });
  
  setStore('tg', txt);
  playWin();
}

async function copyTeams() {
  if(!_lastTeams || _lastTeams.length === 0) return msg(t('msg_tg_err_empty') || t('msg_tg_err_empty'));
  
  const hdrStr = typeof t === 'function' ? (t('tg_res_hdr')||'📋 HASIL PEMBAGIAN TIM') : '📋 HASIL PEMBAGIAN TIM';
  const tmStr = typeof t === 'function' ? (t('tg_res_team')||'TIM') : 'TIM';
  const pplStr = typeof t === 'function' ? (t('tg_res_ppl')||'Orang') : 'Orang';
  
  let resultText = `${hdrStr}\n\n`;
  _lastTeams.forEach((t, i) => {
    if(!t.length) return;
    resultText += `🔹 ${tmStr.toUpperCase()} ${i+1} (${t.length} ${pplStr}):\n`;
    t.forEach(name => {
      resultText += `   - ${name}\n`;
    });
    resultText += "\n";
  });
  
  const success = await copyTextSafe(resultText);
  if (success) {
    msg(t('msg_tg_copied'));
  } else {
    msg(t('msg_tg_copy_fail') || "Gagal menyalin. Salin manual dari teks yang ditampilkan.");
  }
}
