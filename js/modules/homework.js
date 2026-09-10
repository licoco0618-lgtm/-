/**
 * 資處一仁學藝 - 作業登記與催繳管理模組 (Homework Module)
 * 包含：1~45 號視覺化座號盤、缺交即時運算、一鍵複製 LINE 催繳訊息、作業增刪改查
 */

const HomeworkModule = {
  currentFilter: "all", // all, active, completed
  currentSubjectFilter: "all",
  activeModalHwId: null,

  init() {
    this.renderHomeworkList();
    this.bindEvents();
    
    // 監聽狀態變更
    store.on("homeworks_updated", () => {
      this.renderHomeworkList();
      this.updateQuickSummary();
    });
    store.on("roster_updated", () => {
      this.renderHomeworkList();
    });
  },

  bindEvents() {
    // 篩選標籤
    document.querySelectorAll(".hw-filter-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".hw-filter-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.currentFilter = e.currentTarget.dataset.filter;
        this.renderHomeworkList();
      });
    });

    // 科目篩選下拉
    const subjectFilterSelect = document.getElementById("hwSubjectFilter");
    if (subjectFilterSelect) {
      subjectFilterSelect.addEventListener("change", (e) => {
        this.currentSubjectFilter = e.target.value;
        this.renderHomeworkList();
      });
    }

    // 新增作業按鈕
    const addHwBtn = document.getElementById("addHomeworkBtn");
    if (addHwBtn) {
      addHwBtn.addEventListener("click", () => {
        this.openHomeworkModal();
      });
    }

    // 作業表單提交
    const hwForm = document.getElementById("homeworkForm");
    if (hwForm) {
      hwForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSaveHomework();
      });
    }
  },

  renderHomeworkList() {
    const container = document.getElementById("homeworkListContainer");
    if (!container) return;

    const allHws = store.getState("homeworks") || [];
    const totalSeats = store.getState("classInfo").seatCount || 42;

    // 篩選
    const filtered = allHws.filter(hw => {
      if (this.currentFilter === "active" && hw.status === "completed") return false;
      if (this.currentFilter === "completed" && hw.status !== "completed") return false;
      if (this.currentSubjectFilter !== "all" && hw.subjectId !== this.currentSubjectFilter) return false;
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card glass-panel">
          <div class="empty-icon">🎉</div>
          <h3>目前無相符的作業項目</h3>
          <p>點擊上方「+ 新增作業」即可開始登記催繳清單！</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(hw => this.createHomeworkCardHTML(hw, totalSeats)).join("");

    // 綁定卡片內座號盤點擊事件
    container.querySelectorAll(".seat-chip").forEach(chip => {
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        const hwId = chip.dataset.hwId;
        const seat = parseInt(chip.dataset.seat, 10);
        sound.playClick("toggle");
        store.toggleSeatSubmission(hwId, seat);
      });
    });

    // 綁定一鍵複製催繳訊息
    container.querySelectorAll(".btn-copy-reminder").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const hwId = btn.dataset.hwId;
        this.copyLineReminder(hwId);
      });
    });

    // 綁定編輯與刪除
    container.querySelectorAll(".btn-edit-hw").forEach(btn => {
      btn.addEventListener("click", () => {
        this.openHomeworkModal(btn.dataset.hwId);
      });
    });

    container.querySelectorAll(".btn-delete-hw").forEach(btn => {
      btn.addEventListener("click", () => {
        if (confirm(`確定要刪除這筆作業登記嗎？`)) {
          sound.playClick("pop");
          store.deleteHomework(btn.dataset.hwId);
          window.app.showToast("已成功刪除作業", "info");
        }
      });
    });

    // 綁定全選/全清座號
    container.querySelectorAll(".btn-quick-all").forEach(btn => {
      btn.addEventListener("click", () => {
        const hwId = btn.dataset.hwId;
        const action = btn.dataset.action;
        this.batchSeatAction(hwId, action);
      });
    });
  },

  createHomeworkCardHTML(hw, totalSeats) {
    const subject = store.getSubject(hw.subjectId);
    const unsubmitted = hw.unsubmitted || [];
    const makeup = hw.makeup || [];
    const excused = hw.excused || [];

    const missingCount = unsubmitted.length;
    const makeupCount = makeup.length;
    const excusedCount = excused.length;
    const submittedCount = totalSeats - missingCount - excusedCount;
    const submitRate = Math.round((submittedCount / (totalSeats - excusedCount || 1)) * 100);

    const isDone = hw.status === "completed" || (missingCount === 0 && makeupCount === 0);

    // 座號矩陣 1~totalSeats
    let seatChipsHTML = "";
    for (let s = 1; s <= totalSeats; s++) {
      let statusClass = "seat-submitted"; // 綠色已交
      let titleTip = `${s}號：已繳交`;

      if (unsubmitted.includes(s)) {
        statusClass = "seat-unsubmitted"; // 紅色未交
        titleTip = `${s}號：未繳交 (點擊切換)`;
      } else if (makeup.includes(s)) {
        statusClass = "seat-makeup"; // 藍色補交
        titleTip = `${s}號：已補交 (點擊切換)`;
      } else if (excused.includes(s)) {
        statusClass = "seat-excused"; // 灰色請假
        titleTip = `${s}號：請假免交 (點擊切換)`;
      }

      const student = store.getStudent(s);
      const studentName = student ? student.name : `${s}號`;

      seatChipsHTML += `
        <button class="seat-chip ${statusClass}" 
          data-hw-id="${hw.id}" 
          data-seat="${s}" 
          title="${s}號 ${studentName} - ${titleTip}">
          <span class="seat-num">${s}</span>
        </button>
      `;
    }

    const missingSeatsList = unsubmitted.length > 0 ? unsubmitted.join(", ") : "無（全數繳齊 🎉）";
    const makeupSeatsList = makeup.length > 0 ? `<span class="tag-makeup">補交：${makeup.join(", ")} 號</span>` : "";

    return `
      <div class="hw-card glass-panel ${isDone ? "is-completed" : ""}" id="card-${hw.id}">
        <div class="hw-card-header">
          <div class="hw-header-left">
            <span class="subject-badge" style="background-color: ${subject.color}22; color: ${subject.color}; border-color: ${subject.color}55;">
              <span class="subj-icon">${subject.icon}</span> ${subject.name}
            </span>
            <span class="type-badge">${hw.typeLabel || "一般作業"}</span>
            ${isDone ? '<span class="status-badge-done">✅ 全數繳齊</span>' : '<span class="status-badge-active">⏳ 催繳進行中</span>'}
          </div>
          <div class="hw-header-right">
            <button class="icon-btn btn-edit-hw" data-hw-id="${hw.id}" title="編輯作業內容">✏️</button>
            <button class="icon-btn btn-delete-hw" data-hw-id="${hw.id}" title="刪除作業">🗑️</button>
          </div>
        </div>

        <div class="hw-card-body">
          <h3 class="hw-title">${hw.title}</h3>
          <p class="hw-desc">${hw.description || "無特別備註"}</p>
          
          <div class="hw-meta-grid">
            <div class="meta-item">
              <span class="meta-label">📅 繳交期限</span>
              <span class="meta-val highlight-date">${hw.dueDate || "未設定"}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">👤 收繳小老師</span>
              <span class="meta-val">${hw.recipient || subject.assistant?.name || "學藝股長"}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">📊 繳交進度</span>
              <span class="meta-val">${submittedCount} / ${totalSeats - excusedCount} 人 (${submitRate}%)</span>
            </div>
          </div>

          <!-- 進度條 -->
          <div class="progress-bar-container">
            <div class="progress-bar-fill ${submitRate === 100 ? "progress-full" : ""}" style="width: ${submitRate}%;"></div>
          </div>

          <!-- 快速座號點選盤 -->
          <div class="seat-matrix-wrapper">
            <div class="matrix-header">
              <div class="matrix-title">
                <span>座號點名盤 (點擊切換狀態：已交 ➔ 未交 ➔ 補交 ➔ 請假)</span>
              </div>
              <div class="matrix-quick-actions">
                <button class="btn-text-action btn-quick-all" data-hw-id="${hw.id}" data-action="all-submitted" title="全部標為已交">全部繳齊</button>
                <button class="btn-text-action btn-quick-all" data-hw-id="${hw.id}" data-action="clear-unsubmitted" title="清空缺交">清空未交</button>
              </div>
            </div>

            <div class="seat-grid">
              ${seatChipsHTML}
            </div>

            <div class="matrix-legend">
              <span class="legend-item"><span class="legend-dot dot-submitted"></span> 已交 (${submittedCount})</span>
              <span class="legend-item"><span class="legend-dot dot-unsubmitted"></span> 缺交 (${missingCount})</span>
              <span class="legend-item"><span class="legend-dot dot-makeup"></span> 補交 (${makeupCount})</span>
              <span class="legend-item"><span class="legend-dot dot-excused"></span> 請假 (${excusedCount})</span>
            </div>
          </div>

          <!-- 缺交名單與催繳快捷 -->
          <div class="hw-summary-box ${missingCount > 0 ? "has-missing" : "all-clear"}">
            <div class="summary-text">
              <strong>🚨 缺交座號：</strong>
              <span class="missing-seats-highlight">${missingSeatsList}</span>
              ${makeupSeatsList}
            </div>
            <button class="btn-primary-action btn-copy-reminder" data-hw-id="${hw.id}" title="複製 LINE 催繳格式">
              📋 一鍵複製催繳訊息
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // 批次操作
  batchSeatAction(hwId, action) {
    const hw = store.getHomework(hwId);
    if (!hw) return;

    if (action === "all-submitted") {
      hw.unsubmitted = [];
      hw.makeup = [];
      hw.status = "completed";
      sound.playSuccess();
      window.app.showToast("已將全班標記為已繳交！🎉", "success");
    } else if (action === "clear-unsubmitted") {
      hw.unsubmitted = [];
      sound.playClick("toggle");
      window.app.showToast("已清空未交名單", "info");
    }
    store.saveHomework(hw);
  },

  // 生成並複製 LINE 班群催繳文字
  copyLineReminder(hwId) {
    const hw = store.getHomework(hwId);
    if (!hw) return;

    const subject = store.getSubject(hw.subjectId);
    const unsubmitted = hw.unsubmitted || [];
    const makeup = hw.makeup || [];
    const className = store.getState("classInfo").name || "資處一仁";

    let message = `📢【${className} 作業催繳通知】\n`;
    message += `📚 科目：${subject.name}\n`;
    message += `📝 項目：${hw.title}\n`;
    message += `⏰ 截止時間：${hw.dueDate || "盡速繳交"}\n`;
    message += `👤 繳交對象：${hw.recipient || subject.assistant?.name || "小老師"}\n`;
    message += `----------------------------\n`;

    if (unsubmitted.length === 0 && makeup.length === 0) {
      message += `🎉 太棒了！全班作業已全數繳齊，感謝大家配合！`;
    } else {
      if (unsubmitted.length > 0) {
        message += `❌ 尚未繳交座號（${unsubmitted.length}人）：\n👉 ${unsubmitted.join(", ")} 號\n`;
      }
      if (makeup.length > 0) {
        message += `🔄 已補交座號：${makeup.join(", ")} 號\n`;
      }
      message += `----------------------------\n`;
      message += `⚠️ 請以上同學儘速完成並於明日早自習前交齊，避免影響平時成績！謝謝大家 🙏`;
    }

    navigator.clipboard.writeText(message).then(() => {
      sound.playSuccess();
      window.app.showToast("✅ 已成功複製 LINE 催繳訊息到剪貼簿！可直接貼到班群", "success");
    }).catch(err => {
      console.error("Copy failed", err);
      // Fallback
      prompt("請複製以下催繳訊息：", message);
    });
  },

  // 開啟新增/編輯作業 Modal
  openHomeworkModal(hwId = null) {
    this.activeModalHwId = hwId;
    const modal = document.getElementById("homeworkModal");
    const modalTitle = document.getElementById("homeworkModalTitle");
    const form = document.getElementById("homeworkForm");
    const subjectSelect = document.getElementById("hwSubject");

    // 填充科目選單
    const subjects = store.getState("subjects") || [];
    subjectSelect.innerHTML = subjects.map(s => `
      <option value="${s.id}">${s.icon} ${s.name} (任課：${s.teacher})</option>
    `).join("");

    if (hwId) {
      const hw = store.getHomework(hwId);
      if (hw) {
        modalTitle.textContent = "編輯作業內容";
        form.hwTitle.value = hw.title;
        form.hwSubject.value = hw.subjectId;
        form.hwType.value = hw.type || "workbook";
        form.hwDueDate.value = hw.dueDate || "";
        form.hwRecipient.value = hw.recipient || "";
        form.hwDesc.value = hw.description || "";
      }
    } else {
      modalTitle.textContent = "新增作業項目";
      form.reset();
      // 預設日期為 3 天後
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 3);
      form.hwDueDate.value = defaultDue.toISOString().split("T")[0];
      form.hwRecipient.value = "各科小老師";
    }

    modal.classList.add("is-active");
    sound.playClick("pop");
  },

  closeModal() {
    const modal = document.getElementById("homeworkModal");
    if (modal) modal.classList.remove("is-active");
    this.activeModalHwId = null;
  },

  handleSaveHomework() {
    const form = document.getElementById("homeworkForm");
    const title = form.hwTitle.value.trim();
    if (!title) {
      window.app.showToast("請輸入作業名稱", "warning");
      return;
    }

    const subjectId = form.hwSubject.value;
    const type = form.hwType.value;
    const typeLabelMap = {
      workbook: "習作本",
      handout: "講義作業",
      project: "程式上機",
      report: "專題報告",
      quiz_review: "考卷訂正",
      other: "其他作業"
    };

    let hwData;
    if (this.activeModalHwId) {
      hwData = store.getHomework(this.activeModalHwId);
      if (hwData) {
        hwData.title = title;
        hwData.subjectId = subjectId;
        hwData.type = type;
        hwData.typeLabel = typeLabelMap[type] || "一般作業";
        hwData.dueDate = form.hwDueDate.value;
        hwData.recipient = form.hwRecipient.value.trim();
        hwData.description = form.hwDesc.value.trim();
      }
    } else {
      hwData = {
        id: "hw-" + Date.now(),
        title,
        subjectId,
        type,
        typeLabel: typeLabelMap[type] || "一般作業",
        assignedDate: new Date().toISOString().split("T")[0],
        dueDate: form.hwDueDate.value,
        recipient: form.hwRecipient.value.trim() || "小老師",
        description: form.hwDesc.value.trim(),
        status: "active",
        unsubmitted: [],
        makeup: [],
        excused: []
      };
    }

    store.saveHomework(hwData);
    this.closeModal();
    sound.playSuccess();
    window.app.showToast(this.activeModalHwId ? "作業更新成功！" : "新增作業成功！", "success");
  },

  updateQuickSummary() {
    const hws = store.getState("homeworks") || [];
    const activeHws = hws.filter(h => h.status !== "completed");
    let totalMissing = 0;
    activeHws.forEach(h => {
      totalMissing += (h.unsubmitted || []).length;
    });

    const statBadge = document.getElementById("quickHwBadge");
    if (statBadge) {
      statBadge.textContent = `${activeHws.length} 項進行中 / ${totalMissing} 人次缺交`;
    }
  }
};

window.HomeworkModule = HomeworkModule;
