// Team generator
let _lastTeams = [];
let _lastTeamTaskGroups = [];
let _lastTeamTaskMode = 'person';

function parseTgTasks() {
  const taskInput = $('tgTasks');
  if (!taskInput) return [];
  return taskInput.value.split(/[\n,]+/).map(x => x.trim()).filter(x => x);
}

function buildTeamTaskGroups(tasks, teamCount) {
  const groups = Array.from({ length: teamCount }, () => []);
  tasks.forEach((task, idx) => {
    groups[idx % teamCount].push(task);
  });
  return groups;
}

function getTgAssignableTasks(requiredCount, uniqueOnly) {
  const tasks = parseTgTasks().sort(() => cryptoRandom() - .5);
  if (!tasks.length) return [];
  if (uniqueOnly && tasks.length < requiredCount) {
    msg(t('msg_tg_task_short') || 'Jumlah tugas belum cukup untuk pembagian unik.');
    return [];
  }
  return tasks;
}

function assignTasksToTeams(teams, taskMode, uniqueOnly) {
  const requiredCount = taskMode === 'team' ? teams.length : teams.reduce((sum, team) => sum + team.length, 0);
  const tasks = getTgAssignableTasks(requiredCount, uniqueOnly);
  let taskIdx = 0;
  const teamsWithTasks = teams.map(team => team.map(member => ({
    name: typeof member === 'string' ? member : member.name,
    task: tasks.length && taskMode === 'person' ? tasks[taskIdx++ % tasks.length] : ''
  })));
  const teamTaskGroups = tasks.length && taskMode === 'team' ? buildTeamTaskGroups(tasks, teams.length) : Array.from({ length: teams.length }, () => []);
  return { teamsWithTasks, teamTaskGroups };
}

function persistTeamResult() {
  setStore('tgLastTeams', _lastTeams);
  setStore('tgLastTeamTaskGroups', _lastTeamTaskGroups);
  setStore('tgLastTeamTaskMode', _lastTeamTaskMode);
}

function setTeamActionVisibility(hasResult) {
  const copyBtn = $('btnCopyTeams');
  if (copyBtn) copyBtn.style.display = hasResult ? 'inline-flex' : 'none';
  const shuffleBtn = $('btnShuffleTasks');
  if (shuffleBtn) shuffleBtn.style.display = hasResult && parseTgTasks().length ? 'inline-flex' : 'none';
}

function refreshTeamTaskActions() {
  setTeamActionVisibility(_lastTeams.length > 0);
}

function renderTeamResult(animate = true) {
  const r = $('tgR');
  if (!r) return;
  r.innerHTML = '';
  setTeamActionVisibility(_lastTeams.length > 0);

  _lastTeams.forEach((team, i) => {
    if(!team.length) return;

    const renderCard = () => {
      const p = document.createElement('div');
      p.className = 'team-card';
      const tmStr = typeof window.t === 'function' ? (window.t('tg_res_team') || 'Tim') : 'Tim';
      const pplStr = typeof window.t === 'function' ? (window.t('tg_res_ppl') || 'Orang') : 'Orang';
      const taskTitle = typeof window.t === 'function' ? (window.t('tg_task_title') || 'Tugas') : 'Tugas';
      p.innerHTML = `
        <div class="team-card-header">
          <div class="team-card-title">${tmStr} ${i + 1}</div>
          <div class="team-card-count"><i data-lucide="users" style="width:12px; display:inline-block; vertical-align:-2px;"></i> ${team.length} ${pplStr}</div>
        </div>
        <div class="team-task-list" style="display:none"></div>
        <div class="team-members" style="display:flex;gap:8px;flex-wrap:wrap"></div>`;

      const taskContainer = p.querySelector('.team-task-list');
      if (_lastTeamTaskGroups[i] && _lastTeamTaskGroups[i].length) {
        taskContainer.style.display = 'flex';
        taskContainer.innerHTML = `<span class="team-task-title">${taskTitle}:</span>`;
        _lastTeamTaskGroups[i].forEach(task => {
          const taskChip = document.createElement('span');
          taskChip.className = 'team-task-chip';
          taskChip.appendChild(document.createTextNode(task));
          taskContainer.appendChild(taskChip);
        });
      }

      const memberContainer = p.querySelector('.team-members');
      team.forEach(member => {
        const span = document.createElement('span');
        span.className = 'team-badge';
        span.innerHTML = '<i data-lucide="user" style="width:10px;"></i> ';
        span.appendChild(document.createTextNode(member.name));
        if (member.task) {
          const task = document.createElement('small');
          task.className = 'team-member-task';
          task.appendChild(document.createTextNode(member.task));
          span.appendChild(task);
        }
        memberContainer.appendChild(span);
      });
      r.appendChild(p);
      if (window.lucide) lucide.createIcons({ root: p });
    };

    if (animate) setTimeout(renderCard, i * 150);
    else renderCard();
  });
}

function guessGender(name) {
  let n = name.toLowerCase().trim();
  if (/\b(muhammad|ahmad|putra|wan|udin|man|to|budi|andi|agus|arif|dika|fajar|gilang|hendra|ilham|joko|kevin|lukman|rez|riz|arya|bima|candra|dimas|john|michael|david|james|robert|william|joseph|richard|thomas|charles|christopher|daniel|matthew|anthony|mark|paul|steven|andrew|joshua|brian|george|edward|ronald|timothy|jason|jeffrey|ryan|jacob|gary|nicholas|eric|jonathan|stephen|larry|justin|scott|brandon|benjamin|samuel|gregory|alexander|patrick|jack|dennis|tyler|aaron|jose|adam|henry|nathan|douglas|zachary|peter|kyle|ethan|jeremy|christian|sean|austin|dylan|jesse|jordan|bryan)\b/i.test(n)) return 'L';
  if (/\b(putri|wati|ningsih|ayu|sari|siti|sri|nur|indah|fitri|aulia|annisa|dina|eka|gita|intan|kartika|lestari|maya|novi|ratna|susi|tina|yuni|des|dewi|mega|nia|rani|risa|mary|patricia|linda|barbara|elizabeth|jennifer|maria|susan|margaret|dorothy|lisa|nancy|karen|betty|helen|sandra|donna|carol|ruth|sharon|michelle|laura|sarah|kimberly|deborah|jessica|shirley|cynthia|angela|melissa|brenda|amy|anna|rebecca|virginia|kathleen|pamela|martha|debra|amanda|stephanie|carolyn|christine|marie|janet|catherine|frances|ann|joyce|diane|alice|julie|heather|teresa|doris|gloria|evelyn|jean|cheryl|mildred|katherine|joan|ashley|judith|rose|janice|kelly|nicole|judy|christina|kathy|theresa|beverly|denise|tammy|irene|jane|lori|rachel|marilyn|andrea|kathryn|louise|sara|anne|jacqueline|wanda|bonnie|julia|ruby|emily|emma|olivia|sophia|isabella|mia)\b/i.test(n)) return 'P';

  let parts = n.split(' ');
  let last = parts[parts.length - 1];
  if (/(o|wan|udin|man|to|son|er|or|us|as|is)$/i.test(last)) return 'L';
  if (/(wati|sih|ayu|ti|ni|na|ia|ra|ta|sha|belle|line|lyn|a)$/i.test(last)) return 'P';

  let first = parts[0];
  if (/(o|wan|udin|man|to|son)$/i.test(first)) return 'L';
  if (/(wati|sih|ayu|ti|ni|na|ia|ra|ta|sha|a)$/i.test(first)) return 'P';

  return n.length % 2 === 0 ? 'P' : 'L';
}

function genTeams(){
  const txt = $('tgI').value;
  let names = txt.split(/[\n,]+/).map(x => x.trim()).filter(x => x);
  if(names.length < 2) return msg(t('msg_tg_err_min') || t('msg_tg_err_min'));

  const tc = Math.max(2, parseInt($('tgCount').value) || 2);
  if(tc > names.length) return msg(t('msg_tg_err_max') || t('msg_tg_err_max'));

  const useAuto = $('tgAutoGender') ? $('tgAutoGender').checked : false;
  const taskMode = $('tgTaskMode') ? $('tgTaskMode').value : 'person';
  const uniqueOnly = $('tgUniqueTasks') ? $('tgUniqueTasks').checked : false;

  let males = [], females = [], unknowns = [];
  names.forEach(n => {
    let match = n.match(/\(\s*(L|P|M|F)\s*\)/i);
    if(match) {
      let g = match[1].toLowerCase();
      if(g === 'l' || g === 'm') males.push(n);
      else if(g === 'p' || g === 'f') females.push(n);
    } else if(useAuto) {
      let guessed = guessGender(n);
      if(guessed === 'L') males.push(n);
      else females.push(n);
    } else {
      unknowns.push(n);
    }
  });

  males.sort(() => cryptoRandom() - .5);
  females.sort(() => cryptoRandom() - .5);
  unknowns.sort(() => cryptoRandom() - .5);

  const teams = Array.from({ length: tc }, () => []);
  const allPlayers = [...females, ...males, ...unknowns];

  allPlayers.forEach((player, idx) => {
    teams[idx % tc].push(player);
  });

  const { teamsWithTasks, teamTaskGroups } = assignTasksToTeams(teams, taskMode, uniqueOnly);

  _lastTeams = teamsWithTasks;
  _lastTeamTaskGroups = teamTaskGroups;
  _lastTeamTaskMode = taskMode;

  renderTeamResult(true);

  setStore('tg', txt);
  setStore('tgTasks', $('tgTasks') ? $('tgTasks').value : '');
  setStore('tgTaskMode', taskMode);
  setStore('tgUniqueTasks', uniqueOnly);
  persistTeamResult();
  playWin();
}

function restoreTeamResult() {
  const savedTeams = getStore('tgLastTeams', []);
  if (!Array.isArray(savedTeams) || savedTeams.length === 0) return;
  _lastTeams = savedTeams;
  _lastTeamTaskGroups = getStore('tgLastTeamTaskGroups', []);
  _lastTeamTaskMode = getStore('tgLastTeamTaskMode', 'person');
  renderTeamResult(false);
}

function shuffleTeamTasks() {
  if (!_lastTeams || _lastTeams.length === 0) return msg(t('msg_tg_err_empty') || t('msg_tg_err_empty'));
  const taskMode = $('tgTaskMode') ? $('tgTaskMode').value : _lastTeamTaskMode;
  const uniqueOnly = $('tgUniqueTasks') ? $('tgUniqueTasks').checked : false;
  const teamsWithoutTasks = _lastTeams.map(team => team.map(member => member.name));
  if (!parseTgTasks().length) return msg(t('msg_tg_task_need') || 'Tambahkan tugas dulu sebelum mengacak!');
  const { teamsWithTasks, teamTaskGroups } = assignTasksToTeams(teamsWithoutTasks, taskMode, uniqueOnly);
  _lastTeams = teamsWithTasks;
  _lastTeamTaskGroups = teamTaskGroups;
  _lastTeamTaskMode = taskMode;
  setStore('tgTasks', $('tgTasks') ? $('tgTasks').value : '');
  setStore('tgTaskMode', taskMode);
  setStore('tgUniqueTasks', uniqueOnly);
  persistTeamResult();
  renderTeamResult(true);
}

async function copyTeams() {
  if(!_lastTeams || _lastTeams.length === 0) return msg(t('msg_tg_err_empty') || t('msg_tg_err_empty'));

  const hdrStr = typeof t === 'function' ? (t('tg_res_hdr') || 'HASIL PEMBAGIAN TIM') : 'HASIL PEMBAGIAN TIM';
  const tmStr = typeof t === 'function' ? (t('tg_res_team') || 'TIM') : 'TIM';
  const pplStr = typeof t === 'function' ? (t('tg_res_ppl') || 'Orang') : 'Orang';
  const taskTitle = typeof t === 'function' ? (t('tg_task_title') || 'Tugas') : 'Tugas';

  let resultText = `${hdrStr}\n\n`;
  _lastTeams.forEach((team, i) => {
    if(!team.length) return;
    resultText += `${tmStr.toUpperCase()} ${i + 1} (${team.length} ${pplStr}):\n`;
    if (_lastTeamTaskGroups[i] && _lastTeamTaskGroups[i].length) {
      resultText += `   ${taskTitle}: ${_lastTeamTaskGroups[i].join(', ')}\n`;
    }
    team.forEach(member => {
      resultText += `   - ${member.name}${member.task ? ` (${member.task})` : ''}\n`;
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
