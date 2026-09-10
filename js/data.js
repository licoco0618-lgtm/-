/**
 * 智光商工 115學年度 第1學期 資處一仁 課程表與班級資料庫
 * 依據智光商工資處一仁正式課表精準配置
 */

const DEFAULT_DATA = {
  // 班級基本資訊
  classInfo: {
    school: "智光商工",
    name: "資處一仁",
    fullName: "智光商工 資料處理科 一年仁班",
    schoolYear: "115學年度 第1學期",
    seatCount: 42,
    cadre: {
      academic: "陳學藝", // 學藝股長
      deputyAcademic: "林副學藝", // 副學藝
      leader: "張班長", // 班長
      teacher: "翁偉倬" // 導師（依課表填寫）
    }
  },

  // 115學年度 第1學期 智光商工資處一仁 科目與任課老師對照表
  subjects: [
    { id: "art", name: "美術", teacher: "黃浩軒", assistant: { seat: 35, name: "朱小藝" }, color: "#ec4899", icon: "🎨" },
    { id: "pe", name: "體育", teacher: "張鳴恩", assistant: { seat: 20, name: "周小體" }, color: "#14b8a6", icon: "⚽" },
    { id: "health", name: "健康與護理", teacher: "趙蕙芬", assistant: { seat: 8, name: "林小護" }, color: "#06b6d4", icon: "🩺" },
    { id: "physics", name: "物理", teacher: "劉仲平", assistant: { seat: 11, name: "吳小物" }, color: "#8b5cf6", icon: "⚡" },
    { id: "chi", name: "國語文", teacher: "游新欣", assistant: { seat: 15, name: "許小國" }, color: "#ef4444", icon: "📖" },
    { id: "defense", name: "全民國防教育", teacher: "蘇昱禾", assistant: { seat: 4, name: "趙小防" }, color: "#84cc16", icon: "🪖" },
    { id: "infotech", name: "資訊科技", teacher: "倪正平", room: "資處工場三", assistant: { seat: 12, name: "黃小訊" }, color: "#3b82f6", icon: "💻" },
    { id: "wordproc", name: "文書處理實習", teacher: "藍淑雯", room: "資處工場三", assistant: { seat: 18, name: "張小文" }, color: "#6366f1", icon: "⌨️" },
    { id: "taiwanese", name: "閩南語文", teacher: "黃佳樺", assistant: { seat: 21, name: "蘇小閩" }, color: "#f97316", icon: "🗣️" },
    { id: "acc", name: "會計學", teacher: "周櫻", assistant: { seat: 5, name: "李小會" }, color: "#3b82f6", icon: "📊" },
    { id: "digitech", name: "數位科技概論", teacher: "倪正平", room: "資處工場三", assistant: { seat: 12, name: "黃小電" }, color: "#0ea5e9", icon: "🖥️" },
    { id: "biz", name: "商業概論", teacher: "周櫻", assistant: { seat: 23, name: "楊小商" }, color: "#10b981", icon: "📈" },
    { id: "music", name: "音樂", teacher: "周永涵", room: "音樂教室", assistant: { seat: 30, name: "唐小音" }, color: "#d946ef", icon: "🎵" },
    { id: "math", name: "數學", teacher: "賴珮茹", assistant: { seat: 9, name: "孫小數" }, color: "#6366f1", icon: "📐" },
    { id: "life_edu", name: "生命教育概論", teacher: "洪世雍", assistant: { seat: 28, name: "錢小生" }, color: "#a855f7", icon: "🌱" },
    { id: "multimedia", name: "多媒體製作與應用", teacher: "翁偉倬", room: "資處工場三", assistant: { seat: 14, name: "鄭小媒" }, color: "#f43f5e", icon: "🎬" },
    { id: "eng", name: "英語文", teacher: "陳瑀潔", assistant: { seat: 31, name: "趙小英" }, color: "#fb7185", icon: "🔤" },
    { id: "activity", name: "聯課活動", teacher: "社團指導老師", assistant: { seat: 10, name: "周康樂" }, color: "#f59e0b", icon: "🎪" },
    { id: "class_meeting", name: "班週會", teacher: "翁偉倬", assistant: { seat: 1, name: "張班長" }, color: "#64748b", icon: "👥" }
  ],

  // 115學年度 第1學期 正式週一至週五 7 節課表
  schedule: {
    1: [ // 週一
      { period: 1, subjectId: "art", room: "班級教室", teacher: "黃浩軒", note: "自備繪圖用具" },
      { period: 2, subjectId: "pe", room: "運動場", teacher: "張鳴恩", note: "穿著體育服裝" },
      { period: 3, subjectId: "health", room: "班級教室", teacher: "趙蕙芬", note: "攜帶健護課本" },
      { period: 4, subjectId: "physics", room: "班級教室", teacher: "劉仲平", note: "物理基礎力學" },
      { period: 5, subjectId: "chi", room: "班級教室", teacher: "游新欣", note: "第一課課文研讀" },
      { period: 6, subjectId: "chi", room: "班級教室", teacher: "游新欣", note: "語文常識與國學" },
      { period: 7, subjectId: "defense", room: "班級教室", teacher: "蘇昱禾", note: "國防科技與安全" }
    ],
    2: [ // 週二
      { period: 1, subjectId: "infotech", room: "資處工場三", teacher: "倪正平", note: "資訊科技基礎架構" },
      { period: 2, subjectId: "wordproc", room: "資處工場三", teacher: "藍淑雯", note: "中文輸入與排版實作" },
      { period: 3, subjectId: "wordproc", room: "資處工場三", teacher: "藍淑雯", note: "文書處理排版技巧" },
      { period: 4, subjectId: "wordproc", room: "資處工場三", teacher: "藍淑雯", note: "上機速度檢定練習" },
      { period: 5, subjectId: "taiwanese", room: "班級教室", teacher: "黃佳樺", note: "閩南語日常會話" },
      { period: 6, subjectId: "acc", room: "班級教室", teacher: "周櫻", note: "第一章 會計基本概念" },
      { period: 7, subjectId: "acc", room: "班級教室", teacher: "周櫻", note: "借貸法則與分錄演練" }
    ],
    3: [ // 週三
      { period: 1, subjectId: "digitech", room: "資處工場三", teacher: "倪正平", note: "數位科技與現代生活" },
      { period: 2, subjectId: "digitech", room: "資處工場三", teacher: "倪正平", note: "電腦軟硬體元件解析" },
      { period: 3, subjectId: "biz", room: "班級教室", teacher: "周櫻", note: "商業型態與現代企業" },
      { period: 4, subjectId: "biz", room: "班級教室", teacher: "周櫻", note: "商業倫理與法規案例" },
      { period: 5, subjectId: "music", room: "音樂教室", teacher: "周永涵", note: "音樂欣賞與樂理" },
      { period: 6, subjectId: "pe", room: "排球場/活動中心", teacher: "張鳴恩", note: "球類運動基本技術" },
      { period: 7, subjectId: "math", room: "班級教室", teacher: "賴珮茹", note: "直線方程式與坐標系" }
    ],
    4: [ // 週四
      { period: 1, subjectId: "physics", room: "班級教室", teacher: "劉仲平", note: "波動與光學基礎" },
      { period: 2, subjectId: "chi", room: "班級教室", teacher: "游新欣", note: "白話文導讀與賞析" },
      { period: 3, subjectId: "life_edu", room: "班級教室", teacher: "洪世雍", note: "生命價值與哲學思考" },
      { period: 4, subjectId: "acc", room: "班級教室", teacher: "周櫻", note: "會計分錄課堂小考與訂正" },
      { period: 5, subjectId: "multimedia", room: "資處工場三", teacher: "翁偉倬", note: "多媒體數位影像處理" },
      { period: 6, subjectId: "multimedia", room: "資處工場三", teacher: "翁偉倬", note: "音訊剪輯與視覺特效" },
      { period: 7, subjectId: "multimedia", room: "資處工場三", teacher: "翁偉倬", note: "專題實作與作品繳交" }
    ],
    5: [ // 週五
      { period: 1, subjectId: "math", room: "班級教室", teacher: "賴珮茹", note: "三角函數基本概念" },
      { period: 2, subjectId: "math", room: "班級教室", teacher: "賴珮茹", note: "課本習題與作業演練" },
      { period: 3, subjectId: "eng", room: "班級教室", teacher: "陳瑀潔", note: "Unit 1 課文與單字朗讀" },
      { period: 4, subjectId: "eng", room: "班級教室", teacher: "陳瑀潔", note: "文法焦點與聽力測驗" },
      { period: 5, subjectId: "activity", room: "各社團教室", teacher: "社團指導老師", note: "社團活動第一階段" },
      { period: 6, subjectId: "activity", room: "各社團教室", teacher: "社團指導老師", note: "社團活動第二階段" },
      { period: 7, subjectId: "class_meeting", room: "班級教室", teacher: "翁偉倬", note: "班級自治討論與學藝宣導" }
    ]
  },

  // 學生名冊 (1~42號)
  roster: [
    { seat: 1, name: "張班長", gender: "M", note: "班長" },
    { seat: 2, name: "李副班", gender: "F", note: "副班長" },
    { seat: 3, name: "王學藝", gender: "F", note: "學藝股長" },
    { seat: 4, name: "趙風紀", gender: "M", note: "國防小老師" },
    { seat: 5, name: "李小會", gender: "F", note: "會計小老師" },
    { seat: 6, name: "陳總務", gender: "M", note: "總務股長" },
    { seat: 7, name: "劉同學", gender: "M", note: "" },
    { seat: 8, name: "林衛生", gender: "F", note: "健護小老師" },
    { seat: 9, name: "孫小數", gender: "M", note: "數學小老師" },
    { seat: 10, name: "周康樂", gender: "M", note: "聯課小老師" },
    { seat: 11, name: "吳輔導", gender: "F", note: "物理小老師" },
    { seat: 12, name: "黃小電", gender: "M", note: "數科/資訊小老師" },
    { seat: 13, name: "蔡同學", gender: "F", note: "" },
    { seat: 14, name: "鄭同學", gender: "M", note: "多媒體小老師" },
    { seat: 15, name: "許小國", gender: "F", note: "國文小老師" },
    { seat: 16, name: "謝同學", gender: "M", note: "" },
    { seat: 17, name: "洪同學", gender: "F", note: "" },
    { seat: 18, name: "張小程", gender: "M", note: "文書小老師" },
    { seat: 19, name: "徐同學", gender: "F", note: "" },
    { seat: 20, name: "周小體", gender: "M", note: "體育小老師" },
    { seat: 21, name: "蘇同學", gender: "F", note: "閩南語小老師" },
    { seat: 22, name: "莊同學", gender: "M", note: "" },
    { seat: 23, name: "楊小商", gender: "F", note: "商概小老師" },
    { seat: 24, name: "江同學", gender: "M", note: "" },
    { seat: 25, name: "郭同學", gender: "F", note: "" },
    { seat: 26, name: "葉同學", gender: "M", note: "" },
    { seat: 27, name: "潘同學", gender: "F", note: "" },
    { seat: 28, name: "錢同學", gender: "M", note: "生命教育小老師" },
    { seat: 29, name: "韓同學", gender: "F", note: "" },
    { seat: 30, name: "唐同學", gender: "M", note: "音樂小老師" },
    { seat: 31, name: "趙小英", gender: "F", note: "英文小老師" },
    { seat: 32, name: "沈同學", gender: "M", note: "" },
    { seat: 33, name: "游同學", gender: "F", note: "" },
    { seat: 34, name: "施同學", gender: "M", note: "" },
    { seat: 35, name: "朱小藝", gender: "F", note: "美術小老師" },
    { seat: 36, name: "盧同學", gender: "M", note: "" },
    { seat: 37, name: "戴同學", gender: "F", note: "" },
    { seat: 38, name: "鍾同學", gender: "M", note: "" },
    { seat: 39, name: "邱同學", gender: "F", note: "" },
    { seat: 40, name: "方同學", gender: "M", note: "" },
    { seat: 41, name: "何同學", gender: "F", note: "" },
    { seat: 42, name: "蕭同學", gender: "M", note: "" }
  ],

  // 初始作業清單（結合新課表科目：周櫻老師會計學、藍淑雯老師文書處理、翁偉倬老師多媒體等）
  homeworks: [
    {
      id: "hw-101",
      subjectId: "acc",
      title: "會計學 Ch1 借貸分錄實作練習",
      assignedDate: "2026-09-08",
      dueDate: "2026-09-12",
      type: "workbook",
      typeLabel: "習作本",
      description: "完成第一章分錄練習題 P.15~P.22，請用藍黑筆書寫（周櫻老師交代）。",
      status: "active",
      recipient: "會計小老師（5號 李小會）",
      unsubmitted: [4, 16, 24, 38],
      makeup: [10],
      excused: [21]
    },
    {
      id: "hw-102",
      subjectId: "wordproc",
      title: "文書處理實習 中文排版作業一",
      assignedDate: "2026-09-09",
      dueDate: "2026-09-13",
      type: "project",
      typeLabel: "上機作業",
      description: "將 Word 公文排版檔案存檔於資處工場三伺服器，檔名：座號_姓名_Doc1.docx（藍淑雯老師）。",
      status: "active",
      recipient: "文書小老師（18號 張小程）",
      unsubmitted: [7, 14, 26, 32, 40],
      makeup: [],
      excused: []
    },
    {
      id: "hw-103",
      subjectId: "multimedia",
      title: "多媒體製作 數位影像合成專題",
      assignedDate: "2026-09-10",
      dueDate: "2026-09-17",
      type: "project",
      typeLabel: "專案作品",
      description: "完成 Photoshop 圖層合成練習，檔案格式 PSD + JPG（導師 翁偉倬老師）。",
      status: "active",
      recipient: "多媒體小老師（14號 鄭同學）",
      unsubmitted: [2, 16, 22],
      makeup: [36],
      excused: []
    },
    {
      id: "hw-104",
      subjectId: "math",
      title: "數學 直線方程式講義第 1 節",
      assignedDate: "2026-09-07",
      dueDate: "2026-09-11",
      type: "handout",
      typeLabel: "講義作業",
      description: "講義 P.8~P.12 習題需詳列計算過程（賴珮茹老師）。",
      status: "active",
      recipient: "數學小老師（9號 孫小數）",
      unsubmitted: [3, 11, 29],
      makeup: [],
      excused: []
    }
  ],

  // 考試排程與倒數
  exams: [
    {
      id: "ex-201",
      title: "115學年度 第1學期 第一次期中考（第一次段考）",
      type: "major",
      typeLabel: "第一次段考",
      startDate: "2026-10-15",
      endDate: "2026-10-16",
      scope: [
        { subjectId: "acc", text: "第一章~第二章 會計方程式與借貸分錄（周櫻老師）" },
        { subjectId: "digitech", text: "第 1~2 章 數位科技發展與電腦硬體（倪正平老師）" },
        { subjectId: "wordproc", text: "單元 1~3 文書處理與排版規範（藍淑雯老師）" },
        { subjectId: "multimedia", text: "多媒體概論與影像基礎操作（翁偉倬老師）" },
        { subjectId: "biz", text: "第一篇 商業與企業經營概論（周櫻老師）" },
        { subjectId: "math", text: "第一章 直線方程式（賴珮茹老師）" },
        { subjectId: "chi", text: "第 1~4 課 + 國學講義（游新欣老師）" },
        { subjectId: "eng", text: "Unit 1 ~ Unit 3（陳瑀潔老師）" }
      ],
      notes: "各科請注意考試配分，會計學需自備簡易型計算機，多媒體需注意上機考操作規則。"
    },
    {
      id: "ex-202",
      title: "會計學 第 1 章 隨堂分錄過帳測驗",
      type: "quiz",
      typeLabel: "隨堂小考",
      startDate: "2026-09-15",
      endDate: "2026-09-15",
      scope: [
        { subjectId: "acc", text: "第一章 會計方程式與基本分錄（周櫻老師）" }
      ],
      notes: "小老師提醒：請自備直尺與立可帶，考試時間 30 分鐘。"
    },
    {
      id: "ex-203",
      title: "英文 Unit 1 單字隨堂週考",
      type: "quiz",
      typeLabel: "隨堂週考",
      startDate: "2026-09-18",
      endDate: "2026-09-18",
      scope: [
        { subjectId: "eng", text: "Unit 1 單字 30 個 + 課文重點句子（陳瑀潔老師）" }
      ],
      notes: "及格分數 75 分，未達標者當天放學留班補考。"
    }
  ],

  // 黑板每日一句語錄庫
  quotes: [
    { text: "借貸必相等，人生亦有平衡；付出多少努力，產出多少資產。", category: "會計金句", author: "資處學藝語錄" },
    { text: "在資處工場裡編排的是文件，在人生畫布上排版的是夢想。", category: "資處箴言", author: "智光資處一仁" },
    { text: "今日的累積是明天的資產，今日的懈怠是未來的負債。", category: "會計金句", author: "商業名言" },
    { text: "多媒體的精彩在於創意，程式的魅力在於邏輯，學習的價值在於堅持。", category: "導師叮嚀", author: "翁偉倬導師" },
    { text: "每一份準時繳交的作業，都是給小老師最溫柔的體貼。", category: "催繳良言", author: "資處一仁學藝" },
    { text: "不怕做錯分錄，只怕不肯訂正；學習就是不斷除錯的過程。", category: "學習打氣", author: "學藝黑板" },
    { text: "段考不可怕，可怕的是你以為自己都讀懂了。", category: "段考警惕", author: "學藝黑板" },
    { text: "用心對待每一堂課，專業將成為你最堅強的底氣。", category: "勵志精選", author: "資處一仁" }
  ],

  // 教室日誌今日預設範本（預設週一 7 節課）
  dailyLog: {
    date: new Date().toISOString().split("T")[0],
    weather: "☀️ 晴朗",
    absentCount: "全班到齊（42員實到）",
    todayQuote: "借貸必相等，人生亦有平衡；付出多少努力，產出多少資產。",
    cleaningRating: "優良（黑板、地板已清理乾淨）",
    deskRating: "整齊",
    notes: "1. 導師翁偉倬老師宣導：注意放學交通安全，準時繳交多媒體作業。\n2. 請會計小老師於第三節下課前收齊 Ch1 分錄習作。\n3. 明天第二節至資處工場三上文書處理實習，請準時集合。",
    periods: [
      { period: 1, subjectName: "美術", teacher: "黃浩軒", progress: "色彩學基礎與造型表現", homework: "自備繪圖用具", quiz: "無", discipline: "良好" },
      { period: 2, subjectName: "體育", teacher: "張鳴恩", progress: "體適能測驗與球類基本動作", homework: "無", quiz: "體能測驗", discipline: "活潑" },
      { period: 3, subjectName: "健康與護理", teacher: "趙蕙芬", progress: "青春期身心發展與自我照護", homework: "講義第一單元", quiz: "無", discipline: "良好" },
      { period: 4, subjectName: "物理", teacher: "劉仲平", progress: "基礎力學與運動方程式解析", homework: "課本例題 1-3", quiz: "隨堂問答", discipline: "專注" },
      { period: 5, subjectName: "國語文", teacher: "游新欣", progress: "第一課 篇章導讀與修辭技巧", homework: "國文學習單", quiz: "第一課注釋", discipline: "良好" },
      { period: 6, subjectName: "國語文", teacher: "游新欣", progress: "古今文體比較與作文練習", homework: "抄寫名言佳句", quiz: "無", discipline: "良好" },
      { period: 7, subjectName: "全民國防教育", teacher: "蘇昱禾", progress: "現代國防科技與全民防衛動員", homework: "無", quiz: "無", discipline: "良好" }
    ]
  },

  // 壁報與競賽專區
  bulletinTasks: [
    { id: "bt-1", title: "115學年度 智光商工 教室佈置競賽", deadline: "2026-09-30", progress: 70, leader: "學藝股長 & 朱小藝", status: "in_progress", notes: "後方公佈欄底紙已貼上，會計學習園地與多媒體專區設計中。" },
    { id: "bt-2", title: "校慶壁報比賽（資處科特色主題）", deadline: "2026-10-25", progress: 25, leader: "朱小藝、鄭同學", status: "planning", notes: "主題：AI 數位時代與商業管理創新應用。" },
    { id: "bt-3", title: "班級讀書心得與青年期刊投稿", deadline: "2026-10-10", progress: 40, leader: "國文小老師（15號 許小國）", status: "in_progress", notes: "全班需推選 5 篇優秀作品代表資處一仁投稿。" }
  ]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = DEFAULT_DATA;
}
