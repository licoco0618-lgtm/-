/**
 * 資處一仁學藝 - 黑板每日一句與壁報競賽專區 (Quotes & Bulletin Module)
 * 包含：隨機抽金句、黑板粉筆風即時展示、金句新增庫、教室佈置與壁報競賽進度
 */

const QuotesModule = {
  currentQuoteIdx: 0,

  init() {
    this.renderCurrentQuoteCard();
    this.renderQuotesList();
    this.renderBulletinTasks();
    this.bindEvents();

    store.on("quotes_updated", () => {
      this.renderQuotesList();
    });
    store.on("bulletinTasks_updated", () => {
      this.renderBulletinTasks();
    });
  },

  bindEvents() {
    // 抽下一句
    const nextBtn = document.getElementById("btnNextQuote");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.nextRandomQuote();
      });
    }

    // 複製金句
    const copyBtn = document.getElementById("btnCopyQuote");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        this.copyCurrentQuote();
      });
    }

    // 設為今日黑板金句
    const setDailyBtn = document.getElementById("btnSetAsDailyQuote");
    if (setDailyBtn) {
      setDailyBtn.addEventListener("click", () => {
        this.setAsDailyQuote();
      });
    }

    // 新增金句表單
    const quoteForm = document.getElementById("addQuoteForm");
    if (quoteForm) {
      quoteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddQuote();
      });
    }

    // 新增壁報任務
    const btnAddTask = document.getElementById("btnAddBulletinTask");
    if (btnAddTask) {
      btnAddTask.addEventListener("click", () => {
        this.openBulletinTaskModal();
      });
    }

    const taskForm = document.getElementById("bulletinTaskForm");
    if (taskForm) {
      taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSaveBulletinTask();
      });
    }
  },

  renderCurrentQuoteCard() {
    const quotes = store.getState("quotes") || [];
    if (quotes.length === 0) return;

    const quote = quotes[this.currentQuoteIdx % quotes.length];
    const textEl = document.getElementById("chalkboardQuoteText");
    const authorEl = document.getElementById("chalkboardQuoteAuthor");
    const categoryEl = document.getElementById("chalkboardQuoteCategory");

    if (textEl) textEl.textContent = `「${quote.text}」`;
    if (authorEl) authorEl.textContent = `—— ${quote.author || "資處一仁學藝"}`;
    if (categoryEl) categoryEl.textContent = quote.category || "每日勵志";
  },

  nextRandomQuote() {
    const quotes = store.getState("quotes") || [];
    if (quotes.length <= 1) return;

    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * quotes.length);
    } while (nextIdx === this.currentQuoteIdx);

    this.currentQuoteIdx = nextIdx;
    sound.playClick("pop");
    this.renderCurrentQuoteCard();
  },

  copyCurrentQuote() {
    const quotes = store.getState("quotes") || [];
    const quote = quotes[this.currentQuoteIdx % quotes.length];
    if (!quote) return;

    const str = `✨【今日黑板每日一句】\n「${quote.text}」—— ${quote.author || "學藝每日精選"}`;
    navigator.clipboard.writeText(str).then(() => {
      sound.playSuccess();
      window.app.showToast("金句已複製到剪貼簿！", "success");
    });
  },

  setAsDailyQuote() {
    const quotes = store.getState("quotes") || [];
    const quote = quotes[this.currentQuoteIdx % quotes.length];
    if (!quote) return;

    const dailyLog = store.getState("dailyLog") || {};
    dailyLog.todayQuote = quote.text;
    store.update("dailyLog", dailyLog);

    sound.playSuccess();
    window.app.showToast("已成功將此句設為「今日聯絡簿與教室日誌」黑板金句！", "success");
  },

  renderQuotesList() {
    const container = document.getElementById("quotesTableBody");
    if (!container) return;

    const quotes = store.getState("quotes") || [];
    container.innerHTML = quotes.map((q, idx) => `
      <tr>
        <td><span class="category-tag">${q.category || "語錄"}</span></td>
        <td class="quote-text-col">「${q.text}」</td>
        <td>${q.author || "佚名"}</td>
        <td class="actions-col">
          <button class="btn-text-action btn-pick-quote" data-idx="${idx}">套用</button>
          <button class="icon-btn btn-del-quote" data-idx="${idx}" title="刪除">🗑️</button>
        </td>
      </tr>
    `).join("");

    container.querySelectorAll(".btn-pick-quote").forEach(btn => {
      btn.addEventListener("click", () => {
        this.currentQuoteIdx = parseInt(btn.dataset.idx, 10);
        this.renderCurrentQuoteCard();
        sound.playClick("pop");
        window.app.showToast("已套用至黑板預覽！", "info");
      });
    });

    container.querySelectorAll(".btn-del-quote").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const quotes = store.getState("quotes");
        quotes.splice(idx, 1);
        store.update("quotes", quotes);
        sound.playClick("toggle");
      });
    });
  },

  handleAddQuote() {
    const textInput = document.getElementById("newQuoteText");
    const authorInput = document.getElementById("newQuoteAuthor");
    const catInput = document.getElementById("newQuoteCategory");

    const text = textInput.value.trim();
    if (!text) return;

    const quotes = store.getState("quotes") || [];
    quotes.unshift({
      text,
      author: authorInput.value.trim() || "學藝精選",
      category: catInput.value.trim() || "自訂金句"
    });

    store.update("quotes", quotes);
    textInput.value = "";
    authorInput.value = "";

    this.currentQuoteIdx = 0;
    this.renderCurrentQuoteCard();
    sound.playSuccess();
    window.app.showToast("成功加入黑板金句庫！", "success");
  },

  renderBulletinTasks() {
    const container = document.getElementById("bulletinTasksContainer");
    if (!container) return;

    const tasks = store.getState("bulletinTasks") || [];
    if (tasks.length === 0) {
      container.innerHTML = `<div class="empty-hint">目前無進行中的壁報或教室佈置任務</div>`;
      return;
    }

    container.innerHTML = tasks.map(t => `
      <div class="task-card glass-panel">
        <div class="task-header">
          <h4>${t.title}</h4>
          <span class="task-deadline">📅 截止：${t.deadline}</span>
        </div>
        <div class="task-body">
          <p class="task-notes">${t.notes || "無特別備註"}</p>
          <div class="task-meta">
            <span>負責人：<strong>${t.leader}</strong></span>
            <span>進度：<strong>${t.progress}%</strong></span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${t.progress}%;"></div>
          </div>
        </div>
      </div>
    `).join("");
  },

  openBulletinTaskModal() {
    const modal = document.getElementById("bulletinTaskModal");
    if (modal) modal.classList.add("is-active");
  },

  handleSaveBulletinTask() {
    const form = document.getElementById("bulletinTaskForm");
    const title = form.taskTitle.value.trim();
    if (!title) return;

    const tasks = store.getState("bulletinTasks") || [];
    tasks.push({
      id: "bt-" + Date.now(),
      title,
      deadline: form.taskDeadline.value,
      progress: parseInt(form.taskProgress.value, 10) || 0,
      leader: form.taskLeader.value.trim() || "學藝股長",
      notes: form.taskNotes.value.trim()
    });

    store.update("bulletinTasks", tasks);
    document.getElementById("bulletinTaskModal").classList.remove("is-active");
    sound.playSuccess();
    window.app.showToast("已建立佈置與競賽任務！", "success");
  }
};

window.QuotesModule = QuotesModule;
