/**
 * 資處一仁學藝 - 主應用程式核心 (App Controller)
 * 負責全域導航切換、主題更換、即時時鐘、Toast 通知、鍵盤快捷鍵與初始化
 */

class AcademicApp {
  constructor() {
    this.currentTab = "dashboard";
    this.theme = localStorage.getItem("app_theme") || "dark";
  }

  init() {
    this.applyTheme(this.theme);
    this.startClock();
    this.bindGlobalEvents();
    this.updateHeaderBranding();

    // 初始化各子模組
    if (window.HomeworkModule) window.HomeworkModule.init();
    if (window.DailyLogModule) window.DailyLogModule.init();
    if (window.ExamsModule) window.ExamsModule.init();
    if (window.ScheduleModule) window.ScheduleModule.init();
    if (window.QuotesModule) window.QuotesModule.init();
    if (window.RosterModule) window.RosterModule.init();

    // 監聽全域資料異動
    store.on("state_changed", () => {
      this.updateHeaderBranding();
      this.updateDashboardQuickStats();
    });

    this.updateDashboardQuickStats();
    console.log("資處一仁學藝 管理系統初始化完成 🚀");
  }

  // 即時時鐘與日期更新
  startClock() {
    const clockEl = document.getElementById("headerLiveClock");
    const dateEl = document.getElementById("headerLiveDate");
    const weekEl = document.getElementById("headerWeekBadge");

    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("zh-TW", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const dayNames = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
      const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 (${dayNames[now.getDay()]})`;

      if (clockEl) clockEl.textContent = timeStr;
      if (dateEl) dateEl.textContent = dateStr;
      
      // 計算學期週次 (估算)
      if (weekEl) {
        weekEl.textContent = "第 3 週";
      }
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  // 頂端標題與班級資訊
  updateHeaderBranding() {
    const classInfo = store.getState("classInfo") || DEFAULT_DATA.classInfo;
    const titleEl = document.getElementById("appMainTitle");
    const subTitleEl = document.getElementById("appSubTitle");
    const cadreEl = document.getElementById("headerCadreName");

    if (titleEl) titleEl.textContent = `${classInfo.name}學藝`;
    if (subTitleEl) subTitleEl.textContent = `${classInfo.school || '智光商工'} ${classInfo.fullName} • 導師：${classInfo.cadre?.teacher || '翁偉倬'}`;
    if (cadreEl) cadreEl.textContent = `導師：${classInfo.cadre?.teacher || '翁偉倬'}`;
  }

  // 全域事件監聽
  bindGlobalEvents() {
    // 導覽標籤切換
    document.querySelectorAll(".nav-tab-item").forEach(item => {
      item.addEventListener("click", (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // 主題切換按鈕
    const themeBtn = document.getElementById("btnToggleTheme");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const newTheme = this.theme === "dark" ? "light" : "dark";
        this.applyTheme(newTheme);
        sound.playClick("pop");
      });
    }

    // 音效開關按鈕
    const soundBtn = document.getElementById("btnToggleSound");
    if (soundBtn) {
      this.updateSoundBtnUI();
      soundBtn.addEventListener("click", () => {
        const enabled = sound.toggleSound();
        this.updateSoundBtnUI();
        this.showToast(enabled ? "音效已開啟 🔊" : "音效已靜音 🔇", "info");
      });
    }

    // 關閉所有 Modal
    document.querySelectorAll(".modal-close-btn, .modal-backdrop").forEach(el => {
      el.addEventListener("click", (e) => {
        if (e.target === el) {
          document.querySelectorAll(".modal-overlay.is-active").forEach(m => m.classList.remove("is-active"));
          sound.playClick("toggle");
        }
      });
    });

    // 鍵盤快捷鍵
    window.addEventListener("keydown", (e) => {
      // ESC 關閉 Modal
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.is-active").forEach(m => m.classList.remove("is-active"));
      }
      // Alt + 1~6 切換分頁 (僅在非輸入框時)
      if (e.altKey && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        const tabs = ["dashboard", "homework", "exams", "schedule", "quotes", "roster"];
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 6) {
          e.preventDefault();
          this.switchTab(tabs[num - 1]);
        }
      }
    });
  }

  updateSoundBtnUI() {
    const soundBtn = document.getElementById("btnToggleSound");
    if (!soundBtn) return;
    const isEnabled = sound.isEnabled();
    soundBtn.innerHTML = isEnabled ? "🔊" : "🔇";
    soundBtn.title = isEnabled ? "音效回饋：已開啟 (點擊靜音)" : "音效回饋：已靜音 (點擊開啟)";
  }

  // 切換分頁
  switchTab(tabId) {
    this.currentTab = tabId;
    sound.playClick("normal");

    // 更新導覽列高亮
    document.querySelectorAll(".nav-tab-item").forEach(item => {
      if (item.dataset.tab === tabId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // 更新視圖顯示
    document.querySelectorAll(".view-section").forEach(view => {
      if (view.id === `view-${tabId}`) {
        view.classList.add("active-view");
      } else {
        view.classList.remove("active-view");
      }
    });

    // 自動滾動至頂
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 主題切換
  applyTheme(theme) {
    this.theme = theme;
    localStorage.setItem("app_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);

    const themeBtn = document.getElementById("btnToggleTheme");
    if (themeBtn) {
      themeBtn.innerHTML = theme === "dark" ? "🌙" : "☀️";
      themeBtn.title = theme === "dark" ? "切換至淺色亮麗模式" : "切換至深色科技模式";
    }
  }

  // 首頁儀表板快速摘要統計
  updateDashboardQuickStats() {
    const homeworks = store.getState("homeworks") || [];
    const activeHws = homeworks.filter(h => h.status !== "completed");
    let totalMissing = 0;
    activeHws.forEach(h => {
      totalMissing += (h.unsubmitted || []).length;
    });

    const exams = store.getState("exams") || [];
    const nextExam = exams.length > 0 ? exams[0] : null;

    const hwCountEl = document.getElementById("dashHwCount");
    const missingCountEl = document.getElementById("dashMissingCount");
    const examDaysEl = document.getElementById("dashExamDays");

    if (hwCountEl) hwCountEl.textContent = `${activeHws.length} 項`;
    if (missingCountEl) missingCountEl.textContent = `${totalMissing} 人次`;

    if (examDaysEl && nextExam) {
      const days = window.ExamsModule ? window.ExamsModule.calculateDaysRemaining(nextExam.startDate) : 0;
      examDaysEl.textContent = days >= 0 ? `${days} 天 (${nextExam.typeLabel})` : "已結束";
    }
  }

  // 全域 Toast 通知
  showToast(message, type = "info", duration = 3000) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `app-toast toast-${type} animate-slide-in`;

    const iconMap = {
      success: "✅",
      warning: "⚠️",
      danger: "❌",
      info: "💡"
    };

    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || "🔔"}</span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("animate-fade-out");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// 實例化並綁定到全域
const app = new AcademicApp();
window.app = app;

// 頁面載入完成後啟動
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
