// Quản lý Lưu Trữ & Tạo Mã Save / Load Code
const StorageManager = {
  LOCAL_STORAGE_KEY: "FLAG_QUIZ_SAVE_DATA",

  // Lấy dữ liệu mặc định ban đầu
  getDefaultData() {
    return {
      coins: 0,
      unlocked: [], // Mảng chứa ID các quốc gia đã mở khóa: ["vn", "us", ...]
      stats: {
        correctCount: 0,
        wrongCount: 0,
        streak: 0
      },
      version: 1
    };
  },

  // Tải dữ liệu từ LocalStorage
  loadFromLocal() {
    try {
      const raw = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (!raw) return this.getDefaultData();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return this.getDefaultData();
      return {
        coins: Math.max(0, Number(parsed.coins) || 0),
        unlocked: Array.isArray(parsed.unlocked) ? parsed.unlocked : [],
        stats: parsed.stats || { correctCount: 0, wrongCount: 0, streak: 0 },
        version: 1
      };
    } catch (e) {
      console.error("Lỗi đọc dữ liệu LocalStorage:", e);
      return this.getDefaultData();
    }
  },

  // Lưu dữ liệu vào LocalStorage
  saveToLocal(data) {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Lỗi lưu vào LocalStorage:", e);
    }
  },

  // Tạo chuỗi Save Code để người dùng sao chép
  generateSaveCode(data) {
    try {
      const payload = {
        c: data.coins,
        u: data.unlocked,
        s: data.stats,
        t: Date.now()
      };
      const jsonStr = JSON.stringify(payload);
      // Mã hóa chuỗi sang Base64 an toàn cho Unicode
      const base64 = btoa(encodeURIComponent(jsonStr));
      
      // Tạo mã kiểm tra (checksum đơn giản)
      let sum = 0;
      for (let i = 0; i < base64.length; i++) {
        sum = (sum + base64.charCodeAt(i) * (i + 1)) % 9999;
      }
      const checksum = sum.toString(16).toUpperCase().padStart(4, "0");

      return `FLAG-${checksum}-${base64}`;
    } catch (e) {
      console.error("Lỗi tạo mã lưu:", e);
      return null;
    }
  },

  // Giải mã và nạp mã Load Code
  parseLoadCode(codeStr) {
    try {
      if (!codeStr || typeof codeStr !== "string") {
        return { success: false, message: "Vui lòng nhập mã lưu game!" };
      }

      const cleanCode = codeStr.trim();
      const parts = cleanCode.split("-");

      if (parts.length < 3 || parts[0].toUpperCase() !== "FLAG") {
        return { success: false, message: "Mã lưu game không đúng định dạng (Mã phải bắt đầu bằng FLAG-...)" };
      }

      const providedChecksum = parts[1].toUpperCase();
      const base64Data = parts.slice(2).join("-");

      // Kiểm tra checksum
      let sum = 0;
      for (let i = 0; i < base64Data.length; i++) {
        sum = (sum + base64Data.charCodeAt(i) * (i + 1)) % 9999;
      }
      const calculatedChecksum = sum.toString(16).toUpperCase().padStart(4, "0");

      if (providedChecksum !== calculatedChecksum) {
        return { success: false, message: "Mã lưu game bị sai hoặc đã bị chỉnh sửa không hợp lệ!" };
      }

      const jsonStr = decodeURIComponent(atob(base64Data));
      const parsed = JSON.parse(jsonStr);

      if (parsed.c === undefined || !Array.isArray(parsed.u)) {
        return { success: false, message: "Nội dung mã lưu game bị hỏng!" };
      }

      // Lọc danh sách quốc gia hợp lệ
      const validIds = new Set(COUNTRIES_DATA.map(c => c.id));
      const filteredUnlocked = parsed.u.filter(id => validIds.has(id));

      const restoredData = {
        coins: Math.max(0, parseInt(parsed.c) || 0),
        unlocked: Array.from(new Set(filteredUnlocked)),
        stats: parsed.s || { correctCount: 0, wrongCount: 0, streak: 0 },
        version: 1
      };

      // Lưu đè vào LocalStorage
      this.saveToLocal(restoredData);

      return {
        success: true,
        data: restoredData,
        message: `Khôi phục thành công! Nhận lại ${restoredData.coins} xu và ${restoredData.unlocked.length} quốc kỳ đã mở khóa.`
      };
    } catch (e) {
      console.error("Lỗi giải mã:", e);
      return { success: false, message: "Mã lưu game không hợp lệ hoặc bị lỗi cú pháp!" };
    }
  }
};
