/**
 * 資處一仁學藝 - 學生名冊與系統設定模組 (Roster & Settings Module)
 * 包含：座號姓名管理、學生個別缺交作業總覽檢視、批量貼上匯入名單、JSON 備份與還原
 */

const RosterModule = {
  activeStudentSeat: null,

  init() {
    this.renderRosterTable();
    this.renderClassSettings();
    this.bindEvents();

    store.on("roster_updated", () => {
      this.renderRosterTable();
    });
    store.on("classInfo_updated", () => {
      this.renderClassSettings();
    });
  },

  bindEvents() {
    // 儲存班級基本設定
    const classForm = document.getElementById("classSettingsForm");
    if (classForm) {
      classForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveClassSettings();
      });
    }

    // 批量匯入名單按鈕
    const btnBatchImport = document.getElementById("btnBatchImportRoster");
    if (btnBatchImport) {
      btnBatchImport.addEventListener("click", () => {
        this.openBatchImportModal();
      });
    }

    // 批量匯入表單
    const batchForm = document.getElementById("batchImportForm");
    if (batchForm) {
      batchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleBatchImport();
      });
    }

    // 備份匯出 JSON
    const btnExport = document.getElementById("btnExportBackup");
    if (btnExport) {
      btnExport.addEventListener("click", () => {
        sound.playSuccess();
        store.exportJSON();
        window.app.showToast("備份檔已開始下載！", "success");
      });
    }

    // 備份還原 JSON
    const restoreInput = document.getElementById("backupFileInput");
    if (restoreInput) {
      restoreInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            store.importJSON(event.target.result);
            sound.playSuccess();
            window.app.showToast("資料已成功還原！", "success");
            location.reload();
          } catch (err) {
            window.app.showToast("還原失敗：檔案格式不符合！", "danger");
          }
        };
        reader.readAsText(file);
      });
    }

    // 重設為預設資料
    const btnReset = document.getElementById("btnResetDefaults");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (confirm("⚠️ 警告：這將會清除目前所有自訂的日誌與作業紀錄，並回復至預設資處一仁範本。確定要重設嗎？")) {
          store.resetToDefaults();
          sound.playClick("pop");
          window.app.showToast("已回復至預設資料！", "info");
          location.reload();
        }
      });
    }
  },

  renderClassSettings() {
    const classInfo = store.getState("classInfo") || DEFAULT_DATA.classInfo;
    const nameInput = document.getElementById("cfgClassName");
    const fullInput = document.getElementById("cfgFullName");
    const yearInput = document.getElementById("cfgSchoolYear");
    const seatsInput = document.getElementById("cfgSeatCount");
    const cadreInput = document.getElementById("cfgCadre");

    if (nameInput) nameInput.value = classInfo.name || "資處一仁";
    if (fullInput) fullInput.value = classInfo.fullName || "資料處理科 一年仁班";
    if (yearInput) yearInput.value = classInfo.schoolYear || "114學年度 第一學期";
    if (seatsInput) seatsInput.value = classInfo.seatCount || 42;
    if (cadreInput) cadreInput.value = `${classInfo.cadre?.academic || '學藝股長'} / ${classInfo.cadre?.leader || '班長'}`;
  },

  saveClassSettings() {
    const classInfo = store.getState("classInfo") || {};
    const newCount = parseInt(document.getElementById("cfgSeatCount").value, 10) || 42;

    classInfo.name = document.getElementById("cfgClassName").value.trim() || "資處一仁";
    classInfo.fullName = document.getElementById("cfgFullName").value.trim() || "資料處理科 一年仁班";
    classInfo.schoolYear = document.getElementById("cfgSchoolYear").value.trim();
    classInfo.seatCount = newCount;

    // 調整名冊長度
    let roster = store.getState("roster") || [];
    if (roster.length < newCount) {
      for (let s = roster.length + 1; s <= newCount; s++) {
        roster.push({ seat: s, name: `${s}號`, gender: "M", note: "" });
      }
    } else if (roster.length > newCount) {
      roster = roster.slice(0, newCount);
    }

    store.update("classInfo", classInfo);
    store.update("roster", roster);

    sound.playSuccess();
    window.app.showToast("班級設定已成功儲存！", "success");
    window.app.updateHeaderBranding();
  },

  renderRosterTable() {
    const tableBody = document.getElementById("rosterTableBody");
    if (!tableBody) return;

    const roster = store.getState("roster") || [];
    const homeworks = store.getState("homeworks") || [];
    const activeHws = homeworks.filter(h => h.status !== "completed");

    tableBody.innerHTML = roster.map(student => {
      // 計算該學生缺交筆數
      let studentMissingCount = 0;
      activeHws.forEach(h => {
        if ((h.unsubmitted || []).includes(student.seat)) {
          studentMissingCount++;
        }
      });

      return `
        <tr class="roster-row" data-seat="${student.seat}">
          <td class="seat-badge-col">
            <span class="seat-number-pill">${student.seat} 號</span>
          </td>
          <td>
            <input type="text" class="input-table input-student-name" value="${student.name}" data-seat="${student.seat}" placeholder="學生姓名">
          </td>
          <td>
            <input type="text" class="input-table input-student-note" value="${student.note || ''}" data-seat="${student.seat}" placeholder="幹部/職務備註">
          </td>
          <td>
            ${studentMissingCount > 0 
              ? `<span class="badge-missing-warning">🚨 缺交 ${studentMissingCount} 項</span>` 
              : `<span class="badge-all-clear">✅ 良好無缺交</span>`}
          </td>
          <td class="actions-col">
            <button class="btn-text-action btn-inspect-student" data-seat="${student.seat}" title="查看該座號所有作業缺交清單">
              🔍 缺交明細
            </button>
          </td>
        </tr>
      `;
    }).join("");

    // 綁定名字修改即時儲存
    tableBody.querySelectorAll(".input-student-name").forEach(input => {
      input.addEventListener("change", (e) => {
        const seat = parseInt(e.target.dataset.seat, 10);
        const newName = e.target.value.trim() || `${seat}號`;
        this.updateStudentData(seat, { name: newName });
      });
    });

    tableBody.querySelectorAll(".input-student-note").forEach(input => {
      input.addEventListener("change", (e) => {
        const seat = parseInt(e.target.dataset.seat, 10);
        const newNote = e.target.value.trim();
        this.updateStudentData(seat, { note: newNote });
      });
    });

    // 綁定個別缺交清單檢查
    tableBody.querySelectorAll(".btn-inspect-student").forEach(btn => {
      btn.addEventListener("click", () => {
        const seat = parseInt(btn.dataset.seat, 10);
        this.openStudentInspectModal(seat);
      });
    });
  },

  updateStudentData(seat, partial) {
    const roster = store.getState("roster") || [];
    const idx = roster.findIndex(s => s.seat === seat);
    if (idx >= 0) {
      roster[idx] = { ...roster[idx], ...partial };
      store.update("roster", roster);
      sound.playClick("toggle");
    }
  },

  openStudentInspectModal(seat) {
    const student = store.getStudent(seat);
    const homeworks = store.getState("homeworks") || [];
    const modal = document.getElementById("studentInspectModal");

    document.getElementById("inspectStudentTitle").textContent = `${student.seat} 號 ${student.name} - 作業與修課狀態`;

    const unsubmittedList = [];
    const makeupList = [];
    const submittedList = [];

    homeworks.forEach(h => {
      const subj = store.getSubject(h.subjectId);
      if ((h.unsubmitted || []).includes(seat)) {
        unsubmittedList.push({ ...h, subjectName: subj.name, color: subj.color });
      } else if ((h.makeup || []).includes(seat)) {
        makeupList.push({ ...h, subjectName: subj.name, color: subj.color });
      } else {
        submittedList.push({ ...h, subjectName: subj.name, color: subj.color });
      }
    });

    const contentBox = document.getElementById("inspectStudentContent");
    contentBox.innerHTML = `
      <div class="inspect-stats-summary">
        <div class="stat-pill red">🚨 缺交未交：${unsubmittedList.length} 項</div>
        <div class="stat-pill blue">🔄 待補交：${makeupList.length} 項</div>
        <div class="stat-pill green">✅ 已繳交：${submittedList.length} 項</div>
      </div>

      <div class="inspect-section">
        <h4>🚨 目前缺交之作業項目：</h4>
        ${unsubmittedList.length === 0 
          ? '<p class="all-good-msg">🎉 太棒了！該同學目前無任何缺交作業！</p>' 
          : `<ul class="inspect-item-list">
              ${unsubmittedList.map(h => `
                <li class="missing-item">
                  <span class="subj-tag" style="background:${h.color}22; color:${h.color}">${h.subjectName}</span>
                  <strong>${h.title}</strong>
                  <span class="due-hint">（截止：${h.dueDate}，收件人：${h.recipient}）</span>
                </li>
              `).join("")}
            </ul>`
        }
      </div>

      ${makeupList.length > 0 ? `
        <div class="inspect-section">
          <h4>🔄 待小老師簽核之補交項目：</h4>
          <ul class="inspect-item-list">
            ${makeupList.map(h => `
              <li class="makeup-item">
                <span class="subj-tag" style="background:${h.color}22; color:${h.color}">${h.subjectName}</span>
                <strong>${h.title}</strong>
              </li>
            `).join("")}
          </ul>
        </div>
      ` : ''}
    `;

    modal.classList.add("is-active");
    sound.playClick("pop");
  },

  openBatchImportModal() {
    const modal = document.getElementById("batchImportModal");
    if (modal) modal.classList.add("is-active");
    sound.playClick("pop");
  },

  handleBatchImport() {
    const textarea = document.getElementById("batchImportText");
    const raw = textarea.value.trim();
    if (!raw) return;

    const lines = raw.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const newRoster = [];

    lines.forEach((line, idx) => {
      const seat = idx + 1;
      // 支援 "1 張三" 或 "張三" 格式
      const nameParts = line.split(/\s+/);
      let name = line;
      if (nameParts.length >= 2 && !isNaN(parseInt(nameParts[0], 10))) {
        name = nameParts.slice(1).join(" ");
      }
      newRoster.push({
        seat,
        name,
        gender: "M",
        note: ""
      });
    });

    const classInfo = store.getState("classInfo");
    classInfo.seatCount = newRoster.length;
    store.update("classInfo", classInfo);
    store.update("roster", newRoster);

    document.getElementById("batchImportModal").classList.remove("is-active");
    textarea.value = "";
    sound.playSuccess();
    window.app.showToast(`已成功匯入 ${newRoster.length} 位學生名單！`, "success");
  }
};

window.RosterModule = RosterModule;
