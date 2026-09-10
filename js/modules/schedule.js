/**
 * 智光商工 資處一仁 - 課表與各科小老師模組 (Schedule & Assistants Module)
 * 包含：週一至週五 7 節正式互動課表、今日高亮、各科小老師通訊錄
 */

const ScheduleModule = {
  currentDayTab: 1, // 1~5
  activeScheduleEdit: null, // { day, period }

  init() {
    this.determineToday();
    this.renderScheduleTable();
    this.renderAssistantsList();
    this.bindEvents();

    store.on("schedule_updated", () => {
      this.renderScheduleTable();
    });
    store.on("subjects_updated", () => {
      this.renderScheduleTable();
      this.renderAssistantsList();
    });
  },

  determineToday() {
    const day = new Date().getDay();
    if (day >= 1 && day <= 5) {
      this.currentDayTab = day;
    } else {
      this.currentDayTab = 1; // 週末預設顯示週一
    }
  },

  bindEvents() {
    // 課表切換星期按鈕
    document.querySelectorAll(".day-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".day-tab-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.currentDayTab = parseInt(e.currentTarget.dataset.day, 10);
        this.renderScheduleTable();
        sound.playClick("toggle");
      });
    });

    // 編輯課表 Modal 提交
    const editForm = document.getElementById("scheduleEditForm");
    if (editForm) {
      editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSaveScheduleCell();
      });
    }

    // 編輯小老師 Modal 提交
    const assistantForm = document.getElementById("assistantEditForm");
    if (assistantForm) {
      assistantForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSaveAssistant();
      });
    }
  },

  renderScheduleTable() {
    const tableBody = document.getElementById("scheduleTableBody");
    if (!tableBody) return;

    const schedule = store.getState("schedule") || {};
    const subjects = store.getState("subjects") || [];
    const today = new Date().getDay(); // 1~5

    // 智光商工 正式節次時間表 (7 節)
    const periodTimes = [
      "08:10 ~ 09:00",
      "09:10 ~ 10:00",
      "10:10 ~ 11:00",
      "11:10 ~ 12:00",
      "01:10 ~ 02:00",
      "02:10 ~ 03:00",
      "03:10 ~ 04:00"
    ];

    let rowsHTML = "";
    for (let p = 1; p <= 7; p++) {
      let cellsHTML = "";

      // 週一到週五 (1~5)
      for (let d = 1; d <= 5; d++) {
        const dayList = schedule[d] || [];
        const item = dayList.find(i => i.period === p) || { subjectId: "", room: "", teacher: "", note: "" };
        const subj = subjects.find(s => s.id === item.subjectId) || { name: item.subjectId || "自習", color: "#64748b", icon: "📖", teacher: item.teacher || "" };
        const isTodayCol = d === today;
        const teacherName = item.teacher || subj.teacher || "";
        const roomName = item.room || subj.room || "";

        cellsHTML += `
          <td class="schedule-cell ${isTodayCol ? 'is-today-col' : ''}" 
              data-day="${d}" 
              data-period="${p}"
              title="點擊編輯 週${['','一','二','三','四','五'][d]} 第${p}節">
            <div class="cell-content" style="border-left: 3px solid ${subj.color};">
              <div class="cell-subj-title">
                <span class="cell-icon">${subj.icon}</span>
                <strong>${subj.name}</strong>
              </div>
              <div class="cell-sub-info">
                ${teacherName ? `<span class="cell-teacher">👩‍🏫 ${teacherName}</span>` : ''}
                ${roomName && roomName !== '班級教室' ? `<span class="cell-room">📍 ${roomName}</span>` : ''}
                ${item.note ? `<span class="cell-note" title="${item.note}">💡 ${item.note}</span>` : ''}
              </div>
            </div>
          </td>
        `;
      }

      // 中午休息分隔 (第四節後)
      if (p === 5) {
        rowsHTML += `
          <tr class="noon-break-row">
            <td colspan="6">🍱 12:00 ~ 13:10 午餐與午休時間 (靜音休息)</td>
          </tr>
        `;
      }

      rowsHTML += `
        <tr class="schedule-row">
          <td class="period-header">
            <span class="p-badge">第 ${p} 節</span>
            <span class="p-time">${periodTimes[p - 1]}</span>
          </td>
          ${cellsHTML}
        </tr>
      `;
    }

    tableBody.innerHTML = rowsHTML;

    // 綁定點擊格線進入編輯
    tableBody.querySelectorAll(".schedule-cell").forEach(cell => {
      cell.addEventListener("click", () => {
        const day = parseInt(cell.dataset.day, 10);
        const period = parseInt(cell.dataset.period, 10);
        this.openScheduleEditModal(day, period);
      });
    });
  },

  renderAssistantsList() {
    const container = document.getElementById("assistantsListContainer");
    if (!container) return;

    const subjects = store.getState("subjects") || [];

    container.innerHTML = subjects.map(s => {
      const assistant = s.assistant || { seat: 0, name: "尚未指定" };
      return `
        <div class="assistant-card glass-panel" style="border-top: 3px solid ${s.color};">
          <div class="assistant-card-header">
            <span class="subj-tag" style="background: ${s.color}22; color: ${s.color};">
              ${s.icon} ${s.name}
            </span>
            <button class="icon-btn btn-edit-asst" data-subj-id="${s.id}" title="修改任課老師與小老師名單">✏️</button>
          </div>
          <div class="assistant-card-body">
            <div class="asst-row">
              <span class="asst-label">👩‍🏫 任課老師</span>
              <strong class="asst-val">${s.teacher || "未設定"}</strong>
            </div>
            ${s.room ? `
              <div class="asst-row">
                <span class="asst-label">📍 上課地點</span>
                <span class="asst-room-badge">${s.room}</span>
              </div>
            ` : ''}
            <div class="asst-row">
              <span class="asst-label">🧑‍🎓 各科小老師</span>
              <div class="asst-student-badge">
                <span class="asst-seat">${assistant.seat ? `${assistant.seat}號` : ''}</span>
                <span class="asst-name">${assistant.name}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".btn-edit-asst").forEach(btn => {
      btn.addEventListener("click", () => {
        this.openAssistantEditModal(btn.dataset.subjId);
      });
    });
  },

  openScheduleEditModal(day, period) {
    this.activeScheduleEdit = { day, period };
    const modal = document.getElementById("scheduleEditModal");
    const title = document.getElementById("scheduleEditTitle");
    const form = document.getElementById("scheduleEditForm");
    const subjSelect = document.getElementById("schedEditSubject");

    const days = ["", "週一", "週二", "週三", "週四", "週五"];
    title.textContent = `修改課表：${days[day]} 第 ${period} 節`;

    const subjects = store.getState("subjects") || [];
    subjSelect.innerHTML = subjects.map(s => `
      <option value="${s.id}">${s.icon} ${s.name} (任課：${s.teacher}${s.room ? ` | ${s.room}` : ''})</option>
    `).join("");

    const schedule = store.getState("schedule") || {};
    const daySchedule = schedule[day] || [];
    const item = daySchedule.find(i => i.period === period) || {};

    subjSelect.value = item.subjectId || "acc";
    form.schedEditRoom.value = item.room || "";
    form.schedEditNote.value = item.note || "";

    modal.classList.add("is-active");
    sound.playClick("pop");
  },

  handleSaveScheduleCell() {
    if (!this.activeScheduleEdit) return;
    const { day, period } = this.activeScheduleEdit;
    const form = document.getElementById("scheduleEditForm");

    const schedule = store.getState("schedule") || {};
    if (!schedule[day]) schedule[day] = [];

    const subjects = store.getState("subjects") || [];
    const chosenSubj = subjects.find(s => s.id === form.schedEditSubject.value);

    const existingIdx = schedule[day].findIndex(i => i.period === period);
    const cellData = {
      period,
      subjectId: form.schedEditSubject.value,
      room: form.schedEditRoom.value.trim() || chosenSubj?.room || "班級教室",
      teacher: chosenSubj?.teacher || "",
      note: form.schedEditNote.value.trim()
    };

    if (existingIdx >= 0) {
      schedule[day][existingIdx] = cellData;
    } else {
      schedule[day].push(cellData);
    }

    store.update("schedule", schedule);
    document.getElementById("scheduleEditModal").classList.remove("is-active");
    sound.playSuccess();
    window.app.showToast("課表儲存成功！", "success");
  },

  openAssistantEditModal(subjId) {
    const modal = document.getElementById("assistantEditModal");
    const form = document.getElementById("assistantEditForm");
    const subj = store.getSubject(subjId);

    form.asstSubjectId.value = subj.id;
    form.asstTeacher.value = subj.teacher || "";
    form.asstSeat.value = subj.assistant?.seat || "";
    form.asstName.value = subj.assistant?.name || "";

    document.getElementById("asstModalTitle").textContent = `編輯【${subj.name}】任課老師與小老師`;
    modal.classList.add("is-active");
    sound.playClick("pop");
  },

  handleSaveAssistant() {
    const form = document.getElementById("assistantEditForm");
    const subjId = form.asstSubjectId.value;
    const subjects = store.getState("subjects") || [];
    const idx = subjects.findIndex(s => s.id === subjId);

    if (idx >= 0) {
      subjects[idx].teacher = form.asstTeacher.value.trim();
      subjects[idx].assistant = {
        seat: parseInt(form.asstSeat.value, 10) || 0,
        name: form.asstName.value.trim()
      };
      store.update("subjects", subjects);
      document.getElementById("assistantEditModal").classList.remove("is-active");
      sound.playSuccess();
      window.app.showToast("小老師資訊已更新！", "success");
    }
  }
};

window.ScheduleModule = ScheduleModule;
