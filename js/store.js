/**
 * 資處一仁學藝 - 資料狀態管理層 (State Store)
 * 封裝 LocalStorage，提供事件發布與訂閱機制、備份匯出與匯入功能
 */

class AppStore {
  constructor() {
    this.STORAGE_KEY = "xueyi_manager_data_v2";
    this.listeners = new Map();
    this.state = this.loadState();
  }

  // 讀取儲存資料，若無則載入預設資料
  loadState() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // 合併預設結構以防版本欄位缺失
        return {
          ...DEFAULT_DATA,
          ...parsed,
          classInfo: { ...DEFAULT_DATA.classInfo, ...(parsed.classInfo || {}) },
          dailyLog: { ...DEFAULT_DATA.dailyLog, ...(parsed.dailyLog || {}) }
        };
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  // 儲存狀態並通知所有訂閱者
  saveState(triggerEvent = true) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
      if (triggerEvent) {
        this.emit("state_changed", this.state);
      }
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }

  // 取得完整狀態或指定鍵
  getState(key = null) {
    if (key) {
      return this.state[key];
    }
    return this.state;
  }

  // 更新特定區塊狀態
  update(key, partialData) {
    if (Array.isArray(this.state[key])) {
      this.state[key] = partialData;
    } else if (typeof this.state[key] === "object" && this.state[key] !== null) {
      this.state[key] = { ...this.state[key], ...partialData };
    } else {
      this.state[key] = partialData;
    }
    this.saveState();
    this.emit(`${key}_updated`, this.state[key]);
  }

  // 事件監聽
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  // 取消監聽
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event).filter(cb => cb !== callback);
    this.listeners.set(event, list);
  }

  // 觸發事件
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in event listener for ${event}:`, err);
        }
      });
    }
  }

  // --- 作業模組專用操作 ---
  getHomework(id) {
    return (this.state.homeworks || []).find(h => h.id === id);
  }

  saveHomework(hw) {
    const list = this.state.homeworks || [];
    const index = list.findIndex(h => h.id === hw.id);
    if (index >= 0) {
      list[index] = hw;
    } else {
      list.unshift(hw);
    }
    this.state.homeworks = list;
    this.saveState();
    this.emit("homeworks_updated", this.state.homeworks);
  }

  deleteHomework(id) {
    this.state.homeworks = (this.state.homeworks || []).filter(h => h.id !== id);
    this.saveState();
    this.emit("homeworks_updated", this.state.homeworks);
  }

  toggleSeatSubmission(hwId, seatNumber) {
    const hw = this.getHomework(hwId);
    if (!hw) return null;

    hw.unsubmitted = hw.unsubmitted || [];
    hw.makeup = hw.makeup || [];
    hw.excused = hw.excused || [];

    const seat = parseInt(seatNumber, 10);
    const unIndex = hw.unsubmitted.indexOf(seat);
    const mkIndex = hw.makeup.indexOf(seat);
    const exIndex = hw.excused.indexOf(seat);

    // 狀態輪轉：已交 (無名單) -> 未交 (unsubmitted) -> 補交 (makeup) -> 請假 (excused) -> 已交
    let newStatus = "submitted";
    if (unIndex >= 0) {
      // 從未交轉為補交
      hw.unsubmitted.splice(unIndex, 1);
      hw.makeup.push(seat);
      newStatus = "makeup";
    } else if (mkIndex >= 0) {
      // 從補交轉為請假
      hw.makeup.splice(mkIndex, 1);
      hw.excused.push(seat);
      newStatus = "excused";
    } else if (exIndex >= 0) {
      // 從請假轉為已交 (清空)
      hw.excused.splice(exIndex, 1);
      newStatus = "submitted";
    } else {
      // 從已交轉為未交
      hw.unsubmitted.push(seat);
      newStatus = "unsubmitted";
    }

    // 排序
    hw.unsubmitted.sort((a, b) => a - b);
    hw.makeup.sort((a, b) => a - b);
    hw.excused.sort((a, b) => a - b);

    // 檢查是否全數繳齊
    if (hw.unsubmitted.length === 0 && hw.makeup.length === 0) {
      hw.status = "completed";
    } else {
      hw.status = "active";
    }

    this.saveHomework(hw);
    return { hw, seat, newStatus };
  }

  // --- 學生座號對應 ---
  getStudent(seat) {
    const sNum = parseInt(seat, 10);
    return (this.state.roster || []).find(s => s.seat === sNum) || { seat: sNum, name: `${sNum}號` };
  }

  // --- 科目資訊 ---
  getSubject(id) {
    return (this.state.subjects || []).find(s => s.id === id) || { id, name: id, color: "#6366f1", icon: "📚" };
  }

  // --- 匯出與匯入 ---
  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const downloadAnchor = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `資處一仁學藝管理備份_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.classInfo && parsed.subjects) {
        this.state = parsed;
        this.saveState();
        this.emit("state_changed", this.state);
        return true;
      }
      throw new Error("無效的資料格式");
    } catch (e) {
      console.error("Import failed:", e);
      throw e;
    }
  }

  resetToDefaults() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.saveState();
    this.emit("state_changed", this.state);
  }
}

const store = new AppStore();
window.store = store;
