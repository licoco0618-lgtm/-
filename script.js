// 學藝股長智慧班級工作台 (31 人班級系統)
// 包含：作業催繳管理、電子黑板聯絡簿、教室日誌填報小幫手、課堂抽籤與各科小老師名單

const TOTAL_STUDENTS = 31;

// Sound Effects (Web Audio API)
class SoundFX {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450 + Math.random() * 150, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.09);
        osc.stop(this.ctx.currentTime + idx * 0.09 + 0.35);
      });
    } catch (e) {}
  }
}

const sfx = new SoundFX();

// 115學年第1學期 資處一仁 正式課程表
const CLASS_SCHEDULE = {
  periods: [
    { period: 1, name: '第一節', time: '08:10~09:00' },
    { period: 2, name: '第2節', time: '09:10~10:00' },
    { period: 3, name: '第三節', time: '10:10~11:00' },
    { period: 4, name: '第四節', time: '11:10~12:00' },
    { period: 5, name: '第5節', time: '01:10~02:00' },
    { period: 6, name: '第6節', time: '02:10~03:00' },
    { period: 7, name: '第7節', time: '03:10~04:00' }
  ],
  grid: {
    1: [ // 週一
      { subject: '美術', teacher: '黃浩軒', loc: '' },
      { subject: '體育', teacher: '張鳴恩', loc: '' },
      { subject: '健康與護理', teacher: '趙蕙芬', loc: '' },
      { subject: '物理', teacher: '劉仲平', loc: '' },
      { subject: '國語文', teacher: '遊新欣', loc: '' },
      { subject: '國語文', teacher: '遊新欣', loc: '' },
      { subject: '全民國防教育', teacher: '蘇昱禾', loc: '' }
    ],
    2: [ // 週二
      { subject: '資訊科技', teacher: '倪正平', loc: '資處工場三' },
      { subject: '文書處理實習', teacher: '藍淑雯', loc: '資處工場三' },
      { subject: '文書處理實習', teacher: '藍淑雯', loc: '資處工場三' },
      { subject: '文書處理實習', teacher: '藍淑雯', loc: '資處工場三' },
      { subject: '閩南文', teacher: '黃佳樺', loc: '' },
      { subject: '會計', teacher: '週櫻', loc: '' },
      { subject: '會計', teacher: '週櫻', loc: '' }
    ],
    3: [ // 週三
      { subject: '數位科技概論', teacher: '倪正平', loc: '資處工場三' },
      { subject: '數位科技概論', teacher: '倪正平', loc: '資處工場三' },
      { subject: '商業概論', teacher: '週櫻', loc: '' },
      { subject: '商業概論', teacher: '週櫻', loc: '' },
      { subject: '音樂', teacher: '周永涵', loc: '音樂教室' },
      { subject: '體育', teacher: '張鳴恩', loc: '' },
      { subject: '數學', teacher: '賴珮茹', loc: '' }
    ],
    4: [ // 週四
      { subject: '物理', teacher: '劉仲平', loc: '' },
      { subject: '國語文', teacher: '遊新欣', loc: '' },
      { subject: '生命教育概論', teacher: '洪世棟', loc: '' },
      { subject: '會計', teacher: '週櫻', loc: '' },
      { subject: '多媒體製作與應用', teacher: '翁偉倬', loc: '資處工場三' },
      { subject: '多媒體製作與應用', teacher: '翁偉倬', loc: '資處工場三' },
      { subject: '多媒體製作與應用', teacher: '翁偉倬', loc: '資處工場三' }
    ],
    5: [ // 週五
      { subject: '數學', teacher: '賴珮茹', loc: '' },
      { subject: '數學', teacher: '賴珮茹', loc: '' },
      { subject: '中文', teacher: '陳瑀潔', loc: '' },
      { subject: '中文', teacher: '陳瑀潔', loc: '' },
      { subject: '聯課活動', teacher: '社團指導', loc: '' },
      { subject: '聯課活動', teacher: '社團指導', loc: '' },
      { subject: '班週會', teacher: '翁偉倬', loc: '' }
    ]
  }
};

// State
let students = [];
let homeworkList = [];
let selectedHwId = null;
let boardData = {
  exams: ['國語文第 3 課注釋小考', '數學第二單元隨堂測驗', '會計借貸法則測驗'],
  notes: ['明日記得帶隨身碟至「資處工場三」', '週三音樂課在音樂教室上課', '體育課記得穿體育服裝']
};
let logbookData = {
  date: '',
  absent: '',
  officer: '',
  periods: Array.from({ length: 7 }, (_, i) => ({
    period: i + 1,
    subject: '',
    teacher: '',
    progress: '',
    note: ''
  }))
};
// 課表全部科目對照清單 (共 19 個科目)
const TIMETABLE_SUBJECTS = [
  { id: 'art', subject: '美術', teacher: '黃浩軒', loc: '' },
  { id: 'pe', subject: '體育', teacher: '張鳴恩', loc: '' },
  { id: 'health', subject: '健康與護理', teacher: '趙蕙芬', loc: '' },
  { id: 'physics', subject: '物理', teacher: '劉仲平', loc: '' },
  { id: 'chinese1', subject: '國語文', teacher: '遊新欣', loc: '' },
  { id: 'defense', subject: '全民國防教育', teacher: '蘇昱禾', loc: '' },
  { id: 'it', subject: '資訊科技', teacher: '倪正平', loc: '資處工場三' },
  { id: 'doc', subject: '文書處理實習', teacher: '藍淑雯', loc: '資處工場三' },
  { id: 'taiwanese', subject: '閩南文', teacher: '黃佳樺', loc: '' },
  { id: 'accounting', subject: '會計', teacher: '週櫻', loc: '' },
  { id: 'digitech', subject: '數位科技概論', teacher: '倪正平', loc: '資處工場三' },
  { id: 'business', subject: '商業概論', teacher: '週櫻', loc: '' },
  { id: 'music', subject: '音樂', teacher: '周永涵', loc: '音樂教室' },
  { id: 'math', subject: '數學', teacher: '賴珮茹', loc: '' },
  { id: 'life', subject: '生命教育概論', teacher: '洪世棟', loc: '' },
  { id: 'chinese2', subject: '中文', teacher: '陳瑀潔', loc: '' },
  { id: 'multimedia', subject: '多媒體製作與應用', teacher: '翁偉倬', loc: '資處工場三' },
  { id: 'club', subject: '聯課活動', teacher: '社團指導', loc: '' },
  { id: 'meeting', subject: '班週會', teacher: '翁偉倬', loc: '' }
];

let assistantsData = {};

// Toast notification
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2200);
}

// 1. Initialize Student Roster (1 ~ 31)
function initStudents() {
  const saved = localStorage.getItem('academic_students_31');
  if (saved) {
    try {
      students = JSON.parse(saved);
      if (Array.isArray(students) && students.length === TOTAL_STUDENTS) return;
    } catch (e) {}
  }

  students = [];
  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    students.push({
      id: i,
      name: `${i} 號`,
      note: ''
    });
  }
  saveStudents();
}

function saveStudents() {
  localStorage.setItem('academic_students_31', JSON.stringify(students));
  renderStudentRoster();
}

// 2. Homework Tracker
function initHomework() {
  const saved = localStorage.getItem('academic_homework_31');
  if (saved) {
    try {
      homeworkList = JSON.parse(saved);
    } catch (e) {
      homeworkList = [];
    }
  }

  if (homeworkList.length === 0) {
    homeworkList = [
      {
        id: 'hw_' + Date.now(),
        subject: '文書處理實習',
        title: '實習上機作業 (藍淑雯老師 / 資處工場三)',
        deadline: '今日放學前',
        paidIds: [1, 2, 4, 5, 6, 8, 9, 10, 11, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31]
      },
      {
        id: 'hw_' + (Date.now() + 1),
        subject: '會計',
        title: '分錄與借貸平衡題本 P.15-18 (週櫻老師)',
        deadline: '明日早自習',
        paidIds: [2, 3, 5, 7, 8, 11, 12, 14, 15, 17, 19, 20, 22, 25, 27, 28, 30, 31]
      },
      {
        id: 'hw_' + (Date.now() + 2),
        subject: '數學',
        title: '單元二隨堂講義 (賴珮茹老師)',
        deadline: '週五前',
        paidIds: [1, 3, 4, 6, 7, 9, 10, 12, 15, 16, 18, 21, 23, 25, 29, 31]
      }
    ];
    saveHomework();
  }

  if (homeworkList.length > 0) {
    selectedHwId = homeworkList[0].id;
  }
  renderHomeworkList();
  renderHomeworkDetail();
  renderBlackboard();
}

function saveHomework() {
  localStorage.setItem('academic_homework_31', JSON.stringify(homeworkList));
  renderHomeworkList();
  renderHomeworkDetail();
  renderBlackboard();
}

function renderHomeworkList() {
  const listEl = document.getElementById('hwItemsList');
  if (homeworkList.length === 0) {
    listEl.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-muted);">目前無收繳作業項目</div>';
    return;
  }

  listEl.innerHTML = homeworkList.map(hw => {
    const paidCount = hw.paidIds.length;
    const isFull = paidCount === TOTAL_STUDENTS;
    const activeClass = hw.id === selectedHwId ? 'active' : '';

    return `
      <div class="hw-item-card ${activeClass}" onclick="selectHomework('${hw.id}')">
        <div class="hw-item-top">
          <span class="hw-subject-badge">${hw.subject}</span>
          <button class="hw-delete-btn" onclick="deleteHomework(event, '${hw.id}')" title="刪除此項作業">✕</button>
        </div>
        <div class="hw-item-title">${hw.title}</div>
        <div class="hw-item-bottom">
          <span>期限：${hw.deadline}</span>
          <span style="font-weight:700; color:${isFull ? 'var(--success)' : 'var(--accent)'};">
            ${paidCount} / ${TOTAL_STUDENTS}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

window.selectHomework = function(id) {
  selectedHwId = id;
  renderHomeworkList();
  renderHomeworkDetail();
};

window.deleteHomework = function(e, id) {
  e.stopPropagation();
  if (confirm('確定要刪除這項作業紀錄嗎？')) {
    homeworkList = homeworkList.filter(h => h.id !== id);
    if (selectedHwId === id) {
      selectedHwId = homeworkList.length > 0 ? homeworkList[0].id : null;
    }
    saveHomework();
    showToast('已刪除作業項目');
  }
};

function renderHomeworkDetail() {
  const emptyState = document.getElementById('noHwSelected');
  const detailContent = document.getElementById('hwDetailContent');

  const currentHw = homeworkList.find(h => h.id === selectedHwId);
  if (!currentHw) {
    emptyState.classList.remove('hidden');
    detailContent.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  detailContent.classList.remove('hidden');

  document.getElementById('currentHwTitle').textContent = `【${currentHw.subject}】${currentHw.title}`;
  document.getElementById('currentHwSubinfo').textContent = `科目：${currentHw.subject} ｜ 繳交期限：${currentHw.deadline}`;

  const paidCount = currentHw.paidIds.length;
  const rate = Math.round((paidCount / TOTAL_STUDENTS) * 100);
  document.getElementById('currentHwCount').textContent = paidCount;
  document.getElementById('currentHwRate').textContent = `${rate}%`;
  document.getElementById('hwProgressBar').style.width = `${rate}%`;

  // Calculate unpaid students
  const unpaidStudents = [];
  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    if (!currentHw.paidIds.includes(i)) {
      unpaidStudents.push(i);
    }
  }

  document.getElementById('unpaidCount').textContent = unpaidStudents.length;
  const unpaidTextEl = document.getElementById('unpaidListText');
  if (unpaidStudents.length === 0) {
    unpaidTextEl.innerHTML = '<span style="color:var(--success); font-weight:800;">🎉 全班 31 位已全部繳齊！</span>';
  } else {
    unpaidTextEl.textContent = unpaidStudents.map(n => `${n} 號`).join('、');
  }

  // Render 31-student picker grid
  const grid = document.getElementById('hwStudentPickerGrid');
  grid.innerHTML = '';

  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    const isPaid = currentHw.paidIds.includes(i);
    const btn = document.createElement('div');
    btn.className = `hw-student-btn ${isPaid ? 'paid' : ''}`;
    btn.innerHTML = `
      <div class="st-num">${i}</div>
      <div class="st-state">${isPaid ? '已交' : '未交'}</div>
    `;

    btn.addEventListener('click', () => {
      toggleStudentPaid(i);
    });

    grid.appendChild(btn);
  }
}

function toggleStudentPaid(studentId) {
  const currentHw = homeworkList.find(h => h.id === selectedHwId);
  if (!currentHw) return;

  const idx = currentHw.paidIds.indexOf(studentId);
  if (idx === -1) {
    currentHw.paidIds.push(studentId);
  } else {
    currentHw.paidIds.splice(idx, 1);
  }

  saveHomework();
}

// 3. Smart Blackboard
function initBlackboard() {
  const saved = localStorage.getItem('academic_board_data');
  if (saved) {
    try {
      boardData = JSON.parse(saved);
    } catch (e) {}
  }
  renderBlackboard();
}

function saveBlackboard() {
  localStorage.setItem('academic_board_data', JSON.stringify(boardData));
  renderBlackboard();
}

function renderBlackboard() {
  // Update header date
  const now = new Date();
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const dateStr = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} (${days[now.getDay()]})`;
  
  const boardDateEl = document.getElementById('boardDate');
  if (boardDateEl) boardDateEl.textContent = `${dateStr} 聯絡簿公告`;
  
  const currentDateBadge = document.getElementById('currentDateBadge');
  if (currentDateBadge) currentDateBadge.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${days[now.getDay()]}`;

  // Render Homework column from homeworkList
  const boardHwList = document.getElementById('boardHwList');
  if (homeworkList.length === 0) {
    boardHwList.innerHTML = '<div style="color:rgba(255,255,255,0.4); font-style:italic;">今日無指派作業</div>';
  } else {
    boardHwList.innerHTML = homeworkList.map(h => `
      <div class="board-item">
        <span class="board-item-text">▫️ <strong>【${h.subject}】</strong> ${h.title} <span style="font-size:0.85em; opacity:0.8;">(${h.deadline})</span></span>
      </div>
    `).join('');
  }

  // Render Exam column
  const boardExamList = document.getElementById('boardExamList');
  if (boardData.exams.length === 0) {
    boardExamList.innerHTML = '<div style="color:rgba(255,255,255,0.4); font-style:italic;">明日無排定小考</div>';
  } else {
    boardExamList.innerHTML = boardData.exams.map((ex, idx) => `
      <div class="board-item">
        <span class="board-item-text">✏️ ${ex}</span>
        <button class="board-item-del" onclick="deleteExam(${idx})" title="刪除">✕</button>
      </div>
    `).join('');
  }

  // Render Notes column
  const boardNoteList = document.getElementById('boardNoteList');
  if (boardData.notes.length === 0) {
    boardNoteList.innerHTML = '<div style="color:rgba(255,255,255,0.4); font-style:italic;">無特別事項</div>';
  } else {
    boardNoteList.innerHTML = boardData.notes.map((nt, idx) => `
      <div class="board-item">
        <span class="board-item-text">📌 ${nt}</span>
        <button class="board-item-del" onclick="deleteNote(${idx})" title="刪除">✕</button>
      </div>
    `).join('');
  }
}

window.deleteExam = function(idx) {
  boardData.exams.splice(idx, 1);
  saveBlackboard();
};

window.deleteNote = function(idx) {
  boardData.notes.splice(idx, 1);
  saveBlackboard();
};

// ================= Timetable (資處一仁課程表) =================
function initSchedule() {
  renderScheduleTable();
  highlightToday();
}

function renderScheduleTable() {
  const tbody = document.getElementById('scheduleTableBody');
  if (!tbody) return;

  let html = '';

  // Render Periods 1 to 4
  for (let p = 0; p < 4; p++) {
    const periodInfo = CLASS_SCHEDULE.periods[p];
    html += `<tr>`;
    html += `
      <td class="period-header-cell">
        <div class="period-name">${periodInfo.name}</div>
        <div class="period-time">${periodInfo.time}</div>
      </td>
    `;

    for (let day = 1; day <= 5; day++) {
      const course = CLASS_SCHEDULE.grid[day][p];
      html += `
        <td class="course-cell day-col-cell" data-day="${day}">
          <div class="course-chip">
            <span class="course-name">${course.subject}</span>
            <span class="course-teacher">${course.teacher}</span>
            ${course.loc ? `<span class="course-location">📍 ${course.loc}</span>` : ''}
          </div>
        </td>
      `;
    }
    html += `</tr>`;
  }

  // Lunch Break row
  html += `
    <tr class="lunch-row">
      <td class="period-header-cell">
        <div class="period-name">🍱 午休</div>
        <div class="period-time">12:00~13:10</div>
      </td>
      <td colspan="5">午餐與午休時間 (12:00 ～ 13:10)</td>
    </tr>
  `;

  // Render Periods 5 to 7
  for (let p = 4; p < 7; p++) {
    const periodInfo = CLASS_SCHEDULE.periods[p];
    html += `<tr>`;
    html += `
      <td class="period-header-cell">
        <div class="period-name">${periodInfo.name}</div>
        <div class="period-time">${periodInfo.time}</div>
      </td>
    `;

    for (let day = 1; day <= 5; day++) {
      const course = CLASS_SCHEDULE.grid[day][p];
      html += `
        <td class="course-cell day-col-cell" data-day="${day}">
          <div class="course-chip">
            <span class="course-name">${course.subject}</span>
            <span class="course-teacher">${course.teacher}</span>
            ${course.loc ? `<span class="course-location">📍 ${course.loc}</span>` : ''}
          </div>
        </td>
      `;
    }
    html += `</tr>`;
  }

  tbody.innerHTML = html;

  // Add click to highlight any day
  document.querySelectorAll('.day-col').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const day = parseInt(th.getAttribute('data-day'));
      setHighlightedDay(day);
    });
  });
}

function setHighlightedDay(dayNum) {
  document.querySelectorAll('.day-col, .day-col-cell').forEach(el => {
    el.classList.remove('highlight-day');
  });

  document.querySelectorAll(`[data-day="${dayNum}"]`).forEach(el => {
    el.classList.add('highlight-day');
  });
}

function highlightToday() {
  const currentDay = new Date().getDay(); // 0 = Sun, 1 = Mon, ... 5 = Fri, 6 = Sat
  const activeDay = (currentDay >= 1 && currentDay <= 5) ? currentDay : 1;
  setHighlightedDay(activeDay);

  const logWeekdaySelect = document.getElementById('logWeekdaySelect');
  if (logWeekdaySelect) {
    logWeekdaySelect.value = activeDay;
  }
}

// 4. Class Logbook Generator
function initLogbook() {
  const saved = localStorage.getItem('academic_logbook_data');
  if (saved) {
    try {
      logbookData = JSON.parse(saved);
    } catch (e) {}
  }

  const dateInput = document.getElementById('logDateInput');
  const todayStr = new Date().toISOString().split('T')[0];
  if (!logbookData.date) logbookData.date = todayStr;
  dateInput.value = logbookData.date;

  document.getElementById('logAbsentInput').value = logbookData.absent || '';
  document.getElementById('logOfficerName').value = logbookData.officer || '';

  renderLogbookTable();
}

function autoFillLogFromSchedule(dayNumber = null) {
  if (!dayNumber) {
    const sel = document.getElementById('logWeekdaySelect');
    dayNumber = parseInt(sel.value) || new Date().getDay();
    if (dayNumber < 1 || dayNumber > 5) dayNumber = 1;
  }

  const dayCourses = CLASS_SCHEDULE.grid[dayNumber];
  if (!dayCourses) return;

  const dayNames = ['', '週一', '週二', '週三', '週四', '週五'];

  for (let i = 0; i < 7; i++) {
    const course = dayCourses[i];
    if (logbookData.periods[i]) {
      logbookData.periods[i].subject = course.subject;
      logbookData.periods[i].teacher = course.teacher;
      if (course.loc) {
        logbookData.periods[i].progress = `[${course.loc}] `;
      }
    }
  }

  saveLogbook();
  renderLogbookTable();
  showToast(`⚡ 已成功帶入「${dayNames[dayNumber]}」課表科目與任課教師！`);
}

function saveLogbook() {
  logbookData.date = document.getElementById('logDateInput').value;
  logbookData.absent = document.getElementById('logAbsentInput').value;
  logbookData.officer = document.getElementById('logOfficerName').value;

  // collect table rows
  for (let i = 0; i < 7; i++) {
    const row = document.getElementById(`log_row_${i + 1}`);
    if (row) {
      logbookData.periods[i] = {
        period: i + 1,
        subject: row.querySelector('.subject-input').value,
        teacher: row.querySelector('.teacher-input').value,
        progress: row.querySelector('.progress-input').value,
        note: row.querySelector('.note-input').value
      };
    }
  }

  localStorage.setItem('academic_logbook_data', JSON.stringify(logbookData));
}

function renderLogbookTable() {
  const tbody = document.getElementById('logTableBody');
  tbody.innerHTML = '';

  const periodNames = ['第一節', '第2節', '第三節', '第四節', '第5節', '第6節', '第7節'];

  logbookData.periods.slice(0, 7).forEach((p, idx) => {
    const tr = document.createElement('tr');
    tr.id = `log_row_${idx + 1}`;
    tr.innerHTML = `
      <td class="period-col">${periodNames[idx]}</td>
      <td><input type="text" class="subject-input" value="${p.subject || ''}" placeholder="例：會計" oninput="saveLogbook()"></td>
      <td><input type="text" class="teacher-input" value="${p.teacher || ''}" placeholder="例：週櫻" oninput="saveLogbook()"></td>
      <td><input type="text" class="progress-input" value="${p.progress || ''}" placeholder="進度摘要" oninput="saveLogbook()"></td>
      <td><input type="text" class="note-input" value="${p.note || ''}" placeholder="交代作業/備註" oninput="saveLogbook()"></td>
    `;
    tbody.appendChild(tr);
  });
}

function copyLogSheetText() {
  saveLogbook();
  const periodNames = ['第一節', '第2節', '第三節', '第四節', '第5節', '第6節', '第7節'];
  const pList = logbookData.periods.slice(0, 7).map((p, idx) => 
    `【${periodNames[idx]}】科目：${p.subject || '無'} ｜ 教師：${p.teacher || '無'} ｜ 進度：${p.progress || '無'} ｜ 備註：${p.note || '無'}`
  ).join('\n');

  const text = `【115學年第1學期 資處一仁 教室日誌】\n日期：${logbookData.date}\n應到人數：31人\n缺席座號：${logbookData.absent || '全班到齊'}\n學藝股長：${logbookData.officer || '學藝股長'}\n-----------------------------------\n各節課堂教學紀錄：\n${pList}\n-----------------------------------\n今日收繳作業進度：\n${homeworkList.map(h => `▪️ 【${h.subject}】${h.title} (已交 ${h.paidIds.length}/31人)`).join('\n')}`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('✅ 已將全天日誌完整複製到剪貼簿！');
  }).catch(() => {
    alert(text);
  });
}

// 5. Lottery Section (1 ~ 31)
let isRolling = false;
let drawnIds = new Set();

function initLottery() {
  updateLotteryPoolCount();
  renderStudentGrid();
}

function updateLotteryPoolCount() {
  const noRepeat = document.getElementById('noRepeatCheck').checked;
  let remaining = 0;
  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    if (!noRepeat || !drawnIds.has(i)) remaining++;
  }
  document.getElementById('remainingPoolCount').textContent = remaining;
}

function renderStudentGrid() {
  const grid = document.getElementById('studentGrid');
  grid.innerHTML = '';

  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    const isDrawn = drawnIds.has(i);
    const card = document.createElement('div');
    card.className = `student-card ${isDrawn ? 'drawn' : ''}`;
    card.innerHTML = `
      <div class="student-number">${i}</div>
      <div style="font-size:0.75rem; color:var(--text-muted);">${isDrawn ? '已抽過' : '待抽'}</div>
    `;
    grid.appendChild(card);
  }
}

function startLottery() {
  if (isRolling) return;

  const pickCount = parseInt(document.getElementById('pickCount').value) || 1;
  const noRepeat = document.getElementById('noRepeatCheck').checked;

  const pool = [];
  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    if (!noRepeat || !drawnIds.has(i)) pool.push(i);
  }

  if (pool.length === 0) {
    alert('抽籤池已抽完全部 31 位同學！請點擊重置抽籤池。');
    return;
  }

  if (pickCount > pool.length) {
    alert(`剩餘人數不足（剩餘 ${pool.length} 人，欲抽取 ${pickCount} 人）！`);
    return;
  }

  isRolling = true;
  document.getElementById('startLotteryBtn').disabled = true;

  const winnerDisplay = document.getElementById('winnerDisplay');
  const subWinnerList = document.getElementById('subWinnerList');
  subWinnerList.innerHTML = '';
  winnerDisplay.classList.remove('winner-pop');
  winnerDisplay.classList.add('rolling');

  let duration = 2000;
  let intervalTime = 60;
  let elapsed = 0;

  const timer = setInterval(() => {
    elapsed += intervalTime;
    sfx.playTick();

    const randNum = pool[Math.floor(Math.random() * pool.length)];
    winnerDisplay.textContent = `${randNum} 號`;

    if (elapsed >= duration) {
      clearInterval(timer);
      finishLottery(pool, pickCount, noRepeat);
    }
  }, intervalTime);
}

function finishLottery(pool, pickCount, noRepeat) {
  isRolling = false;
  document.getElementById('startLotteryBtn').disabled = false;

  const winnerDisplay = document.getElementById('winnerDisplay');
  const subWinnerList = document.getElementById('subWinnerList');
  winnerDisplay.classList.remove('rolling');
  winnerDisplay.classList.add('winner-pop');

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const winners = shuffled.slice(0, pickCount);

  sfx.playWin();

  if (typeof confetti === 'function') {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });
  }

  if (winners.length === 1) {
    winnerDisplay.textContent = `${winners[0]} 號`;
  } else {
    winnerDisplay.textContent = `${winners[0]} 號`;
    subWinnerList.innerHTML = winners.slice(1).map(w => 
      `<div class="sub-winner-tag">${w} 號</div>`
    ).join('');
  }

  if (noRepeat) {
    winners.forEach(w => drawnIds.add(w));
  }

  updateLotteryPoolCount();
  renderStudentGrid();
}

function resetLotteryPool() {
  drawnIds.clear();
  updateLotteryPoolCount();
  renderStudentGrid();
  document.getElementById('winnerDisplay').innerHTML = '<span class="ready-text">課堂提問準備抽籤</span>';
  document.getElementById('subWinnerList').innerHTML = '';
  showToast('抽籤池已重設 (31人)');
}

// 6. Assistants & Roster
function initAssistants() {
  const saved = localStorage.getItem('academic_assistants');
  if (saved) {
    try {
      assistantsData = JSON.parse(saved);
    } catch (e) {
      assistantsData = {};
    }
  }
  renderAssistants();
  renderStudentRoster();
}

function renderAssistants() {
  const container = document.getElementById('assistantsGrid');
  if (!container) return;

  container.innerHTML = TIMETABLE_SUBJECTS.map(s => {
    const val = assistantsData[s.id] || assistantsData[s.subject] || '';
    return `
      <div class="assistant-row">
        <div class="assistant-meta">
          <span class="assistant-subject">${s.subject} 小老師</span>
          <span class="assistant-teacher">任課：${s.teacher} 老師</span>
          ${s.loc ? `<span class="assistant-loc-chip">📍 ${s.loc}</span>` : ''}
        </div>
        <input type="text" class="assistant-input" id="assist_${s.id}" value="${val}" placeholder="座號/姓名" onchange="autoSaveAssistant('${s.id}', this.value)">
      </div>
    `;
  }).join('');
}

window.autoSaveAssistant = function(id, val) {
  assistantsData[id] = val.trim();
  localStorage.setItem('academic_assistants', JSON.stringify(assistantsData));
};

function saveAssistants() {
  TIMETABLE_SUBJECTS.forEach(s => {
    const input = document.getElementById(`assist_${s.id}`);
    if (input) assistantsData[s.id] = input.value.trim();
  });
  localStorage.setItem('academic_assistants', JSON.stringify(assistantsData));
  showToast('✅ 已儲存全班 19 科小老師名單！');
}

function renderStudentRoster() {
  const container = document.getElementById('studentRosterList');
  container.innerHTML = students.map(s => `
    <div class="roster-card">
      <span class="roster-num">${s.id} 號</span>
      <input type="text" class="roster-input" value="${s.note || ''}" placeholder="備註/姓名" onchange="updateStudentNote(${s.id}, this.value)">
    </div>
  `).join('');
}

window.updateStudentNote = function(id, note) {
  const st = students.find(s => s.id === id);
  if (st) {
    st.note = note;
    saveStudents();
  }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initStudents();
  initSchedule();
  initHomework();
  initBlackboard();
  initLogbook();
  initLottery();
  initAssistants();

  // Schedule Buttons
  const highlightBtn = document.getElementById('highlightTodayBtn');
  if (highlightBtn) highlightBtn.addEventListener('click', highlightToday);

  const autoFillBtn = document.getElementById('autoFillLogFromScheduleBtn');
  if (autoFillBtn) autoFillBtn.addEventListener('click', () => autoFillLogFromSchedule());

  const logWeekdaySelect = document.getElementById('logWeekdaySelect');
  if (logWeekdaySelect) {
    logWeekdaySelect.addEventListener('change', (e) => {
      autoFillLogFromSchedule(parseInt(e.target.value));
    });
  }

  // Navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Homework Actions
  document.getElementById('copyUnpaidBtn').addEventListener('click', () => {
    const currentHw = homeworkList.find(h => h.id === selectedHwId);
    if (!currentHw) return;

    const unpaid = [];
    for (let i = 1; i <= TOTAL_STUDENTS; i++) {
      if (!currentHw.paidIds.includes(i)) unpaid.push(i);
    }

    let text = '';
    if (unpaid.length === 0) {
      text = `【${currentHw.subject} - ${currentHw.title}】全班 31 位同學均已繳齊！`;
    } else {
      text = `【${currentHw.subject} - ${currentHw.title}】未交座號 (共 ${unpaid.length} 人)：\n${unpaid.map(n => `${n}號`).join('、')}`;
    }

    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 已複製未繳名單至剪貼簿！');
    });
  });

  document.getElementById('markAllPaidBtn').addEventListener('click', () => {
    const currentHw = homeworkList.find(h => h.id === selectedHwId);
    if (!currentHw) return;
    currentHw.paidIds = Array.from({ length: TOTAL_STUDENTS }, (_, i) => i + 1);
    saveHomework();
    showToast('已將全班設為已繳！');
  });

  document.getElementById('markAllUnpaidBtn').addEventListener('click', () => {
    const currentHw = homeworkList.find(h => h.id === selectedHwId);
    if (!currentHw) return;
    currentHw.paidIds = [];
    saveHomework();
    showToast('已重設為全部未繳！');
  });

  // Add Homework Modal
  const modal = document.getElementById('addHwModal');
  document.getElementById('openAddHwModalBtn').addEventListener('click', () => {
    document.getElementById('newHwTitle').value = '';
    document.getElementById('newHwDeadline').value = '';
    modal.classList.remove('hidden');
  });

  document.getElementById('closeAddHwModalBtn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  document.getElementById('confirmAddHwBtn').addEventListener('click', () => {
    const subj = document.getElementById('newHwSubject').value;
    const title = document.getElementById('newHwTitle').value.trim();
    const deadline = document.getElementById('newHwDeadline').value.trim() || '今日放學前';

    if (!title) {
      alert('請輸入作業名稱或範圍！');
      return;
    }

    const newHw = {
      id: 'hw_' + Date.now(),
      subject: subj,
      title: title,
      deadline: deadline,
      paidIds: []
    };

    homeworkList.unshift(newHw);
    selectedHwId = newHw.id;
    saveHomework();
    modal.classList.add('hidden');
    showToast('✅ 作業新增成功！');
  });

  // Blackboard Add prompts
  document.getElementById('addExamPromptBtn').addEventListener('click', () => {
    const val = prompt('請輸入明日小考科目與範圍：', '例：英文第 2 課單字大考');
    if (val && val.trim()) {
      boardData.exams.push(val.trim());
      saveBlackboard();
      showToast('已新增小考項目');
    }
  });

  document.getElementById('addNotePromptBtn').addEventListener('click', () => {
    const val = prompt('請輸入注意事項或攜帶物品：', '例：帶童軍繩、交社團申請單');
    if (val && val.trim()) {
      boardData.notes.push(val.trim());
      saveBlackboard();
      showToast('已新增注意事項');
    }
  });

  // Logbook actions
  document.getElementById('copyLogSheetBtn').addEventListener('click', copyLogSheetText);
  document.getElementById('logDateInput').addEventListener('change', saveLogbook);
  document.getElementById('logAbsentInput').addEventListener('change', saveLogbook);
  document.getElementById('logOfficerName').addEventListener('change', saveLogbook);

  // Lottery buttons
  document.getElementById('startLotteryBtn').addEventListener('click', startLottery);
  document.getElementById('resetLotteryPoolBtn').addEventListener('click', resetLotteryPool);
  document.getElementById('decreasePickBtn').addEventListener('click', () => {
    const input = document.getElementById('pickCount');
    let val = parseInt(input.value) || 1;
    if (val > 1) input.value = val - 1;
  });
  document.getElementById('increasePickBtn').addEventListener('click', () => {
    const input = document.getElementById('pickCount');
    let val = parseInt(input.value) || 1;
    if (val < TOTAL_STUDENTS) input.value = val + 1;
  });
  document.getElementById('noRepeatCheck').addEventListener('change', updateLotteryPoolCount);

  // Assistants save
  document.getElementById('saveAssistantsBtn').addEventListener('click', saveAssistants);

  // Reset names to numbers
  document.getElementById('resetNamesToPureNumbersBtn').addEventListener('click', () => {
    if (confirm('確定要清除所有備註，還原為純 1~31 號嗎？')) {
      students = Array.from({ length: TOTAL_STUDENTS }, (_, i) => ({
        id: i + 1,
        name: `${i + 1} 號`,
        note: ''
      }));
      saveStudents();
      showToast('已還原為純 1~31 號！');
    }
  });

  // Toggles
  const themeBtn = document.getElementById('themeToggleBtn');
  themeBtn.addEventListener('click', () => {
    if (document.body.getAttribute('data-theme') === 'light') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
  });

  const soundBtn = document.getElementById('soundToggleBtn');
  soundBtn.addEventListener('click', () => {
    sfx.enabled = !sfx.enabled;
    soundBtn.textContent = sfx.enabled ? '🔊' : '🔇';
    soundBtn.classList.toggle('active', sfx.enabled);
  });

  const fullscreenBtn = document.getElementById('fullscreenBtn');
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });
});
