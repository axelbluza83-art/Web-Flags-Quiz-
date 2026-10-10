# 🌍 Trò Chơi Web Đố Quốc Kỳ Thế Giới (Flag Quiz)

Một ứng dụng web đố cờ 197 quốc gia trên thế giới với giao diện hiện đại, tính năng thưởng/phạt xu, trợ giúp loại trừ đáp án, bộ sưu tập quốc kỳ và hệ thống lưu game bằng mã code.

---

## 🚀 Cách Mở & Chơi Game

Trò chơi được viết bằng HTML5/CSS3/JavaScript thuần, **không cần cài đặt server hay môi trường phức tạp**:

1. Mở thư mục `d:\Code Web cờ`.
2. Nhấp đúp chuột vào file [`index.html`](file:///d:/Code%20Web%20c%E1%BB%9D/index.html) để mở trực tiếp trên trình duyệt (Google Chrome, Microsoft Edge, Cốc Cốc, Firefox, Safari).
3. Hoặc bạn có thể dùng tiện ích mở rộng **Live Server** trong VS Code hoặc đưa lên **GitHub Pages** / **Vercel** miễn phí để chơi online cùng bạn bè.

---

## 🎮 Các Tính Năng Đã Triển Khai Theo Yêu Cầu

### 1. Dữ Liệu 197 Quốc Kỳ & Link Chuẩn
- Toàn bộ **197 quốc gia và vùng lãnh thổ** (193 thành viên LHQ + 2 quan sát viên Vatican, Palestine + Kosovo, Đài Loan).
- Ảnh cờ sắc nét chuẩn từ Wikimedia Commons thông qua CDN FlagCDN với định dạng vector / HD.
- Kèm tên tiếng Việt, tên tiếng Anh quốc tế, thủ đô, châu lục và đường dẫn bài viết chi tiết trên Wikipedia.

### 2. Gameplay, Thưởng/Phạt Xu & Trợ Giúp
- Mỗi lượt đố 1 lá cờ ngẫu nhiên kèm **4 phương án trắc nghiệm**.
- **Trả lời đúng**: **+5 xu**, phát âm thanh vui tươi, nổ hiệu ứng pháo hoa và lập tức mở khóa lá cờ vào bộ sưu tập.
- **Trả lời sai**: **-3 xu**, rung thẻ đáp án đỏ, phát âm thanh cảnh báo và hiện thông báo rõ ràng về số xu bị trừ cùng đáp án đúng.
- **Trợ giúp loại 2 đáp án sai (50:50 Bonus)**: Dùng **10 xu** để loại bỏ ngay lập tức 2 đáp án sai, gia tăng cơ hội chiến thắng.

### 3. Bộ Sưu Tập Quốc Kỳ & Tra Cứu (Gallery)
- Tab **"Bộ Sưu Tập (197)"** hiển thị toàn bộ quốc kỳ kèm thanh tiến độ khám phá (Ví dụ: `25 / 197 - 12.7%`).
- **Lá cờ đã mở khóa**: Hiển thị màu sắc rõ nét. Khi bấm vào sẽ hiện cửa sổ thông tin chi tiết (Tên tiếng Việt, tiếng Anh, thủ đô, châu lục, nút dẫn thẳng đến Wikipedia).
- **Lá cờ chưa mở khóa**: Bị làm mờ kèm biểu tượng ổ khóa 🔒. Khi bấm vào sẽ rung nhẹ và thông báo nhắc nhở người chơi cần trả lời đúng ở phần Đố Cờ để mở khóa.
- Có sẵn **thanh tìm kiếm** và **bộ lọc theo Châu lục** (Châu Á, Châu Âu, Châu Mỹ, Châu Phi, Châu Đại Dương).

### 4. Hệ Thống Lưu Game (Save & Load Code)
- **Tự động lưu**: Tiến trình chơi (số xu, các quốc kỳ đã mở, lịch sử chơi) được tự động ghi vào `localStorage` của trình duyệt.
- **Mã lưu game (Save Code)**: Nhấn **"Sao chép mã"** để copy 1 chuỗi mã hóa nhỏ gọn (dạng `FLAG-XXXX-...`).
- **Nạp game (Load Code)**: Khi chuyển sang máy tính khác hoặc trình duyệt khác, chỉ cần dán mã vào ô **"Nạp Game"** và bấm xác nhận để khôi phục lại 100% số xu và các lá cờ đã mở khóa.
- Có cơ chế kiểm tra tính toàn vẹn (checksum) giúp chống lỗi dữ liệu.

---

## 📂 Cấu Trúc Thư Mục

```
d:\Code Web cờ\
│
├── index.html              # Giao diện chính (Đố cờ, Bộ sưu tập, Save/Load)
├── README.md               # Hướng dẫn chi tiết
├── css/
│   └── style.css           # Giao diện hiện đại, hiệu ứng rung, pháo hoa, responsive
└── js/
    ├── countries.js        # Danh sách 197 quốc gia & cờ, thủ đô, châu lục, wiki link
    ├── storage.js          # Module tạo mã Save Code và nạp Load Code có Checksum
    ├── collection.js       # Quản lý bộ sưu tập cờ, bộ lọc và modal tra cứu
    └── game.js             # Logic gameplay, tính điểm xu, trợ giúp và âm thanh Web Audio
```
