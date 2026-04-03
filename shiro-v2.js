/* ========== SHIRO IT v2 — Main JavaScript ========== */

// Backend API base URL — auto-detect:
// In production (Render/Flask serving the HTML), use the same origin.
// For local dev with a separate Flask server, fall back to localhost:5000.
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : window.location.origin;

document.addEventListener("DOMContentLoaded", () => {
  /* ===== SPA NAVIGATION ===== */
  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll("[data-page]");
  const navMenu = document.getElementById("navMenu");

  function navigateTo(pageId) {
    pages.forEach((p) => p.classList.remove("active"));
    const target = document.getElementById("page-" + pageId);
    if (target) {
      target.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Update active nav link
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("data-page") === pageId)
        link.classList.add("active");
    });
    // Close mobile menu
    navMenu.classList.remove("open");
    document.getElementById("menuToggle").querySelector("i").className =
      "fas fa-bars";
    // Trigger animations
    setTimeout(() => runScrollAnimations(), 300);
    // Update URL hash
    history.pushState(null, "", "#" + pageId);
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      
      if (page) {
          navigateTo(page);
          
          // Custom scroll for merged page
          if (page === 'build-pc-services') {
              // If clicked from 'Services' link, scroll to services section
              if (link.innerHTML.includes('nav_services') || link.getAttribute('href') === '#services') {
                  setTimeout(() => {
                      const servicesSection = document.getElementById('services-content');
                      if (servicesSection) {
                          const navbarHeight = document.querySelector('.navbar').offsetHeight || 80;
                          window.scrollTo({
                              top: servicesSection.offsetTop - navbarHeight,
                              behavior: 'smooth'
                          });
                      }
                  }, 350); // small delay to let page transition complete
              } else if (link.innerHTML.includes('nav_build') || link.getAttribute('href') === '#build-pc') {
                  // Make sure we scroll to top for Build PC
                  setTimeout(() => {
                      window.scrollTo({
                          top: 0,
                          behavior: 'smooth'
                      });
                  }, 350);
              }
          }
      }
    });
  });

  // Handle browser back/forward
  window.addEventListener("popstate", () => {
    const hash = window.location.hash.replace("#", "") || "home";
    navigateTo(hash);
  });

  // Load initial page from hash
  const initialPage = window.location.hash.replace("#", "") || "home";
  if (initialPage !== "home") navigateTo(initialPage);

  /* ===== MOBILE MENU ===== */
  const menuToggle = document.getElementById("menuToggle");
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
    const icon = menuToggle.querySelector("i");
    icon.className = navMenu.classList.contains("open")
      ? "fas fa-times"
      : "fas fa-bars";
  });

  // Mobile dropdowns
  document.querySelectorAll(".dropdown > a").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      if (window.innerWidth <= 640) {
        e.preventDefault();
        trigger.parentElement.classList.toggle("open");
      }
    });
  });

  /* ===== NAVBAR SCROLL ===== */
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  });

  /* ===== THEME TOGGLE ===== */
  const themeToggle = document.getElementById("themeToggle");
  let savedTheme = localStorage.getItem("shiro-theme");
  if (!savedTheme) {
    savedTheme = "dark";
    localStorage.setItem("shiro-theme", "dark");
  }

  if (savedTheme === "light") {
    document.body.classList.add("light");
    themeToggle.querySelector("i").className = "fas fa-sun";
  } else {
    document.body.classList.remove("light");
    themeToggle.querySelector("i").className = "fas fa-moon";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    themeToggle.querySelector("i").className = isLight
      ? "fas fa-sun"
      : "fas fa-moon";
    localStorage.setItem("shiro-theme", isLight ? "light" : "dark");
  });

  /* ===== LANGUAGE SWITCHER ===== */
  const langToggle = document.getElementById("languageToggle");
  const langDropdown = document.getElementById("languageDropdown");
  const langOptions = document.querySelectorAll(".language-option");
  let currentLang = localStorage.getItem("shiro-lang");
  if (!currentLang) {
    currentLang = "en";
    localStorage.setItem("shiro-lang", "en");
  }

  const translations = {
    bm: {
      // Nav
      nav_home: "Utama",
      nav_tips: "Tips & Trik IT",
      nav_gaming: "Gaming",
      nav_services: "Perkhidmatan",
      nav_shop: "Kedai",
      nav_about: "Tentang",
      nav_contact: "Hubungi",
      nav_build: "Bina PC & Perkhidmatan IT",
      nav_gaming_pcs: "PC Gaming",
      nav_custom_builds: "Bina Sendiri",
      nav_prebuilt: "PC Siap",
      nav_repair: "Baik Pulih",
      nav_maintenance: "Penyelenggaraan",
      nav_networking: "Rangkaian",
      // Hero
      hero_badge: "Pembina PC Custom Malaysia",
      hero_title_1: "Bina Impian Anda",
      hero_title_2: "PC Gaming",
      hero_desc: "Dari bajet rendah hingga kuasa tertinggi — kami bina PC custom yang sepadan dengan keperluan prestasi dan gaya anda. Perkhidmatan IT pakar di Kepala Batas, Pulau Pinang.",
      hero_f1: "Respon Pantas",
      hero_f2: "Jaminan 2 Tahun",
      hero_f3: "Jurutera Pakar",
      hero_cta1: "Bina PC Anda",
      hero_cta2: "Lihat Kedai",
      hero_trust: "pelanggan mempercayai SHIRO IT",
      // Home Services
      svc_badge: "Perkhidmatan Kami",
      svc_title_1: "Apa Yang",
      svc_title_2: "Kami Tawarkan",
      svc_desc: "Dari bina PC custom hingga penyelesaian IT komprehensif, kami sedia membantu.",
      svc_1_title: "Bina PC Custom",
      svc_1_desc: "PC gaming dibina tangan mengikut keperluan dan bajet anda.",
      svc_2_title: "Baik Pulih PC",
      svc_2_desc: "Diagnosis pakar dan pembaikan untuk semua masalah perkakasan dan perisian PC.",
      svc_3_title: "Rangkaian",
      svc_3_desc: "Setup rangkaian profesional, konfigurasi, dan penyelesaian masalah.",
      svc_4_title: "Sokongan IT",
      svc_4_desc: "Sokongan IT komprehensif untuk perniagaan dan individu.",
      svc_5_title: "Pemulihan Data",
      svc_5_desc: "Pulihkan data yang hilang dari pemacu rosak dan sistem korup.",
      svc_6_title: "Penyelesaian Cloud",
      svc_6_desc: "Migrasi cloud, setup, dan pengurusan untuk perniagaan anda.",
      // Tiers
      tier_title_1: "Pilih",
      tier_title_2: "PC Anda",
      // Stats
      stat_1: "PC Dibina",
      stat_2: "Kepuasan",
      stat_3: "Tahun Pengalaman",
      stat_4: "Sokongan",
      // Testimonials
      test_title_1: "Apa Pelanggan",
      test_title_2: "Kata",
      // CTA
      cta_1: "Sedia Bina",
      cta_2: "PC Impian",
      cta_desc: "Gunakan konfigurator interaktif kami untuk reka PC gaming sempurna anda. Pilih dari komponen terkini dan dapatkan sebut harga segera.",
      // About Page
      about_badge: "Tentang Kami",
      about_h1_1: "Kami Bina",
      about_h1_2: "Impian",
      about_desc: "SHIRO IT adalah pembina PC custom dan pembekal perkhidmatan IT Malaysia yang bersemangat, berdedikasi untuk menyampaikan sistem berprestasi tinggi dan perkhidmatan luar biasa.",
      about_stat1: "PC Dibina",
      about_stat2: "Tahun",
      about_stat3: "Kepuasan",
      about_stat4v: "Pulau Pinang",
      about_stat4: "Berpusat",
      about_journey_badge: "Perjalanan Kami",
      about_story1: "Kisah SHIRO IT",
      about_story2: "Cerita",
      about_tl1_title: "Permulaan",
      about_tl1_desc: "SHIRO IT diasaskan dengan semangat untuk membina PC custom berprestasi tinggi.",
      about_tl2_title: "Berkembang Maju",
      about_tl2_desc: "Berkembang ke perkhidmatan IT, menawarkan baik pulih, rangkaian, dan penyelesaian cloud.",
      about_tl3_title: "Kehadiran Dalam Talian",
      about_tl3_desc: "Melancarkan platform e-dagang dan konfigurator PC interaktif.",
      about_tl4_title: "Impak Komuniti",
      about_tl4_desc: "Bekerjasama dengan sekolah dan universiti tempatan untuk program pendidikan teknologi.",
      about_tl5_title: "Pengembangan",
      about_tl5_desc: "Membuka bilik pameran Pulau Pinang dan berkembang melayani lebih 500 pelanggan.",
      about_tl6_title: "Inovasi",
      about_tl6_desc: "Memperkenalkan cadangan binaan berkuasa AI dan semakan keserasian masa nyata.",
      about_values_badge: "Nilai Kami",
      about_values1: "Apa Yang Mendorong",
      about_values2: "Kami",
      val_1_title: "Semangat",
      val_1_desc: "Setiap binaan direka dengan kasih sayang tulen terhadap teknologi dan gaming.",
      val_2_title: "Kepercayaan",
      val_2_desc: "Harga telus, cadangan jujur, dan sokongan selepas jualan yang boleh dipercayai.",
      val_3_title: "Inovasi",
      val_3_desc: "Sentiasa mengamalkan teknologi terkini untuk memberikan pengalaman terbaik kepada pelanggan.",
      val_4_title: "Komuniti",
      val_4_desc: "Membina komuniti gamer dan peminat teknologi di seluruh Malaysia.",
      about_team_badge: "Pasukan Kami",
      about_team1: "Kenali",
      about_team2: "Pasukan",
      // IT Tips Page
      tips_badge: "Pangkalan Ilmu",
      tips_h1_1: "IT",
      tips_h1_2: "Tips & Trik",
      tips_desc: "Tips teknologi praktikal untuk pastikan PC anda pantas, selamat, dan optimum. Dari pakar SHIRO IT untuk anda.",
      tips_video_badge: "Video Pilihan",
      tips_video1: "Tonton &",
      tips_video2: "Belajar",
      tips_care_badge: "Penjagaan PC",
      tips_care1: "Pastikan PC Anda",
      tips_care2: "Sihat",
      tips_cta1: "Perlukan",
      tips_cta2: "Bantuan Pakar",
      tips_cta_desc: "Jurutera kami boleh diagnos dan baiki sebarang masalah PC. Dari prestasi perlahan hingga kerosakan perkakasan — kami sedia membantu.",
      // Services Page
      svcp_badge: "Perkhidmatan Kami",
      svcp_h1_1: "Profesional",
      svcp_h1_2: "Penyelesaian IT",
      svcp_desc: "Dari bina PC custom hingga sokongan IT perusahaan — kami menyampaikan perkhidmatan teknologi berkualiti tinggi dan boleh dipercayai mengikut keperluan anda.",
      proc_badge: "Cara Ia Berfungsi",
      proc_h2_1: "Proses",
      proc_h2_2: "Kami",
      faq_badge: "Soalan Lazim",
      faq_h2_1: "Soalan",
      faq_h2_2: "Lazim",
      // Shop Page
      shop_badge: "Kedai",
      shop_h1_1: "SHIRO IT",
      shop_h1_2: "Kedai",
      shop_desc: "PC gaming siap bina, stesen kerja, komponen, dan aksesori — semuanya dipilih oleh SHIRO IT.",
      shop_cta_h2: "Tak Jumpa Apa Yang Anda Cari?",
      shop_cta_desc: "Kami boleh dapatkan sebarang komponen atau bina PC custom khas untuk anda.",
      // Build PC Page
      build_badge: "PC Configurator & Services",
      build_h1_1: "Build PC &",
      build_h1_2: "IT Services",
      build_desc: "Pilih komponen anda di bawah dan dapatkan anggaran harga segera. Tempah melalui WhatsApp!",
      // Contact Page
      contact_badge: "Hubungi Kami",
      contact_h1_1: "Hubungi",
      contact_h1_2: "Kami",
      contact_desc: "Ada soalan atau perlukan sebut harga? Hubungi kami melalui mana-mana saluran di bawah.",
      contact_form_title: "Hantar Mesej Kepada Kami",
      contact_find_badge: "Cari Kami",
      contact_loc1: "Lokasi",
      contact_loc2: "Kami",
      careers_badge: "Kerjaya",
      careers_h2_1: "Sertai",
      careers_h2_2: "Pasukan Kami",
      // Language
      language_english: "English",
      language_bm: "Bahasa Malaysia",
    },
  };

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("shiro-lang", lang);
    const flag = document.getElementById("currentFlag");
    const langText = document.getElementById("currentLanguage");
    if (lang === "bm") {
      flag.className = "fi fi-my";
      langText.textContent = "BM";
    } else {
      flag.className = "fi fi-us";
      langText.textContent = "EN";
    }
    document.querySelectorAll("[data-translate]").forEach((el) => {
      const key = el.getAttribute("data-translate");
      if (lang === "bm" && translations.bm[key]) {
        el.textContent = translations.bm[key];
      } else if (lang === "en") {
        // Reset to original — store originals on first run
        if (el.dataset.originalText) el.textContent = el.dataset.originalText;
      }
    });
    langDropdown.classList.remove("open");
  }

  // Store original texts
  document.querySelectorAll("[data-translate]").forEach((el) => {
    el.dataset.originalText = el.textContent;
  });

  langToggle.addEventListener("click", () =>
    langDropdown.classList.toggle("open"),
  );
  langOptions.forEach((opt) => {
    opt.addEventListener("click", () =>
      setLanguage(opt.getAttribute("data-lang")),
    );
  });

  setLanguage(currentLang);

  // Close language dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".language-switcher"))
      langDropdown.classList.remove("open");
  });

  /* ===== SCROLL ANIMATIONS ===== */
  function runScrollAnimations() {
    const elements = document.querySelectorAll(
      ".card, .tier-card, .process-card, .timeline-card, .contact-method",
    );
    elements.forEach((el) => {
      if (!el.classList.contains("animate-on-scroll")) {
        el.classList.add("animate-on-scroll");
      }
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 },
    );
    document
      .querySelectorAll(".animate-on-scroll")
      .forEach((el) => observer.observe(el));
  }
  runScrollAnimations();

  /* ===== STATS COUNTER ===== */
  const statValues = document.querySelectorAll(".stat-value");
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;
    statValues.forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      let current = 0;
      const increment = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = current + suffix;
      }, 25);
    });
    statsAnimated = true;
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) animateStats();
      });
    },
    { threshold: 0.3 },
  );

  const statsSection = document.querySelector(".stats-section");
  if (statsSection) statsObserver.observe(statsSection);

  /* ===== SHOP — Products ===== */
  const products = [
    {
      id: 1,
      name: "Phantom Lite",
      category: "Gaming PCs",
      price: 2499,
      badge: "Best Value",
      specs: "RTX 4060 | i5-14400F | 16GB DDR5",
      image: "🖥️",
      featured: false,
    },
    {
      id: 2,
      name: "Phantom Pro",
      category: "Gaming PCs",
      price: 4999,
      badge: "Popular",
      specs: "RTX 4070 Super | Ryzen 7 7800X3D | 32GB DDR5",
      image: "🖥️",
      featured: true,
    },
    {
      id: 3,
      name: "Phantom Ultra",
      category: "Gaming PCs",
      price: 8999,
      badge: "Ultimate",
      specs: "RTX 5080 | Ryzen 9 9900X | 64GB DDR5",
      image: "🖥️",
      featured: false,
    },
    {
      id: 4,
      name: "Creator Station",
      category: "Workstations",
      price: 6499,
      badge: "Creative",
      specs: "RTX 4080 | i9-14900K | 64GB DDR5",
      image: "💻",
      featured: false,
    },
    {
      id: 5,
      name: "Studio Max",
      category: "Workstations",
      price: 12999,
      badge: "Pro",
      specs: "RTX 5090 | Threadripper 7970X | 128GB DDR5",
      image: "💻",
      featured: false,
    },
    {
      id: 6,
      name: "NVIDIA RTX 5070",
      category: "Components",
      price: 2899,
      badge: "New",
      specs: "12GB GDDR7 | PCIe 5.0 | DLSS 4.0",
      image: "🎮",
      featured: false,
    },
    {
      id: 7,
      name: "AMD Ryzen 9 9900X",
      category: "Components",
      price: 1999,
      badge: "Hot",
      specs: "12C/24T | 5.6GHz Boost | AM5",
      image: "⚡",
      featured: false,
    },
    {
      id: 8,
      name: "32GB DDR5-6000",
      category: "Components",
      price: 549,
      badge: "",
      specs: "CL30 | Dual Channel Kit | RGB",
      image: "📦",
      featured: false,
    },
    {
      id: 9,
      name: "Mechanical Keyboard",
      category: "Peripherals",
      price: 349,
      badge: "RGB",
      specs: "Cherry MX Red | Hot-swap | PBT Keycaps",
      image: "⌨️",
      featured: false,
    },
    {
      id: 10,
      name: "Gaming Mouse",
      category: "Peripherals",
      price: 249,
      badge: "",
      specs: "26000 DPI | 60g Lightweight | Wireless",
      image: "🖱️",
      featured: false,
    },
    {
      id: 11,
      name: '27" QHD Monitor',
      category: "Peripherals",
      price: 1299,
      badge: "165Hz",
      specs: "IPS | 1ms | HDR400 | USB-C",
      image: "🖵",
      featured: false,
    },
    {
      id: 12,
      name: "Cable Management Kit",
      category: "Accessories",
      price: 49,
      badge: "",
      specs: "Velcro ties, clips, cable sleeves",
      image: "🔌",
      featured: false,
    },
  ];

  const productsGrid = document.getElementById("productsGrid");
  const emptyState = document.getElementById("emptyState");
  const categoryTabs = document.querySelectorAll(".cat-tab");
  const sortSelect = document.getElementById("sortSelect");
  let activeCategory = "All";

  function renderProducts() {
    if (!productsGrid) return;
    let filtered = products.filter(
      (p) => activeCategory === "All" || p.category === activeCategory,
    );
    const sort = sortSelect ? sortSelect.value : "featured";
    if (sort === "price-low") filtered.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") filtered.sort((a, b) => b.price - a.price);
    else filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    productsGrid.innerHTML = "";
    if (filtered.length === 0) {
      emptyState.style.display = "block";
      return;
    }
    emptyState.style.display = "none";

    filtered.forEach((p) => {
      const card = document.createElement("div");
      card.className = "product-card" + (p.featured ? " featured" : "");
      card.innerHTML = `
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ""}
        <div class="product-image">${p.image}</div>
        <div class="product-category">${p.category}</div>
        <h3>${p.name}</h3>
        <p class="product-specs">${p.specs}</p>
        <div class="product-bottom">
          <div class="product-price">RM ${p.price.toLocaleString()}</div>
          <a href="https://wa.me/60177617672?text=Hi, I'm interested in the ${p.name} (RM ${p.price.toLocaleString()})" target="_blank" rel="noopener noreferrer" class="btn btn-primary product-btn">
            <i class="fab fa-whatsapp"></i> Inquire
          </a>
        </div>
      `;
      productsGrid.appendChild(card);
    });
    // Re-run animations for new cards
    setTimeout(runScrollAnimations, 50);
  }

  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      categoryTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeCategory = tab.dataset.category;
      renderProducts();
    });
  });

  if (sortSelect) sortSelect.addEventListener("change", renderProducts);
  renderProducts();

  /* ===== BUILD PC — Configurator ===== */
  // SVG data URIs for components without photo images
  const SVG_CPU = `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="30" width="60" height="60" rx="4" fill="rgba(37,99,235,0.12)" stroke="rgba(37,99,235,0.6)" stroke-width="2"/><rect x="42" y="42" width="36" height="36" rx="2" fill="rgba(37,99,235,0.08)" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><text x="60" y="64" text-anchor="middle" font-size="14" font-family="monospace" fill="rgba(37,99,235,0.8)">CPU</text><line x1="38" y1="25" x2="38" y2="30" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="25" x2="50" y2="30" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="62" y1="25" x2="62" y2="30" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="74" y1="25" x2="74" y2="30" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="38" y1="90" x2="38" y2="95" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="90" x2="50" y2="95" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="62" y1="90" x2="62" y2="95" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="74" y1="90" x2="74" y2="95" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="25" y1="38" x2="30" y2="38" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="25" y1="50" x2="30" y2="50" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="25" y1="62" x2="30" y2="62" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="25" y1="74" x2="30" y2="74" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="90" y1="38" x2="95" y2="38" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="90" y1="50" x2="95" y2="50" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="90" y1="62" x2="95" y2="62" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="90" y1="74" x2="95" y2="74" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/></svg>`;

  const SVG_MOBO = `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="124" height="84" rx="4" fill="rgba(37,99,235,0.08)" stroke="rgba(37,99,235,0.5)" stroke-width="1.5"/><rect x="16" y="16" width="36" height="32" rx="2" fill="rgba(37,99,235,0.12)" stroke="rgba(37,99,235,0.4)" stroke-width="1" stroke-dasharray="3 2"/><text x="34" y="36" text-anchor="middle" font-size="7" fill="rgba(37,99,235,0.7)" font-family="monospace">CPU</text><rect x="60" y="16" width="72" height="14" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><text x="96" y="26" text-anchor="middle" font-size="6" fill="rgba(239,68,68,0.7)" font-family="monospace">RAM SLOTS</text><rect x="16" y="56" width="52" height="12" rx="2" fill="rgba(37,99,235,0.08)" stroke="rgba(37,99,235,0.35)" stroke-width="1"/><rect x="16" y="72" width="52" height="12" rx="2" fill="rgba(37,99,235,0.08)" stroke="rgba(37,99,235,0.35)" stroke-width="1"/><text x="42" y="64" text-anchor="middle" font-size="5" fill="rgba(37,99,235,0.6)" font-family="monospace">PCIe x16</text><text x="42" y="80" text-anchor="middle" font-size="5" fill="rgba(37,99,235,0.6)" font-family="monospace">PCIe x4</text><rect x="76" y="38" width="18" height="18" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><rect x="100" y="38" width="12" height="12" rx="1" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.4)" stroke-width="1"/><rect x="76" y="60" width="56" height="28" rx="3" fill="rgba(37,99,235,0.06)" stroke="rgba(37,99,235,0.3)" stroke-width="1"/><text x="104" y="77" text-anchor="middle" font-size="6" fill="rgba(37,99,235,0.6)" font-family="monospace">I/O PORTS</text></svg>`;

  const SVG_CASE = `<svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="64" height="104" rx="5" fill="rgba(239,68,68,0.07)" stroke="rgba(239,68,68,0.5)" stroke-width="2"/><rect x="14" y="14" width="52" height="62" rx="3" fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.3)" stroke-width="1" stroke-dasharray="3 3"/><circle cx="40" cy="38" r="14" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.35)" stroke-width="1"/><circle cx="40" cy="38" r="6" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><line x1="40" y1="24" x2="40" y2="30" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><line x1="40" y1="46" x2="40" y2="52" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><line x1="26" y1="38" x2="32" y2="38" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><line x1="48" y1="38" x2="54" y2="38" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><rect x="14" y="82" width="20" height="8" rx="2" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.4)" stroke-width="1"/><rect x="38" y="82" width="28" height="8" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/><rect x="14" y="94" width="52" height="12" rx="2" fill="rgba(37,99,235,0.06)" stroke="rgba(37,99,235,0.25)" stroke-width="1"/><circle cx="20" cy="100" r="2" fill="rgba(37,99,235,0.4)"/><circle cx="28" cy="100" r="2" fill="rgba(37,99,235,0.4)"/></svg>`;

  const SVG_PSU = `<svg viewBox="0 0 130 90" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="114" height="74" rx="5" fill="rgba(37,99,235,0.07)" stroke="rgba(37,99,235,0.5)" stroke-width="2"/><circle cx="38" cy="45" r="22" fill="rgba(37,99,235,0.06)" stroke="rgba(37,99,235,0.35)" stroke-width="1.5"/><circle cx="38" cy="45" r="10" fill="rgba(37,99,235,0.08)" stroke="rgba(37,99,235,0.3)" stroke-width="1"/><line x1="38" y1="23" x2="38" y2="31" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><line x1="38" y1="59" x2="38" y2="67" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><line x1="16" y1="45" x2="24" y2="45" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><line x1="52" y1="45" x2="60" y2="45" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><rect x="72" y="18" width="42" height="7" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><rect x="72" y="30" width="42" height="7" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><rect x="72" y="42" width="42" height="7" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><rect x="72" y="54" width="42" height="7" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><text x="93" y="73" text-anchor="middle" font-size="7" fill="rgba(37,99,235,0.6)" font-family="monospace">MODULAR CABLES</text><text x="15" y="82" font-size="8" fill="rgba(37,99,235,0.7)" font-family="monospace">80+ GOLD</text></svg>`;

  const SVG_COOLING = `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="110" height="30" rx="3" fill="rgba(37,99,235,0.07)" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><rect x="5" y="40" width="110" height="30" rx="3" fill="rgba(37,99,235,0.07)" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><rect x="5" y="75" width="110" height="30" rx="3" fill="rgba(37,99,235,0.07)" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><circle cx="60" cy="20" r="10" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.5)" stroke-width="1.5"/><circle cx="60" cy="55" r="10" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.5)" stroke-width="1.5"/><circle cx="60" cy="90" r="10" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.5)" stroke-width="1.5"/><circle cx="60" cy="20" r="3" fill="rgba(37,99,235,0.4)"/><circle cx="60" cy="55" r="3" fill="rgba(37,99,235,0.4)"/><circle cx="60" cy="90" r="3" fill="rgba(37,99,235,0.4)"/><line x1="30" y1="20" x2="45" y2="20" stroke="rgba(239,68,68,0.5)" stroke-width="1.5"/><line x1="75" y1="20" x2="90" y2="20" stroke="rgba(239,68,68,0.5)" stroke-width="1.5"/><line x1="30" y1="55" x2="45" y2="55" stroke="rgba(239,68,68,0.5)" stroke-width="1.5"/><line x1="75" y1="55" x2="90" y2="55" stroke="rgba(239,68,68,0.5)" stroke-width="1.5"/><line x1="30" y1="90" x2="45" y2="90" stroke="rgba(239,68,68,0.5)" stroke-width="1.5"/><line x1="75" y1="90" x2="90" y2="90" stroke="rgba(239,68,68,0.5)" stroke-width="1.5"/></svg>`;

  const componentOptions = {
    cpu: {
      icon: "fas fa-microchip",
      label: "Processor (CPU)",
      color: "#0066FF",
      image: SVG_CPU,
      isSvg: true,
      options: [
        { name: "Intel Core i5-14400F", price: 699 },
        { name: "AMD Ryzen 5 7600X", price: 899 },
        { name: "AMD Ryzen 7 7800X3D", price: 1499 },
        { name: "Intel Core i7-14700K", price: 1599 },
        { name: "AMD Ryzen 9 9900X", price: 2199 },
        { name: "Intel Core i9-14900K", price: 2499 },
      ],
    },
    gpu: {
      icon: "fas fa-film",
      label: "Graphics Card (GPU)",
      color: "#FF0033",
      image: "images/components/gpu.jpg",
      isSvg: false,
      options: [
        { name: "NVIDIA RTX 4060", price: 1299 },
        { name: "NVIDIA RTX 4060 Ti", price: 1799 },
        { name: "NVIDIA RTX 4070 Super", price: 2499 },
        { name: "NVIDIA RTX 5070", price: 2899 },
        { name: "NVIDIA RTX 5070 Ti", price: 3499 },
        { name: "NVIDIA RTX 5080", price: 4999 },
      ],
    },
    ram: {
      icon: "fas fa-memory",
      label: "Memory (RAM)",
      color: "#0066FF",
      image: "images/components/ram.jpg",
      isSvg: false,
      options: [
        { name: "16GB DDR5-5200", price: 249 },
        { name: "32GB DDR5-5600", price: 449 },
        { name: "32GB DDR5-6000 CL30", price: 549 },
        { name: "64GB DDR5-5600", price: 899 },
        { name: "64GB DDR5-6000", price: 1099 },
      ],
    },
    storage: {
      icon: "fas fa-hdd",
      label: "Storage (SSD)",
      color: "#FF0033",
      image: "images/components/ssd.jpg",
      isSvg: false,
      options: [
        { name: "512GB NVMe Gen3", price: 179 },
        { name: "1TB NVMe Gen4", price: 349 },
        { name: "1TB NVMe Gen5", price: 599 },
        { name: "2TB NVMe Gen4", price: 649 },
        { name: "2TB NVMe Gen5", price: 999 },
      ],
    },
    motherboard: {
      icon: "fas fa-server",
      label: "Motherboard",
      color: "#0066FF",
      image: SVG_MOBO,
      isSvg: true,
      options: [
        { name: "B650M (AMD, Micro-ATX)", price: 499 },
        { name: "B760M (Intel, Micro-ATX)", price: 499 },
        { name: "X670E (AMD, ATX)", price: 999 },
        { name: "Z790 (Intel, ATX)", price: 999 },
        { name: "X870E (AMD, ATX)", price: 1299 },
      ],
    },
    pcCase: {
      icon: "fas fa-box",
      label: "Case",
      color: "#FF0033",
      image: SVG_CASE,
      isSvg: true,
      options: [
        { name: "Mid-Tower (Mesh, Black)", price: 249 },
        { name: "Mid-Tower (Tempered Glass, White)", price: 349 },
        { name: "Full-Tower (Premium, RGB)", price: 549 },
        { name: "Mini-ITX (Compact)", price: 449 },
      ],
    },
    psu: {
      icon: "fas fa-bolt",
      label: "Power Supply (PSU)",
      color: "#0066FF",
      image: SVG_PSU,
      isSvg: true,
      options: [
        { name: "650W 80+ Bronze", price: 249 },
        { name: "750W 80+ Gold", price: 399 },
        { name: "850W 80+ Gold", price: 499 },
        { name: "1000W 80+ Platinum", price: 699 },
      ],
    },
    cooling: {
      icon: "fas fa-fan",
      label: "Cooling",
      color: "#FF0033",
      image: SVG_COOLING,
      isSvg: true,
      options: [
        { name: "Tower Air Cooler", price: 149 },
        { name: "240mm AIO Liquid", price: 349 },
        { name: "360mm AIO Liquid", price: 499 },
        { name: "Custom Loop (Basic)", price: 999 },
      ],
    },
  };

  const selected = {};
  Object.keys(componentOptions).forEach((cat) => (selected[cat] = 0));

  const componentsList = document.getElementById("componentsList");
  const summaryItems = document.getElementById("summaryItems");
  const summaryTotal = document.getElementById("summaryTotal");
  const whatsappOrder = document.getElementById("whatsappOrder");

  function buildConfigurator() {
    if (!componentsList) return;
    componentsList.innerHTML = "";

    Object.entries(componentOptions).forEach(([cat, info]) => {
      const group = document.createElement("div");
      group.className = "card component-group";
      const selectedOption = info.options[selected[cat]];

      let optionsHTML = info.options
        .map(
          (opt, i) => `
        <button class="comp-option ${selected[cat] === i ? "active" : ""}" data-cat="${cat}" data-idx="${i}">
          <span class="opt-name">${opt.name}</span>
          <span class="opt-price">RM ${opt.price.toLocaleString()}</span>
        </button>
      `,
        )
        .join("");

      group.innerHTML = `
        ${
          info.image
            ? `
        <div class="comp-img-wrap">
          ${
            info.isSvg
              ? info.image
              : `<img src="${info.image}" alt="${info.label}" class="comp-img" onerror="this.parentElement.style.display='none'">`
          }
        </div>`
            : ""
        }
        <div class="comp-header">
          <div class="comp-icon" style="color:${info.color}; background:${info.color}20;">
            <i class="${info.icon}"></i>
          </div>
          <div>
            <h4>${info.label}</h4>
            <span class="comp-selected">${selectedOption.name}</span>
          </div>
          <span class="comp-price">RM ${selectedOption.price.toLocaleString()}</span>
        </div>
        <div class="comp-options">${optionsHTML}</div>
      `;
      componentsList.appendChild(group);
    });

    // Add click handlers
    document.querySelectorAll(".comp-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        selected[btn.dataset.cat] = parseInt(btn.dataset.idx, 10);
        buildConfigurator();
        updateSummary();
      });
    });
  }

  function updateSummary() {
    if (!summaryItems) return;
    summaryItems.innerHTML = "";
    let total = 0;

    Object.entries(selected).forEach(([cat, idx]) => {
      const info = componentOptions[cat];
      const opt = info.options[idx];
      total += opt.price;

      const item = document.createElement("div");
      item.className = "summary-item";
      item.innerHTML = `
        <span class="summary-cat">${info.label}</span>
        <span class="summary-name">${opt.name}</span>
        <span class="summary-price">RM ${opt.price.toLocaleString()}</span>
      `;
      summaryItems.appendChild(item);
    });

    summaryTotal.textContent = "RM " + total.toLocaleString();

    // Build WhatsApp message
    const lines = Object.entries(selected).map(([cat, idx]) => {
      const info = componentOptions[cat];
      const opt = info.options[idx];
      return `• ${info.label}: ${opt.name} (RM ${opt.price.toLocaleString()})`;
    });
    const msg = encodeURIComponent(
      `Hi SHIRO IT! I'd like to order a custom PC build:\n\n${lines.join("\n")}\n\nTotal: RM ${total.toLocaleString()}\n\nPlease confirm availability and delivery time. Thank you!`,
    );
    whatsappOrder.href = `https://wa.me/60177617672?text=${msg}`;

    // Store build config for API submission
    whatsappOrder._buildConfig = {};
    Object.entries(selected).forEach(([cat, idx]) => {
      const info = componentOptions[cat];
      whatsappOrder._buildConfig[info.label] = info.options[idx].name;
    });
    whatsappOrder._total = total;
  }

  // Save quote to backend when WhatsApp order is clicked
  if (whatsappOrder) {
    whatsappOrder.addEventListener("click", async () => {
      try {
        await fetch(API_BASE + "/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "WhatsApp Customer",
            email: "via-whatsapp@shiro.it",
            phone: "via-whatsapp",
            build_config: whatsappOrder._buildConfig || {},
            total_price: whatsappOrder._total || 0,
            notes: "Submitted via WhatsApp order button",
          }),
        });
      } catch (_) {
        /* silent — WhatsApp still opens */
      }
    });
  }

  buildConfigurator();
  updateSummary();

  /* ===== CONTACT FORM ===== */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      const inputs = contactForm.querySelectorAll("input, select, textarea");
      const data = {};
      inputs.forEach((el) => {
        if (el.name) data[el.name] = el.value;
      });
      // Collect by placeholder/label as fallback
      const allInputs = contactForm.querySelectorAll("input, select, textarea");
      const fields = ["name", "email", "phone", "subject", "message"];
      const vals = Array.from(allInputs).map((el) => el.value);
      const payload = {
        name: vals[0] || "",
        email: vals[1] || "",
        phone: vals[2] || "",
        subject: vals[3] || "",
        message: vals[4] || "",
      };

      try {
        const res = await fetch(API_BASE + "/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.success) {
          showToast(result.message || "Message sent successfully!", "success");
          contactForm.reset();
        } else {
          showToast(
            result.error || "Failed to send. Please try WhatsApp instead.",
            "error",
          );
        }
      } catch (err) {
        showToast(
          "Server not reachable. Please WhatsApp us at +60 17-761 7672.",
          "error",
        );
      } finally {
        // Always re-enable the button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  /* ===== TESTIMONIALS SLIDER ===== */
  (function () {
    const track = document.getElementById("tsliderTrack");
    const dotsEl = document.getElementById("tsliderDots");
    const btnPrev = document.getElementById("tsliderPrev");
    const btnNext = document.getElementById("tsliderNext");
    if (!track) return;

    const slides = Array.from(track.querySelectorAll(".tslide"));
    let current = 0;
    let autoTimer = null;

    function slidesVisible() {
      const vw = window.innerWidth;
      if (vw <= 600) return 1;
      if (vw <= 900) return 2;
      return 3;
    }

    function maxIndex() {
      return Math.max(0, slides.length - slidesVisible());
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, maxIndex()));
      // Calculate the offset: width of one slide + gap (1.5rem = 24px)
      const slideW = slides[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(track).gap) || 24;
      track.style.transform = `translateX(-${current * (slideW + gap)}px)`;
      // Update dots
      document.querySelectorAll(".tslider-dot").forEach((d, i) => {
        d.classList.toggle("active", i === current);
      });
    }

    function buildDots() {
      if (!dotsEl) return;
      dotsEl.innerHTML = "";
      const count = maxIndex() + 1;
      for (let i = 0; i < count; i++) {
        const dot = document.createElement("button");
        dot.className = "tslider-dot" + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", () => {
          goTo(i);
          resetAuto();
        });
        dotsEl.appendChild(dot);
      }
    }

    function startAuto() {
      autoTimer = setInterval(() => {
        goTo(current >= maxIndex() ? 0 : current + 1);
      }, 4500);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    btnPrev &&
      btnPrev.addEventListener("click", () => {
        goTo(current - 1);
        resetAuto();
      });
    btnNext &&
      btnNext.addEventListener("click", () => {
        goTo(current + 1);
        resetAuto();
      });

    // Pause on hover
    const wrapper = document.querySelector(".testimonials-slider-wrapper");
    if (wrapper) {
      wrapper.addEventListener("mouseenter", () => clearInterval(autoTimer));
      wrapper.addEventListener("mouseleave", startAuto);
    }

    // Touch swipe support
    let touchStartX = 0;
    track.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );
    track.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
        resetAuto();
      }
    });

    // Rebuild on resize
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildDots();
        goTo(current);
      }, 150);
    });

    buildDots();
    goTo(0);
    startAuto();
  })();

  /* ===== HERO SLIDER ===== */
  (function () {
    const track = document.getElementById("heroSliderTrack");
    const dotsEl = document.getElementById("heroSliderDots");
    const btnPrev = document.getElementById("heroSliderPrev");
    const btnNext = document.getElementById("heroSliderNext");
    const progressBar = document.getElementById("heroSliderProgressBar");
    if (!track) return;

    const slides = Array.from(track.querySelectorAll(".hero-slide"));
    const total = slides.length;
    let current = 0;
    let autoTimer = null;
    const INTERVAL = 8000; // 8 seconds per slide

    function goTo(idx) {
      current = ((idx % total) + total) % total; // wrap around
      track.style.transform = `translateX(-${current * 100}%)`;
      // Update dots
      document.querySelectorAll(".hero-slider-dot").forEach((d, i) => {
        d.classList.toggle("active", i === current);
      });
    }

    function buildDots() {
      if (!dotsEl) return;
      dotsEl.innerHTML = "";
      for (let i = 0; i < total; i++) {
        const dot = document.createElement("button");
        dot.className = "hero-slider-dot" + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", () => {
          goTo(i);
          resetAuto();
        });
        dotsEl.appendChild(dot);
      }
    }

    function startProgress() {
      if (!progressBar) return;
      // Reset to 0 instantly (no transition)
      progressBar.classList.remove("animating");
      progressBar.style.width = "0%";
      // Force a reflow so the browser registers the 0% state
      void progressBar.offsetWidth;
      // Set the CSS custom property for duration
      progressBar.style.setProperty("--progress-duration", INTERVAL + "ms");
      // Trigger the smooth CSS transition to 100%
      progressBar.classList.add("animating");
    }

    function stopProgress() {
      if (!progressBar) return;
      // Freeze at current position
      const computed = getComputedStyle(progressBar).width;
      progressBar.classList.remove("animating");
      progressBar.style.width = computed;
    }

    function startAuto() {
      startProgress();
      autoTimer = setInterval(() => {
        goTo(current + 1);
        startProgress();
      }, INTERVAL);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = null;
      startAuto();
    }

    btnPrev &&
      btnPrev.addEventListener("click", () => {
        goTo(current - 1);
        resetAuto();
      });
    btnNext &&
      btnNext.addEventListener("click", () => {
        goTo(current + 1);
        resetAuto();
      });

    // Pause on hover
    const wrapper = document.querySelector(".hero-slider-wrapper");
    if (wrapper) {
      wrapper.addEventListener("mouseenter", () => {
        clearInterval(autoTimer);
        autoTimer = null;
        stopProgress();
      });
      wrapper.addEventListener("mouseleave", () => {
        startAuto();
      });
    }

    // Touch swipe support
    let touchStartX = 0;
    track.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );
    track.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
        resetAuto();
      }
    });

    buildDots();
    goTo(0);
    startAuto();
  })();

  /* ===== HERO PARTICLES ===== */
  const particlesContainer = document.getElementById("heroParticles");
  if (particlesContainer) {
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 1}px;
        height: ${Math.random() * 4 + 1}px;
        background: ${Math.random() > 0.5 ? "rgba(37,99,235,0.3)" : "rgba(220,38,38,0.2)"};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 8 + 4}s ease-in-out infinite;
        animation-delay: ${Math.random() * 4}s;
      `;
      particlesContainer.appendChild(particle);
    }
  }
});

/* ===== TOAST NOTIFICATIONS ===== */
(function () {
  const style = document.createElement("style");
  style.textContent = `
    .toast-container { position: fixed; bottom: 2rem; right: 2rem; z-index: 9999; display: flex; flex-direction: column; gap: 0.75rem; }
    .toast { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; border-radius: 12px;
      background: var(--bg-card, #1e293b); border: 1px solid var(--border-color, #334155);
      box-shadow: 0 8px 30px rgba(0,0,0,0.4); font-size: 0.9rem; max-width: 360px;
      animation: slideInToast 0.3s ease; color: var(--text-primary, #f1f5f9); }
    .toast.success { border-left: 4px solid #22c55e; }
    .toast.error   { border-left: 4px solid #ef4444; }
    .toast i { font-size: 1.1rem; flex-shrink: 0; }
    .toast.success i { color: #22c55e; }
    .toast.error   i { color: #ef4444; }
    @keyframes slideInToast { from { opacity:0; transform:translateX(100%); } to { opacity:1; transform:translateX(0); } }
  `;
  document.head.appendChild(style);
})();

function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const icon =
    type === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle";
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.4s";
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

/* ===== BACKGROUND ANIMATION ===== */
(function () {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function isLight() {
    return document.body.classList.contains("light");
  }

  function palettes() {
    if (isLight()) {
      return {
        a: { r: 37, g: 99, b: 235 },
        b: { r: 239, g: 68, b: 68 },
      };
    } else {
      return {
        a: { r: 239, g: 68, b: 68 },
        b: { r: 37, g: 99, b: 235 },
      };
    }
  }

  function rgba(c, a) {
    return `rgba(${c.r},${c.g},${c.b},${a})`;
  }

  let W, H;
  let meteors = [];
  let rings = [];
  let stars = [];
  let comps = [];

  /* -- Stars (twinkle dots) -- */
  function initStars() {
    stars = Array.from({ length: 130 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.8,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.025 + 0.01,
      col: Math.random() > 0.5 ? "a" : "b",
    }));
  }

  /* -- PC Component icons -- */
  const COMP_TYPES = ["cpu", "gpu", "ram", "ssd", "fan", "psu"];

  function initComponents() {
    comps = Array.from({ length: 16 }, () => spawnComponent());
  }

  function spawnComponent() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 22 + 18,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.004,
      life: Math.random() * 0.2 + 0.13,
      col: Math.random() > 0.5 ? "a" : "b",
      type: COMP_TYPES[Math.floor(Math.random() * COMP_TYPES.length)],
    };
  }

  function drawComponent(comp, c) {
    const { x, y, size: s, rot, life: a } = comp;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = rgba(c, a);
    ctx.fillStyle = rgba(c, a * 0.07);
    ctx.lineWidth = 1.6;

    if (comp.type === "cpu") {
      // Square body
      ctx.beginPath();
      ctx.rect(-s, -s, s * 2, s * 2);
      ctx.fill();
      ctx.stroke();
      // Inner die
      ctx.beginPath();
      ctx.rect(-s * 0.45, -s * 0.45, s * 0.9, s * 0.9);
      ctx.stroke();
      // Pins on all 4 sides
      const pinCount = 5,
        pinLen = s * 0.45,
        pinSpacing = (s * 1.6) / (pinCount + 1);
      for (let i = 0; i < pinCount; i++) {
        const offset = -s * 0.8 + pinSpacing * (i + 1);
        ctx.beginPath();
        ctx.moveTo(offset, -s);
        ctx.lineTo(offset, -s - pinLen);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(offset, s);
        ctx.lineTo(offset, s + pinLen);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s, offset);
        ctx.lineTo(-s - pinLen, offset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s, offset);
        ctx.lineTo(s + pinLen, offset);
        ctx.stroke();
      }
    } else if (comp.type === "gpu") {
      // PCB body
      ctx.beginPath();
      ctx.rect(-s * 1.7, -s * 0.7, s * 3.4, s * 1.4);
      ctx.fill();
      ctx.stroke();
      // Two fan circles
      [-s * 0.75, s * 0.75].forEach((fx) => {
        ctx.beginPath();
        ctx.arc(fx, 0, s * 0.52, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI / 2) * i;
          ctx.beginPath();
          ctx.moveTo(fx, 0);
          ctx.arc(fx, 0, s * 0.52, angle, angle + Math.PI / 4);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(fx, 0, s * 0.14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      // PCI-e connector
      ctx.beginPath();
      ctx.rect(-s * 1.4, s * 0.7, s * 2.1, s * 0.35);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(-s * 1.3 + i * s * 0.37, s * 0.7);
        ctx.lineTo(-s * 1.3 + i * s * 0.37, s * 1.05);
        ctx.stroke();
      }
    } else if (comp.type === "ram") {
      // Stick body
      ctx.beginPath();
      ctx.rect(-s * 0.3, -s * 1.5, s * 0.6, s * 2.8);
      ctx.fill();
      ctx.stroke();
      // Chips on front
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.rect(-s * 0.2, -s * 1.3 + i * s * 0.8, s * 0.4, s * 0.5);
        ctx.fill();
        ctx.stroke();
      }
      // Contact fingers
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.rect(-s * 0.26 + i * s * 0.1, s * 1.1, s * 0.06, s * 0.3);
        ctx.fill();
        ctx.stroke();
      }
    } else if (comp.type === "ssd") {
      // M.2 stick body
      ctx.beginPath();
      ctx.rect(-s * 0.45, -s * 1.2, s * 0.9, s * 2.2);
      ctx.fill();
      ctx.stroke();
      // Controller chip
      ctx.beginPath();
      ctx.rect(-s * 0.28, -s * 0.9, s * 0.56, s * 0.56);
      ctx.fillStyle = rgba(c, a * 0.18);
      ctx.fill();
      ctx.stroke();
      // NAND chips
      [-s * 0.15, s * 0.45].forEach((cy) => {
        ctx.beginPath();
        ctx.rect(-s * 0.28, cy, s * 0.56, s * 0.45);
        ctx.fillStyle = rgba(c, a * 0.12);
        ctx.fill();
        ctx.stroke();
      });
      // Connector
      ctx.fillStyle = rgba(c, a * 0.07);
      ctx.beginPath();
      ctx.rect(-s * 0.35, s * 1.0, s * 0.7, s * 0.22);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(-s * 0.3 + i * s * 0.1, s * 1.0);
        ctx.lineTo(-s * 0.3 + i * s * 0.1, s * 1.22);
        ctx.stroke();
      }
    } else if (comp.type === "fan") {
      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // 5 blades
      for (let i = 0; i < 5; i++) {
        const angle = ((Math.PI * 2) / 5) * i;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(s * 0.45, 0, s * 0.38, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = rgba(c, a * 0.18);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      // Hub
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = rgba(c, a * 0.3);
      ctx.fill();
      ctx.stroke();
      // Corner screw holes
      [
        [-s * 0.78, -s * 0.78],
        [s * 0.78, -s * 0.78],
        [-s * 0.78, s * 0.78],
        [s * 0.78, s * 0.78],
      ].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, s * 0.1, 0, Math.PI * 2);
        ctx.stroke();
      });
    } else if (comp.type === "psu") {
      // Main box body
      ctx.beginPath();
      ctx.rect(-s * 1.0, -s * 0.65, s * 2.0, s * 1.3);
      ctx.fill();
      ctx.stroke();
      // Fan grill circle
      ctx.beginPath();
      ctx.arc(-s * 0.35, 0, s * 0.48, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a2 = (Math.PI / 2) * i;
        ctx.beginPath();
        ctx.moveTo(-s * 0.35, 0);
        ctx.lineTo(
          -s * 0.35 + Math.cos(a2) * s * 0.48,
          Math.sin(a2) * s * 0.48,
        );
        ctx.stroke();
      }
      // Connector block
      ctx.beginPath();
      ctx.rect(s * 0.18, -s * 0.4, s * 0.58, s * 0.8);
      ctx.fillStyle = rgba(c, a * 0.15);
      ctx.fill();
      ctx.stroke();
      // Connector pins
      ctx.fillStyle = rgba(c, a * 0.1);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          ctx.beginPath();
          ctx.rect(
            s * 0.26 + j * s * 0.22,
            -s * 0.3 + i * s * 0.27,
            s * 0.12,
            s * 0.16,
          );
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  /* -- Pulse rings -- */
  function spawnRing() {
    const p = palettes();
    const col = Math.random() > 0.5 ? p.a : p.b;
    rings.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0,
      maxR: Math.random() * 120 + 60,
      life: 1,
      decay: Math.random() * 0.008 + 0.005,
      color: col,
    });
  }

  /* -- Meteors -- */
  function spawnMeteor() {
    const p = palettes();
    const col = Math.random() > 0.5 ? p.a : p.b;
    meteors.push({
      x: Math.random() * W,
      y: 0,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 5 + 4,
      len: Math.random() * 120 + 60,
      life: 1,
      decay: Math.random() * 0.02 + 0.015,
      color: col,
    });
  }

  setInterval(spawnMeteor, 900);
  setInterval(spawnRing, 1800);

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initStars();
    initComponents();
  }

  function draw() {
    const p = palettes();
    ctx.clearRect(0, 0, W, H);

    /* -- Twinkling stars -- */
    stars.forEach((s) => {
      s.phase += s.speed;
      const alpha = (Math.sin(s.phase) * 0.5 + 0.5) * 0.78 + 0.12;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(p[s.col], alpha);
      ctx.fill();
    });

    /* -- Drifting PC components -- */
    comps.forEach((h, i) => {
      h.x += h.vx;
      h.y += h.vy;
      h.rot += h.rotV;
      if (h.x < -150 || h.x > W + 150 || h.y < -150 || h.y > H + 150) {
        comps[i] = spawnComponent();
      }
      drawComponent(h, p[h.col]);
    });

    /* -- Pulse rings -- */
    rings = rings.filter((r) => r.life > 0);
    rings.forEach((r) => {
      r.r += 1.6;
      r.life -= r.decay;
      const progress = r.r / r.maxR;
      const alpha = r.life * (1 - progress) * 0.65;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(r.color, alpha);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(r.color, alpha * 0.5);
      ctx.lineWidth = 1;
      ctx.stroke();
      if (r.r >= r.maxR) r.life = 0;
    });

    /* -- Meteors -- */
    meteors = meteors.filter((m) => m.life > 0);
    meteors.forEach((m) => {
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - (m.vx * m.len) / 8, m.y - (m.vy * m.len) / 8);
      const mg = ctx.createLinearGradient(
        m.x,
        m.y,
        m.x - (m.vx * m.len) / 8,
        m.y - (m.vy * m.len) / 8,
      );
      mg.addColorStop(0, rgba(m.color, Math.min(m.life * 1.2, 1)));
      mg.addColorStop(1, rgba(m.color, 0));
      ctx.strokeStyle = mg;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 4, m.y - m.vy * 4);
      ctx.strokeStyle = rgba(m.color, m.life * 0.6);
      ctx.lineWidth = 4;
      ctx.stroke();
      m.x += m.vx;
      m.y += m.vy;
      m.life -= m.decay;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
})();

/* ===== FESTIVAL ANIMATIONS ===== */
(function () {
  const zones = document.querySelectorAll(".festival-particles");
  const toggleBtn = document.getElementById("festivalToggleBtn");
  const panel = document.getElementById("festivalPanel");
  const panelClose = document.getElementById("festivalPanelClose");
  const festSwitch = document.getElementById("festivalSwitch");
  const festGrid = document.getElementById("festivalGrid");
  if (!zones.length || !toggleBtn || !panel) return;

  // Secret admin shortcut: Ctrl+Shift+F to show/hide festival controls
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "F") {
      e.preventDefault();
      document.body.classList.toggle("festival-admin");
    }
  });

  // Festival theme configurations
  const festivals = {
    cny: {
      name: "Chinese New Year",
      emojis: ["🏮", "🧧", "🎊", "💮", "🐉"],
      cssClass: "fp-cny",
      count: 8,
      baseDur: 6,
    },
    raya: {
      name: "Hari Raya",
      emojis: ["⭐", "🌙", "✨", "🕌", "💚"],
      cssClass: "fp-raya",
      count: 8,
      baseDur: 7,
    },
    deepavali: {
      name: "Deepavali",
      emojis: ["🪔", "✨", "🎇", "💛", "🔥"],
      cssClass: "fp-deepavali",
      count: 8,
      baseDur: 6,
    },
    christmas: {
      name: "Christmas",
      emojis: ["❄️", "❄", "✨", "⭐", "🎄"],
      cssClass: "fp-christmas",
      count: 12,
      baseDur: 5,
    },
    newyear: {
      name: "New Year",
      emojis: ["🎊", "🎉", "✨", "💫", "⭐", "🎆"],
      cssClass: "fp-newyear",
      count: 10,
      baseDur: 4,
    },
    national: {
      name: "Merdeka",
      emojis: ["🇲🇾", "⭐", "🌙", "❤️", "💙"],
      cssClass: "fp-national",
      count: 7,
      baseDur: 7,
    },
    general: {
      name: "Party",
      emojis: ["🎉", "✨", "💫", "⭐", "🎊"],
      cssClass: "fp-general",
      count: 8,
      baseDur: 5,
    },
  };

  // State
  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem("shiro_festival");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { festival: "cny", enabled: false };
  }

  function saveState() {
    localStorage.setItem("shiro_festival", JSON.stringify(state));
  }

  // Particle spawning — fills ALL zones (navbar + footer)
  function spawnParticles() {
    clearParticles();
    const fest = festivals[state.festival];
    if (!fest) return;

    zones.forEach((zone) => {
      for (let i = 0; i < fest.count; i++) {
        const particle = document.createElement("span");
        particle.className = "festival-particle " + fest.cssClass;
        particle.textContent =
          fest.emojis[Math.floor(Math.random() * fest.emojis.length)];

        const left = Math.random() * 100;
        const dur = fest.baseDur + Math.random() * 4;
        const delay = Math.random() * dur;
        const sway = (Math.random() - 0.5) * 60;
        const spin = (Math.random() - 0.5) * 30;
        const scale = 0.5 + Math.random() * 0.6;

        particle.style.left = left + "%";
        particle.style.setProperty("--dur", dur + "s");
        particle.style.setProperty("--delay", "-" + delay + "s");
        particle.style.setProperty("--sway", sway + "px");
        particle.style.setProperty("--spin", spin + "deg");
        particle.style.transform = "scale(" + scale + ")";

        zone.appendChild(particle);
      }
    });
  }

  function clearParticles() {
    zones.forEach((zone) => {
      zone.innerHTML = "";
    });
  }

  // UI update
  function updateUI() {
    toggleBtn.classList.toggle("active", state.enabled);
    festSwitch.checked = state.enabled;
    document.querySelectorAll(".festival-option").forEach((opt) => {
      opt.classList.toggle("selected", opt.dataset.festival === state.festival);
    });
    if (state.enabled) {
      spawnParticles();
    } else {
      clearParticles();
    }
  }

  // Events
  toggleBtn.addEventListener("click", () => {
    panel.classList.toggle("open");
  });
  panelClose.addEventListener("click", () => {
    panel.classList.remove("open");
  });
  festSwitch.addEventListener("change", () => {
    state.enabled = festSwitch.checked;
    saveState();
    updateUI();
  });
  festGrid.addEventListener("click", (e) => {
    const option = e.target.closest(".festival-option");
    if (!option) return;
    state.festival = option.dataset.festival;
    state.enabled = true;
    saveState();
    updateUI();
  });
  document.addEventListener("click", (e) => {
    if (
      !panel.contains(e.target) &&
      !toggleBtn.contains(e.target) &&
      panel.classList.contains("open")
    ) {
      panel.classList.remove("open");
    }
  });

  // Initialize
  updateUI();
})();
