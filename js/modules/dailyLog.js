/**
 * 資處一仁學藝 - 每日聯絡簿與教室日誌模組 (Daily Log & Notice Module)
 * 包含：每日 8 節課進度填寫、一鍵帶入今日課表、一鍵生成 LINE 群通告、列印日誌輔助單
 */

const DailyLogModule = {
  init() {
    this.renderDailyLogForm();
    this.bindEvents();

    store.on("dailyLog_updated", () => {
      this.renderDailyLogForm();
    });
  },

  bindEvents() {
    // 一鍵帶入今日課表
    const autoFillBtn = document.getElementById("btnAutoFillSchedule");
    if (autoFillBtn) {
      autoFillBtn.addEventListener("click", () => {
        this.autoFillFromTodaySchedule();
      });
    }

    // 產生 LINE 班群廣播
    const generateLineBtn = document.getElementById("btnGenerateLineNotice");
    if (generateLineBtn) {
      generateLineBtn.addEventListener("click", () => {
        this.openLineNoticeModal();
      });
    }

    // 列印教室日誌
    const printLogBtn = document.getElementById("btnPrintDailyLog");
    if (printLogBtn) {
      printLogBtn.addEventListener("click", () => {
        sound.playClick("normal");
        window.print();
      });
    }

    // 儲存日誌內容
    const saveLogBtn = document.getElementById("btnSaveDailyLog");
    if (saveLogBtn) {
      saveLogBtn.addEventListener("click", () => {
        this.saveCurrentLog();
      });
    }
  },

  renderDailyLogForm() {
    const logData = store.getState("dailyLog") || DEFAULT_DATA.dailyLog;

    // 基本資料
    const dateInput = document.getElementById("logDate");
    const weatherInput = document.getElementById("logWeather");
    const absentInput = document.getElementById("logAbsent");
    const notesInput = document.getElementById("logNotes");

    if (dateInput) dateInput.value = logData.date || new Date().toISOString().split("T")[0];
    if (weatherInput) weatherInput.value = logData.weather || "☀️ 晴朗";
    if (absentInput) absentInput.value = logData.absentCount || "全班到齊";
    if (notesInput) notesInput.value = logData.notes || "";

    // 8 節課表格
    const tableBody = document.getElementById("dailyLogPeriodsBody");
    if (!tableBody) return;

    const periods = logData.periods || [];
    tableBody.innerHTML = periods.map((p, idx) => `
      <tr class="log-period-row" data-period="${p.period}">
        <td class="period-num">第 ${p.period} 節</td>
        <td>
          <input type="text" class="input-table input-subject" value="${p.subjectName || ''}" placeholder="科目名稱" data-field="subjectName" data-idx="${idx}">
        </td>
        <td>
          <input type="text" class="input-table input-teacher" value="${p.teacher || ''}" placeholder="任課老師" data-field="teacher" data-idx="${idx}">
        </td>
        <td>
          <input type="text" class="input-table input-progress" value="${p.progress || ''}" placeholder="教學進度與章節" data-field="progress" data-idx="${idx}">
        </td>
        <td>
          <input type="text" class="input-table input-homework" value="${p.homework || ''}" placeholder="交代作業" data-field="homework" data-idx="${idx}">
        </td>
        <td>
          <input type="text" class="input-table input-quiz" value="${p.quiz || ''}" placeholder="測驗項目" data-field="quiz" data-idx="${idx}">
        </td>
        <td>
          <input type="text" class="input-table input-discipline" value="${p.discipline || '良好'}" placeholder="上課秩序" data-field="discipline" data-idx="${idx}">
        </td>
      </tr>
    `).join("");

    // 綁定輸入時自動更新
    tableBody.querySelectorAll("input").forEach(input => {
      input.addEventListener("change", () => {
        this.saveCurrentLog(false); // 靜默儲存
      });
    });
  },

  // 自動抓取今日（或指定日期）的課表預填
  autoFillFromTodaySchedule() {
    const today = new Date();
    let dayOfWeek = today.getDay(); // 0 是週日, 1 是週一...
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      dayOfWeek = 1; // 週末預設帶入週一課表
    }

    const schedule = store.getState("schedule");
    const daySchedule = schedule[dayOfWeek] || [];
    const subjects = store.getState("subjects") || [];

    const currentLog = store.getState("dailyLog") || {};
    const newPeriods = [];

    for (let p = 1; p <= 7; p++) {
      const match = daySchedule.find(item => item.period === p);
      if (match) {
        const subjObj = subjects.find(s => s.id === match.subjectId) || { name: match.subjectId, teacher: match.teacher || "" };
        newPeriods.push({
          period: p,
          subjectName: subjObj.name,
          teacher: match.teacher || subjObj.teacher || "",
          progress: match.note || "",
          homework: "無",
          quiz: "無",
          discipline: "良好"
        });
      } else {
        newPeriods.push({
          period: p,
          subjectName: "",
          teacher: "",
          progress: "",
          homework: "無",
          quiz: "無",
          discipline: "良好"
        });
      }
    }

    currentLog.periods = newPeriods;
    store.update("dailyLog", currentLog);
    this.renderDailyLogForm();

    sound.playSuccess();
    window.app.showToast(`已成功載入週${['日','一','二','三','四','五','六'][dayOfWeek]}預設課表進度！`, "success");
  },

  // 儲存日誌
  saveCurrentLog(showToast = true) {
    const logData = {
      date: document.getElementById("logDate")?.value || new Date().toISOString().split("T")[0],
      weather: document.getElementById("logWeather")?.value || "☀️ 晴朗",
      absentCount: document.getElementById("logAbsent")?.value || "全班到齊",
      notes: document.getElementById("logNotes")?.value || "",
      periods: []
    };

    const rows = document.querySelectorAll(".log-period-row");
    rows.forEach(row => {
      const period = parseInt(row.dataset.period, 10);
      const subjectName = row.querySelector(".input-subject")?.value || "";
      const teacher = row.querySelector(".input-teacher")?.value || "";
      const progress = row.querySelector(".input-progress")?.value || "";
      const homework = row.querySelector(".input-homework")?.value || "";
      const quiz = row.querySelector(".input-quiz")?.value || "";
      const discipline = row.querySelector(".input-discipline")?.value || "良好";

      logData.periods.push({
        period,
        subjectName,
        teacher,
        progress,
        homework,
        quiz,
        discipline
      });
    });

    store.update("dailyLog", logData);
    if (showToast) {
      sound.playSuccess();
      window.app.showToast("教室日誌與聯絡簿已成功儲存！", "success");
    }
  },

  // 開啟 LINE 班群通知視窗
  openLineNoticeModal() {
    this.saveCurrentLog(false);

    const logData = store.getState("dailyLog");
    const classInfo = store.getState("classInfo");
    const homeworks = store.getState("homeworks") || [];
    const activeHws = homeworks.filter(h => h.status !== "completed");
    const exams = store.getState("exams") || [];

    // 計算明天的日期與星期
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
    const tomorrowDayOfWeek = tomorrow.getDay();
    const tomorrowStr = `${tomorrow.getMonth() + 1}/${tomorrow.getDate()} (週${dayNames[tomorrowDayOfWeek]})`;

    // 明日課表預覽
    const schedule = store.getState("schedule");
    const tomorrowSchedule = schedule[tomorrowDayOfWeek === 0 || tomorrowDayOfWeek === 6 ? 1 : tomorrowDayOfWeek] || [];
    const subjects = store.getState("subjects") || [];
    const tomorrowSubjectsText = tomorrowSchedule.map(item => {
      const subj = subjects.find(s => s.id === item.subjectId);
      return `第${item.period}節：${subj ? subj.name : item.subjectId}`;
    }).join(" | ");

    // 今日作業統整
    let hwText = "";
    if (activeHws.length === 0) {
      hwText = "✅ 目前無特別作業，請自主複習各科章節。";
    } else {
      hwText = activeHws.map((h, i) => {
        const subj = store.getSubject(h.subjectId);
        const missing = (h.unsubmitted || []).length;
        const missingHint = missing > 0 ? ` [⚠️ 缺交 ${missing} 人]` : ` [已繳齊]`;
        return `${i + 1}. 【${subj.name}】${h.title} (截止：${h.dueDate})${missingHint}`;
      }).join("\n");
    }

    // 近期小考與測驗
    let examText = "";
    if (exams.length === 0) {
      examText = "無近期排定測驗";
    } else {
      examText = exams.slice(0, 3).map((e, i) => {
        return `📌 ${e.title} (${e.startDate})`;
      }).join("\n");
    }

    // 組裝 LINE 格式訊息
    let message = `🔔【${classInfo.name} 每日班務聯絡簿】🔔\n`;
    message += `📅 日期：${logData.date || today.toISOString().split("T")[0]}\n`;
    message += `🌤️ 天氣：${logData.weather}\n`;
    message += `👥 出缺席：${logData.absentCount}\n`;
    message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📚【明日課表快速預覽 (${tomorrowStr})】\n`;
    message += `${tomorrowSubjectsText || "請參閱課表"}\n`;
    message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📝【今日交代作業與催繳】\n`;
    message += `${hwText}\n`;
    message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    message += `⏰【近期測驗與段考提醒】\n`;
    message += `${examText}\n`;
    message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📢【幹部與導師交代事項】\n`;
    message += `${logData.notes || "無特別叮嚀事項，放學請注意安全。"}\n`;
    message += `\n✨【今日黑板金句】\n`;
    message += `"${logData.todayQuote || "借貸必相等，人生亦有平衡。"}"\n`;
    message += `\n— ${classInfo.name} 學藝股長 關心您 ❤️ —`;

    // 填充至 Modal
    const modal = document.getElementById("lineNoticeModal");
    const textarea = document.getElementById("lineNoticeContent");
    if (textarea) textarea.value = message;
    if (modal) modal.classList.add("is-active");

    // 複製按鈕
    const copyBtn = document.getElementById("btnCopyLineNotice");
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(textarea.value).then(() => {
          sound.playSuccess();
          window.app.showToast("已成功複製完整 LINE 群公告！", "success");
        }).catch(() => {
          prompt("請手動複製以下訊息：", textarea.value);
        });
      };
    }
  }
};

window.DailyLogModule = DailyLogModule;
