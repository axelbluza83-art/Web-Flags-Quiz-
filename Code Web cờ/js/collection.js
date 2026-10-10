// Quản lý Bộ Sưu Tập & Tra Cứu Quốc Kỳ
const CollectionManager = {
  currentFilter: "all",
  searchQuery: "",

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    // Lọc theo châu lục
    const filterTabs = document.querySelectorAll(".filter-btn");
    filterTabs.forEach(btn => {
      btn.addEventListener("click", () => {
        filterTabs.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentFilter = btn.dataset.continent;
        this.render();
      });
    });

    // Tìm kiếm
    const searchInput = document.getElementById("search-country");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    // Đóng Modal thông tin quốc gia
    const modalCloseBtn = document.getElementById("country-modal-close");
    const modalBackdrop = document.getElementById("country-modal");
    if (modalCloseBtn && modalBackdrop) {
      modalCloseBtn.addEventListener("click", () => this.closeModal());
      modalBackdrop.addEventListener("click", (e) => {
        if (e.target === modalBackdrop) this.closeModal();
      });
    }
  },

  // Cập nhật thanh tiến độ mở khóa
  updateProgress(unlockedList) {
    const total = COUNTRIES_DATA.length;
    const count = unlockedList.length;
    const percent = ((count / total) * 100).toFixed(1);

    const countElem = document.getElementById("collection-count");
    const percentElem = document.getElementById("collection-percent");
    const fillElem = document.getElementById("collection-progress-fill");

    if (countElem) countElem.innerText = `${count} / ${total}`;
    if (percentElem) percentElem.innerText = `${percent}%`;
    if (fillElem) fillElem.style.width = `${percent}%`;
  },

  // Hiển thị danh sách quốc kỳ trong bộ sưu tập
  render() {
    const grid = document.getElementById("flags-grid");
    if (!grid) return;

    const unlockedSet = new Set(GameApp.state.unlocked);
    this.updateProgress(GameApp.state.unlocked);

    let filtered = COUNTRIES_DATA;

    if (this.currentFilter !== "all") {
      filtered = filtered.filter(c => c.continent === this.currentFilter);
    }

    if (this.searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(this.searchQuery) ||
        c.nameEn.toLowerCase().includes(this.searchQuery) ||
        c.capital.toLowerCase().includes(this.searchQuery)
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <p>🔍 Không tìm thấy quốc gia nào phù hợp.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(country => {
      const isUnlocked = unlockedSet.has(country.id);
      const flagUrl = getFlagUrl(country.id);

      return `
        <div class="flag-card ${isUnlocked ? 'unlocked' : 'locked'}" data-id="${country.id}" title="${isUnlocked ? country.name : 'Chưa mở khóa'}">
          <div class="flag-img-wrapper">
            ${isUnlocked 
              ? `<img src="${flagUrl}" alt="${country.name}" loading="lazy" />` 
              : `<div class="locked-overlay">
                   <span class="lock-icon">🔒</span>
                   <span class="lock-text">Chưa mở</span>
                 </div>
                 <img src="${flagUrl}" alt="Locked" class="blurred-flag" loading="lazy" />`
            }
          </div>
          <div class="flag-card-body">
            <span class="country-name">${isUnlocked ? country.name : '???'}</span>
            <span class="country-continent">${country.continent}</span>
          </div>
        </div>
      `;
    }).join("");

    // Thêm sự kiện click từng lá cờ
    grid.querySelectorAll(".flag-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        const country = COUNTRIES_DATA.find(c => c.id === id);
        if (!country) return;

        if (unlockedSet.has(id)) {
          this.openModal(country);
        } else {
          GameApp.showToast(`🔒 Bạn chưa mở khóa quốc kỳ của ${country.name}! Hãy trả lời đúng trong phần Đố Cờ để mở khóa nhé!`, "warning");
          // Rung nhẹ thẻ bị khóa
          card.classList.add("shake-anim");
          setTimeout(() => card.classList.remove("shake-anim"), 500);
        }
      });
    });
  },

  // Mở modal xem thông tin chi tiết
  openModal(country) {
    const modal = document.getElementById("country-modal");
    if (!modal) return;

    document.getElementById("modal-flag-img").src = getFlagUrl(country.id);
    document.getElementById("modal-country-name").innerText = country.name;
    document.getElementById("modal-country-name-en").innerText = country.nameEn;
    document.getElementById("modal-country-capital").innerText = country.capital;
    document.getElementById("modal-country-continent").innerText = country.continent;
    
    const wikiBtn = document.getElementById("modal-wiki-link");
    if (wikiBtn) {
      wikiBtn.href = country.wiki || `https://vi.wikipedia.org/wiki/${encodeURIComponent(country.name)}`;
    }

    modal.classList.add("active");
  },

  closeModal() {
    const modal = document.getElementById("country-modal");
    if (modal) modal.classList.remove("active");
  }
};
