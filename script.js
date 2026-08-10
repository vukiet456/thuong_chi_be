"use strict";

const firebaseConfig = {
  apiKey: "AIzaSyAfFATzxZ7rL7YwQEu3lgRIAwfFLo2l4aU",
  authDomain: "danh-gia-cua.firebaseapp.com",
  databaseURL: "https://danh-gia-cua-default-rtdb.firebaseio.com",
  projectId: "danh-gia-cua",
  storageBucket: "danh-gia-cua.firebasestorage.app",
  messagingSenderId: "216706571557",
  appId: "1:216706571557:web:63c6fa03f864f8b516cecc"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const scoreRef = db.ref("love_score");
const archiveRef = db.ref("monthly_archives");

let currentScore = 100;
let history = [];

// DOM Elements
const currentScoreEl = document.getElementById("current-score");
const progressBarEl = document.getElementById("progress-bar");
const historyListEl = document.getElementById("history-list");
const scoreButtons = document.querySelectorAll(".score-btn");
const resetBtn = document.getElementById("reset-btn");

// Custom input DOM
const customBonusReason = document.getElementById("custom-bonus-reason");
const customBonusPoints = document.getElementById("custom-bonus-points");
const addCustomBonusBtn = document.getElementById("add-custom-bonus-btn");

const customPenaltyReason = document.getElementById("custom-penalty-reason");
const customPenaltyPoints = document.getElementById("custom-penalty-points");
const addCustomPenaltyBtn = document.getElementById("add-custom-penalty-btn");

// Save month DOM
const saveMonthInput = document.getElementById("save-month-input");
const saveMonthBtn = document.getElementById("save-month-btn");
const monthlyArchiveList = document.getElementById("monthly-archive-list");

// Set tháng hiện tại cho ô chọn tháng (VD: 2026-05)
const now = new Date();
const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
saveMonthInput.value = currentYearMonth;

function updateScoreUI() {
  currentScoreEl.textContent = currentScore;
  const percentage = Math.min(Math.max(currentScore, 0), 100);
  progressBarEl.style.width = `${percentage}%`;
}

function renderHistory() {
  if (!history || history.length === 0) {
    historyListEl.innerHTML = '<li class="empty-msg">Chưa có đánh giá nào trong tháng này.</li>';
    return;
  }

  historyListEl.innerHTML = "";
  [...history].reverse().forEach((item) => {
    const li = document.createElement("li");
    li.className = `history-item ${item.points > 0 ? "bonus-item" : "penalty-item"}`;
    const changeText = item.points > 0 ? `+${item.points}` : `${item.points}`;
    
    li.innerHTML = `
      <span class="history-reason">${item.reason}</span>
      <span class="history-points">${changeText} điểm</span>
    `;
    historyListEl.appendChild(li);
  });
}

// 1. LẮNG NGHE DỮ LIỆU ĐIỂM HIỆN TẠI
scoreRef.on("value", (snapshot) => {
  const data = snapshot.val();
  if (data) {
    currentScore = data.currentScore ?? 100;
    history = data.history ?? [];
  } else {
    currentScore = 100;
    history = [];
  }
  updateScoreUI();
  renderHistory();
});

// 2. LẮNG NGHE KHO LƯU TRỮ CÁC THÁNG
archiveRef.on("value", (snapshot) => {
  const archives = snapshot.val();
  if (!archives) {
    monthlyArchiveList.innerHTML = '<p class="empty-msg">Chưa có tháng nào được tổng kết lưu trữ.</p>';
    return;
  }

  monthlyArchiveList.innerHTML = "";
  Object.keys(archives).sort().reverse().forEach((monthKey) => {
    const item = archives[monthKey];
    const card = document.createElement("div");
    card.className = "archive-card";

    let historyHTML = "";
    if (item.history && item.history.length > 0) {
      item.history.forEach((h) => {
        const changeText = h.points > 0 ? `+${h.points}` : `${h.points}`;
        historyHTML += `
          <li class="history-item ${h.points > 0 ? "bonus-item" : "penalty-item"}">
            <span>${h.reason}</span>
            <span class="history-points">${changeText} điểm</span>
          </li>`;
      });
    } else {
      historyHTML = '<li class="empty-msg">Không có nhật ký ghi nhận.</li>';
    }

    card.innerHTML = `
      <div class="archive-card-header">
        <span>🗓️ Tháng ${monthKey}</span>
        <span>Tổng điểm: ${item.score}/100</span>
      </div>
      <ul class="archive-item-list">${historyHTML}</ul>
    `;
    monthlyArchiveList.appendChild(card);
  });
});

// 3. XỬ LÝ NÚT SẴN CÓ
scoreButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const points = parseInt(this.getAttribute("data-points"), 10);
    const reason = this.getAttribute("data-reason");
    addScoreItem(points, reason);
  });
});

// 4. XỬ LÝ THÊM ĐIỂM CỘNG TÙY CHỈNH
addCustomBonusBtn.addEventListener("click", function () {
  const reason = customBonusReason.value.trim();
  const points = parseInt(customBonusPoints.value, 10);

  if (!reason) {
    alert("Vui lòng nhập lý do cộng điểm!");
    return;
  }
  if (isNaN(points) || points <= 0) {
    alert("Số điểm cộng phải lớn hơn 0!");
    return;
  }

  addScoreItem(points, reason);
  customBonusReason.value = "";
});

// 5. XỬ LÝ THÊM ĐIỂM TRỪ TÙY CHỈNH
addCustomPenaltyBtn.addEventListener("click", function () {
  const reason = customPenaltyReason.value.trim();
  const points = parseInt(customPenaltyPoints.value, 10);

  if (!reason) {
    alert("Vui lòng nhập lý do trừ điểm!");
    return;
  }
  if (isNaN(points) || points <= 0) {
    alert("Số điểm trừ phải lớn hơn 0!");
    return;
  }

  addScoreItem(-points, reason);
  customPenaltyReason.value = "";
});

function addScoreItem(points, reason) {
  currentScore += points;
  if (!Array.isArray(history)) history = [];
  history.push({ points, reason, timestamp: Date.now() });

  scoreRef.set({
    currentScore: currentScore,
    history: history
  });
}

// 6. LƯU TỔNG KẾT THÁNG (NÚT BỰ)
saveMonthBtn.addEventListener("click", function () {
  const selectedMonth = saveMonthInput.value; // Dạng YYYY-MM
  if (!selectedMonth) {
    alert("Vui lòng chọn tháng trước khi lưu!");
    return;
  }

  if (confirm(`Bạn có chắc chắn muốn lưu tổng kết cho Tháng ${selectedMonth}?`)) {
    archiveRef.child(selectedMonth).set({
      score: currentScore,
      history: history,
      savedAt: Date.now()
    }, (error) => {
      if (!error) {
        alert(`Đã lưu trữ thành công tổng kết Tháng ${selectedMonth}!`);
      } else {
        alert("Lỗi khi lưu: " + error.message);
      }
    });
  }
});

// 7. NÚT RESET
resetBtn.addEventListener("click", function () {
  if (confirm("Xác nhận reset bảng điểm hiện tại về 100/100 cho tháng mới? (Lịch sử các tháng đã lưu sẽ không bị mất)")) {
    currentScore = 100;
    history = [];
    scoreRef.set({
      currentScore: 100,
      history: []
    });
  }
});
