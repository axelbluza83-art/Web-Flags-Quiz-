// Logic Gameplay Đố Cờ, Quản lý Điểm Xu, Hiệu ứng & Trợ giúp
const GameApp = {
  // Trạng thái game
  state: {
    coins: 0,
    unlocked: [],
    stats: { correctCount: 0, wrongCount: 0, streak: 0 }
  },

  currentQuestion: null,
  isAnswered: false,
  bonusUsedInCurrentQuestion: false,
  audioCtx: null,

  // Khởi động game
  init() {
    this.state = StorageManager.loadFromLocal();
    this.updateHeaderStats();
    this.initAudio();
    this.bindEvents();
    CollectionManager.init();
    this.nextQuestion();
  },

  // Khởi tạo AudioContext cho âm thanh trực tiếp (không phụ thuộc file ngoài)
  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn("AudioContext không hỗ trợ trên trình duyệt này:", e);
    }
  },

  playSound(type) {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    if (type === "correct") {
      // Âm thanh Ting-Ting vui tươi (C5 - G5 - C6)
      const notes = [523.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.1);
        gain.gain.setValueAtTime(0.2, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.3);
      });
    } else if (type === "wrong") {
      // Âm thanh Báo sai (trầm, ngắn)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "bonus") {
      // Âm thanh Ma thuật trợ giúp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  },

  // Cập nhật thông số số xu & số cờ đã mở trên Header
  updateHeaderStats() {
    const coinElem = document.getElementById("header-coins");
    const unlockedElem = document.getElementById("header-unlocked");
    if (coinElem) coinElem.innerText = this.state.coins;
    if (unlockedElem) unlockedElem.innerText = `${this.state.unlocked.length}/${COUNTRIES_DATA.length}`;
  },

  // Sinh câu hỏi đố ngẫu nhiên
  nextQuestion() {
    this.isAnswered = false;
    this.bonusUsedInCurrentQuestion = false;

    // Bật lại nút trợ giúp
    const bonusBtn = document.getElementById("btn-bonus-5050");
    if (bonusBtn) {
      bonusBtn.disabled = false;
      bonusBtn.classList.remove("used");
    }

    // Chọn 1 quốc gia làm đáp án đúng (ưu tiên ngẫu nhiên toàn bộ 197 nước)
    const targetIndex = Math.floor(Math.random() * COUNTRIES_DATA.length);
    const correctCountry = COUNTRIES_DATA[targetIndex];

    // Lấy 3 quốc gia gây nhiễu khác với đáp án đúng
    const distractors = [];
    const pool = COUNTRIES_DATA.filter(c => c.id !== correctCountry.id);
    
    // Ưu tiên 1-2 quốc gia cùng châu lục để tăng độ thách thức
    const sameContinentPool = pool.filter(c => c.continent === correctCountry.continent);
    if (sameContinentPool.length >= 2) {
      const idx1 = Math.floor(Math.random() * sameContinentPool.length);
      distractors.push(sameContinentPool[idx1]);
      pool.splice(pool.indexOf(sameContinentPool[idx1]), 1);
    }

    while (distractors.length < 3) {
      const randomIdx = Math.floor(Math.random() * pool.length);
      distractors.push(pool[randomIdx]);
      pool.splice(randomIdx, 1);
    }

    // Trộn ngẫu nhiên 4 đáp án
    const options = [correctCountry, ...distractors].sort(() => Math.random() - 0.5);

    this.currentQuestion = {
      correctCountry,
      options
    };

    this.renderQuestion();
  },

  // Hiển thị câu hỏi ra giao diện
  renderQuestion() {
    const q = this.currentQuestion;
    if (!q) return;

    const flagImg = document.getElementById("quiz-flag-img");
    const flagSkeleton = document.getElementById("flag-skeleton");
    const optionsGrid = document.getElementById("quiz-options");

    // Tải ảnh lá cờ
    if (flagImg) {
      flagImg.style.opacity = "0";
      if (flagSkeleton) flagSkeleton.style.display = "block";
      
      flagImg.onload = () => {
        flagImg.style.opacity = "1";
        if (flagSkeleton) flagSkeleton.style.display = "none";
      };
      flagImg.src = getFlagUrl(q.correctCountry.id);
    }

    // Hiển thị 4 nút lựa chọn
    if (optionsGrid) {
      optionsGrid.innerHTML = q.options.map((country, index) => {
        const letters = ["A", "B", "C", "D"];
        return `
          <button class="option-btn" data-id="${country.id}" data-index="${index}">
            <span class="option-prefix">${letters[index]}</span>
            <span class="option-text">${country.name}</span>
          </button>
        `;
      }).join("");

      // Gắn sự kiện click cho từng đáp án
      optionsGrid.querySelectorAll(".option-btn").forEach(btn => {
        btn.addEventListener("click", () => this.handleAnswer(btn.dataset.id, btn));
      });
    }
  },

  // Xử lý khi người chơi bấm chọn đáp án
  handleAnswer(selectedId, btnElement) {
    if (this.isAnswered) return;
    this.isAnswered = true;

    const q = this.currentQuestion;
    const isCorrect = selectedId === q.correctCountry.id;
    const allButtons = document.querySelectorAll(".option-btn");

    if (isCorrect) {
      // 1. Trả lời đúng
      btnElement.classList.add("correct-choice");
      this.playSound("correct");
      this.triggerConfetti();

      // Cộng 5 xu
      this.state.coins += 5;
      this.state.stats.correctCount++;
      this.state.stats.streak++;

      // Kiểm tra và mở khóa quốc kỳ
      let isNewlyUnlocked = false;
      if (!this.state.unlocked.includes(q.correctCountry.id)) {
        this.state.unlocked.push(q.correctCountry.id);
        isNewlyUnlocked = true;
      }

      // Lưu lại tiến trình
      StorageManager.saveToLocal(this.state);
      this.updateHeaderStats();
      CollectionManager.updateProgress(this.state.unlocked);

      if (isNewlyUnlocked) {
        this.showToast(`🎉 Chính xác! +5 xu. Bạn đã mở khóa quốc kỳ: ${q.correctCountry.name}!`, "success");
      } else {
        this.showToast(`🎉 Chính xác! +5 xu (Đang có ${this.state.coins} xu)`, "success");
      }

      // Chuyển sang câu tiếp theo sau 1.2 giây
      setTimeout(() => {
        this.nextQuestion();
      }, 1200);

    } else {
      // 2. Trả lời sai
      btnElement.classList.add("wrong-choice");
      this.playSound("wrong");

      // Bật đèn đáp án đúng để người chơi học hỏi
      allButtons.forEach(btn => {
        if (btn.dataset.id === q.correctCountry.id) {
          btn.classList.add("reveal-correct");
        }
      });

      // Trừ 3 xu (không âm dưới 0)
      const prevCoins = this.state.coins;
      this.state.coins = Math.max(0, this.state.coins - 3);
      const lostCoins = prevCoins - this.state.coins;
      this.state.stats.wrongCount++;
      this.state.stats.streak = 0;

      // Lưu lại tiến trình
      StorageManager.saveToLocal(this.state);
      this.updateHeaderStats();

      // Báo thông báo rõ ràng về việc trừ xu
      this.showToast(`❌ Sai rồi! Bạn bị trừ 3 xu! Đáp án đúng là: ${q.correctCountry.name}`, "error");

      // Chuyển câu sau 2 giây
      setTimeout(() => {
        this.nextQuestion();
      }, 2000);
    }
  },

  // Trợ giúp: Mua loại 2 đáp án sai (50:50 Bonus)
  useBonus5050() {
    if (this.isAnswered) return;
    if (this.bonusUsedInCurrentQuestion) {
      this.showToast("ℹ️ Bạn đã sử dụng trợ giúp cho câu hỏi này rồi!", "info");
      return;
    }

    const BONUS_COST = 10; // Chi phí 10 xu

    if (this.state.coins < BONUS_COST) {
      this.showToast(`⚠️ Bạn không đủ xu! Cần ${BONUS_COST} xu để mua loại 2 đáp án sai (Hiện có: ${this.state.coins} xu).`, "warning");
      return;
    }

    // Trừ 10 xu
    this.state.coins -= BONUS_COST;
    this.bonusUsedInCurrentQuestion = true;
    StorageManager.saveToLocal(this.state);
    this.updateHeaderStats();
    this.playSound("bonus");

    const bonusBtn = document.getElementById("btn-bonus-5050");
    if (bonusBtn) {
      bonusBtn.disabled = true;
      bonusBtn.classList.add("used");
    }

    // Chọn ngẫu nhiên 2 đáp án sai trong 3 đáp án sai để loại bỏ
    const q = this.currentQuestion;
    const wrongButtons = Array.from(document.querySelectorAll(".option-btn"))
      .filter(btn => btn.dataset.id !== q.correctCountry.id);

    // Trộn và lấy 2 nút sai
    const shuffledWrong = wrongButtons.sort(() => Math.random() - 0.5);
    shuffledWrong.slice(0, 2).forEach(btn => {
      btn.classList.add("eliminated");
      btn.disabled = true;
    });

    this.showToast(`🎯 Đã loại bỏ 2 đáp án sai! (-${BONUS_COST} xu)`, "info");
  },

  // Hiệu ứng pháo hoa ăn mừng nhẹ nhàng
  triggerConfetti() {
    const container = document.getElementById("confetti-container");
    if (!container) return;

    container.innerHTML = "";
    const colors = ["#22c55e", "#3b82f6", "#eab308", "#ec4899", "#8b5cf6", "#f97316"];

    for (let i = 0; i < 40; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.top = "-10px";
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      piece.style.animationDuration = `${0.8 + Math.random() * 1.2}s`;
      piece.style.animationDelay = `${Math.random() * 0.2}s`;
      container.appendChild(piece);
    }

    setTimeout(() => {
      container.innerHTML = "";
    }, 2000);
  },

  // Hệ thống hiển thị thông báo Toast
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";
    if (type === "warning") icon = "⚠️";

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  },

  // Gắn các sự kiện chuyển Tab và Save/Load Game
  bindEvents() {
    // 1. Chuyển Tab
    const tabBtns = document.querySelectorAll(".nav-tab");
    const sections = document.querySelectorAll(".main-section");

    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove("active"));
        sections.forEach(s => s.classList.remove("active"));

        btn.classList.add("active");
        const targetSection = document.getElementById(`section-${targetTab}`);
        if (targetSection) targetSection.classList.add("active");

        if (targetTab === "collection") {
          CollectionManager.render();
        } else if (targetTab === "save-load") {
          this.refreshSaveCodeBox();
        }
      });
    });

    // 2. Nút trợ giúp x2 50:50
    const bonusBtn = document.getElementById("btn-bonus-5050");
    if (bonusBtn) {
      bonusBtn.addEventListener("click", () => this.useBonus5050());
    }

    // 3. Nút Copy Save Code
    const copyBtn = document.getElementById("btn-copy-code");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => this.copySaveCode());
    }

    // 4. Nút Nạp Game (Load Code)
    const loadBtn = document.getElementById("btn-load-code");
    if (loadBtn) {
      loadBtn.addEventListener("click", () => this.handleLoadCode());
    }

    // 5. Nút Khởi tạo lại game (Reset)
    const resetBtn = document.getElementById("btn-reset-game");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetGame());
    }
  },

  // Làm mới ô hiển thị Save Code
  refreshSaveCodeBox() {
    const codeInput = document.getElementById("save-code-output");
    if (codeInput) {
      const code = StorageManager.generateSaveCode(this.state);
      codeInput.value = code || "Lỗi tạo mã!";
    }
  },

  // Sao chép Save Code vào Clipboard
  copySaveCode() {
    const code = StorageManager.generateSaveCode(this.state);
    if (!code) {
      this.showToast("Không thể tạo mã lưu game!", "error");
      return;
    }

    navigator.clipboard.writeText(code).then(() => {
      this.showToast("📋 Đã sao chép mã lưu game vào bộ nhớ tạm!", "success");
    }).catch(() => {
      // Fallback
      const input = document.getElementById("save-code-output");
      if (input) {
        input.select();
        document.execCommand("copy");
        this.showToast("📋 Đã sao chép mã lưu game!", "success");
      }
    });
  },

  // Nạp game bằng Load Code
  handleLoadCode() {
    const input = document.getElementById("load-code-input");
    if (!input) return;

    const codeStr = input.value.trim();
    if (!codeStr) {
      this.showToast("⚠️ Vui lòng dán mã lưu game vào ô nhập liệu!", "warning");
      return;
    }

    const result = StorageManager.parseLoadCode(codeStr);
    if (result.success) {
      this.state = result.data;
      this.updateHeaderStats();
      CollectionManager.render();
      this.refreshSaveCodeBox();
      input.value = "";
      this.showToast(result.message, "success");
    } else {
      this.showToast(`❌ ${result.message}`, "error");
    }
  },

  // Chơi lại từ đầu
  resetGame() {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ tiến trình và chơi lại từ đầu không?")) {
      this.state = StorageManager.getDefaultData();
      StorageManager.saveToLocal(this.state);
      this.updateHeaderStats();
      CollectionManager.render();
      this.refreshSaveCodeBox();
      this.nextQuestion();
      this.showToast("🔄 Đã đặt lại trò chơi về trạng thái ban đầu!", "info");
    }
  }
};

// Khởi chạy khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  GameApp.init();
});
