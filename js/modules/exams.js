/**
 * 資處一仁學藝 - 考試排程與倒數計時模組 (Exams Module)
 * 包含：段考/小考倒數計算、範圍與注意事項清單、新增/編輯測驗
 */

const ExamsModule = {
  activeExamId: null,

  init() {
    this.renderExamsList();
    this.bindEvents();

    store.on("exams_updated", () => {
      this.renderExamsList();
    });
  },

  bindEvents() {
    const addExamBtn = document.getElementById("btnAddExam");
    if (addExamBtn) {
      addExamBtn.addEventListener("click", () => {
        this.openExamModal();
      });
    }

    const form = document.getElementById("examForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSaveExam();
      });
    }
  },

  calculateDaysRemaining(targetDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  renderExamsList() {
    const container = document.getElementById("examsListContainer");
    if (!container) return;

    const exams = store.getState("exams") || [];

    if (exams.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card glass-panel">
          <div class="empty-icon">☕</div>
          <h3>目前無任何考試排程</h3>
          <p>太棒了！近期沒有測驗，或者點擊「+ 新增測驗」登記段考或小考。</p>
        </div>
      `;
      return;
    }

    // 依日期排序
    const sorted = [...exams].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    container.innerHTML = sorted.map(exam => this.createExamCardHTML(exam)).join("");

    // 綁定編輯與刪除
    container.querySelectorAll(".btn-edit-exam").forEach(btn => {
      btn.addEventListener("click", () => {
        this.openExamModal(btn.dataset.examId);
      });
    });

    container.querySelectorAll(".btn-delete-exam").forEach(btn => {
      btn.addEventListener("click", () => {
        if (confirm("確定要刪除這筆考試排程嗎？")) {
          sound.playClick("pop");
          const list = store.getState("exams").filter(e => e.id !== btn.dataset.examId);
          store.update("exams", list);
          window.app.showToast("已刪除考試排程", "info");
        }
      });
    });
  },

  createExamCardHTML(exam) {
    const daysLeft = this.calculateDaysRemaining(exam.startDate);

    let countdownBadge = "";
    let urgentClass = "";

    if (daysLeft < 0) {
      countdownBadge = `<span class="countdown-tag tag-passed">已結束</span>`;
    } else if (daysLeft === 0) {
      countdownBadge = `<span class="countdown-tag tag-today animate-pulse">🔥 就是今天！</span>`;
      urgentClass = "is-urgent";
    } else if (daysLeft === 1) {
      countdownBadge = `<span class="countdown-tag tag-tomorrow animate-pulse">⚡ 明天考試！</span>`;
      urgentClass = "is-urgent";
    } else if (daysLeft <= 3) {
      countdownBadge = `<span class="countdown-tag tag-soon">⚠️ 倒數 ${daysLeft} 天</span>`;
      urgentClass = "is-soon";
    } else {
      countdownBadge = `<span class="countdown-tag tag-normal">⏳ 倒數 ${daysLeft} 天</span>`;
    }

    const isMajor = exam.type === "major";

    // 範圍清單
    const scopesHTML = (exam.scope || []).map(sc => {
      const subj = store.getSubject(sc.subjectId);
      return `
        <div class="scope-row">
          <span class="scope-subj" style="border-left: 3px solid ${subj.color};">
            ${subj.icon} ${subj.name}
          </span>
          <span class="scope-text">${sc.text}</span>
        </div>
      `;
    }).join("");

    return `
      <div class="exam-card glass-panel ${urgentClass} ${isMajor ? 'is-major-exam' : ''}">
        <div class="exam-card-header">
          <div class="exam-header-left">
            <span class="exam-type-badge ${isMajor ? 'badge-major' : 'badge-quiz'}">${exam.typeLabel || "測驗"}</span>
            <h3 class="exam-title">${exam.title}</h3>
          </div>
          <div class="exam-header-right">
            ${countdownBadge}
            <button class="icon-btn btn-edit-exam" data-exam-id="${exam.id}" title="編輯">✏️</button>
            <button class="icon-btn btn-delete-exam" data-exam-id="${exam.id}" title="刪除">🗑️</button>
          </div>
        </div>

        <div class="exam-card-body">
          <div class="exam-date-row">
            <span class="date-icon">📅</span>
            <strong>考試日期：</strong>
            <span>${exam.startDate} ${exam.endDate && exam.endDate !== exam.startDate ? `~ ${exam.endDate}` : ''}</span>
          </div>

          ${scopesHTML ? `
            <div class="exam-scopes-box">
              <div class="scope-title">📖 考試範圍詳情：</div>
              <div class="scopes-grid">
                ${scopesHTML}
              </div>
            </div>
          ` : ''}

          ${exam.notes ? `
            <div class="exam-notes-box">
              <span class="note-label">💡 學藝/小老師注意事項：</span>
              <p class="note-content">${exam.notes}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  openExamModal(examId = null) {
    this.activeExamId = examId;
    const modal = document.getElementById("examModal");
    const title = document.getElementById("examModalTitle");
    const form = document.getElementById("examForm");

    if (examId) {
      const exams = store.getState("exams") || [];
      const exam = exams.find(e => e.id === examId);
      if (exam) {
        title.textContent = "編輯測驗與段考";
        form.examTitle.value = exam.title;
        form.examType.value = exam.type;
        form.examStartDate.value = exam.startDate;
        form.examEndDate.value = exam.endDate || exam.startDate;
        form.examNotes.value = exam.notes || "";
        form.examScopeRaw.value = (exam.scope || []).map(s => `${s.subjectId}: ${s.text}`).join("\n");
      }
    } else {
      title.textContent = "新增測驗 / 段考排程";
      form.reset();
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      form.examStartDate.value = defaultDate.toISOString().split("T")[0];
      form.examEndDate.value = defaultDate.toISOString().split("T")[0];
      form.examScopeRaw.value = "acc: 第二章 借貸分錄\nprog: 單元 1~3 基礎語法";
    }

    modal.classList.add("is-active");
    sound.playClick("pop");
  },

  closeModal() {
    const modal = document.getElementById("examModal");
    if (modal) modal.classList.remove("is-active");
    this.activeExamId = null;
  },

  handleSaveExam() {
    const form = document.getElementById("examForm");
    const title = form.examTitle.value.trim();
    if (!title) {
      window.app.showToast("請輸入考試名稱", "warning");
      return;
    }

    const type = form.examType.value;
    const typeLabelMap = {
      major: "段考定期評量",
      quiz: "隨堂小考",
      mock: "模擬考",
      weekly: "每週測驗"
    };

    // 解析考試範圍
    const scopeRaw = form.examScopeRaw.value.trim();
    const scope = [];
    if (scopeRaw) {
      scopeRaw.split("\n").forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(":");
        if (parts.length >= 2) {
          const sId = parts[0].trim().toLowerCase();
          const sText = parts.slice(1).join(":").trim();
          scope.push({ subjectId: sId, text: sText });
        } else {
          scope.push({ subjectId: "acc", text: line.trim() });
        }
      });
    }

    const exams = store.getState("exams") || [];
    if (this.activeExamId) {
      const idx = exams.findIndex(e => e.id === this.activeExamId);
      if (idx >= 0) {
        exams[idx].title = title;
        exams[idx].type = type;
        exams[idx].typeLabel = typeLabelMap[type] || "測驗";
        exams[idx].startDate = form.examStartDate.value;
        exams[idx].endDate = form.examEndDate.value;
        exams[idx].notes = form.examNotes.value.trim();
        exams[idx].scope = scope;
      }
    } else {
      exams.push({
        id: "ex-" + Date.now(),
        title,
        type,
        typeLabel: typeLabelMap[type] || "測驗",
        startDate: form.examStartDate.value,
        endDate: form.examEndDate.value,
        notes: form.examNotes.value.trim(),
        scope
      });
    }

    store.update("exams", exams);
    this.closeModal();
    sound.playSuccess();
    window.app.showToast(this.activeExamId ? "考試排程已更新！" : "新增考試成功！", "success");
  }
};

window.ExamsModule = ExamsModule;
