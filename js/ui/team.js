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
  const tasks = shuffleArray(parseTgTasks());
  if (!tasks.length) return [];
  if (uniqueOnly && tasks.length < requiredCount) {
    msg(typeof t === 'function' ? (t('msg_tg_task_short') || 'Jumlah tugas belum cukup untuk pembagian unik.') : 'Jumlah tugas belum cukup untuk pembagian unik.');
    return null;
  }
  return tasks;
}

function assignTasksToTeams(teams, taskMode, uniqueOnly) {
  const requiredCount = taskMode === 'team' ? teams.length : teams.reduce((sum, team) => sum + team.length, 0);
  const tasks = getTgAssignableTasks(requiredCount, uniqueOnly);
  if (tasks === null) return null;
  
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



function genTeams(){
  const txt = $('tgI').value;
  let names = txt.split(/[\n,]+/).map(x => x.trim()).filter(x => x);
  
  if ($('tgRemoveDup') && $('tgRemoveDup').checked) {
    names = [...new Set(names)];
    $('tgI').value = names.join('\n');
  }
  
  if(names.length < 2) return msg(typeof t === 'function' ? (t('msg_tg_err_min') || 'Minimal 2 nama') : 'Minimal 2 nama');

  const tc = Math.max(2, parseInt($('tgCount').value) || 2);
  if(tc > names.length) return msg(typeof t === 'function' ? (t('msg_tg_err_max') || 'Jumlah kelompok melebihi daftar nama') : 'Jumlah kelompok melebihi daftar nama');

  names = shuffleArray(names);
  
  const taskMode = $('tgTaskMode') ? $('tgTaskMode').value : 'person';
  const uniqueOnly = $('tgUniqueTasks') ? $('tgUniqueTasks').checked : false;

  const teams = Array.from({ length: tc }, () => []);
  const allPlayers = [...names];

  allPlayers.forEach((player, idx) => {
    teams[idx % tc].push(player);
  });

  const assignment = assignTasksToTeams(teams, taskMode, uniqueOnly);
  if (!assignment) return;
  
  const { teamsWithTasks, teamTaskGroups } = assignment;

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
  const assignment = assignTasksToTeams(teamsWithoutTasks, taskMode, uniqueOnly);
  if (!assignment) return;
  const { teamsWithTasks, teamTaskGroups } = assignment;
  
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
  if(!_lastTeams || _lastTeams.length === 0) return msg(typeof t === 'function' ? (t('msg_tg_err_empty') || 'Daftar kosong') : 'Daftar kosong');

  const hdrStr = typeof t === 'function' ? (t('tg_res_hdr') || 'HASIL PEMBAGIAN TIM') : 'HASIL PEMBAGIAN TIM';
  const tmStr = typeof t === 'function' ? (t('tg_res_team') || 'TIM') : 'TIM';
  const pplStr = typeof t === 'function' ? (t('tg_res_ppl') || 'Orang') : 'Orang';
  const taskTitle = typeof t === 'function' ? (t('tg_task_title') || 'Tugas') : 'Tugas';

  let resultText = `*${hdrStr}*\n\n`;
  _lastTeams.forEach((team, i) => {
    if(!team.length) return;
    resultText += `*${tmStr.toUpperCase()} ${i + 1} (${team.length} ${pplStr}):*\n`;
    if (_lastTeamTaskGroups[i] && _lastTeamTaskGroups[i].length) {
      resultText += `   _${taskTitle}:_ ${_lastTeamTaskGroups[i].join(', ')}\n`;
    }
    team.forEach(member => {
      resultText += `   - ${member.name}${member.task ? ` (_${member.task}_)` : ''}\n`;
    });
    resultText += "\n";
  });

  const success = typeof copyTextSafe === 'function' ? await copyTextSafe(resultText) : false;
  if (success) {
    if(typeof msg === 'function') msg(typeof t === 'function' ? (t('msg_tg_copied') || 'Disalin') : 'Disalin');
  } else {
    if(typeof msg === 'function') msg(typeof t === 'function' ? (t('msg_tg_copy_fail') || "Gagal menyalin.") : "Gagal menyalin.");
  }
}
