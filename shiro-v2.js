/* ========== SHIRO IT v2 — Main JavaScript ========== */

// Backend API base URL — auto-detect:
// In production (Render/Flask serving the HTML), use the same origin.
// For local dev with a separate Flask server, fall back to localhost:5000.
// Backup API_BASE for local dev via file:// protocol
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
  ? 'http://localhost:5000'
  : window.location.origin;

function resolveImagePath(path) {
  if (!path || typeof path !== 'string' || !path.includes('/')) return path;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return API_BASE + cleanPath;
}

document.addEventListener("DOMContentLoaded", () => {
  /* ===== SPA NAVIGATION ===== */
  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll("[data-page]");
  const navMenu = document.getElementById("navMenu");

  window.navigateTo = function(pageId) {
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
    // Close mobile menu (the full close function is defined further below,
    // so we do it inline here to keep order-independence)
    if (navMenu) navMenu.classList.remove("open");
    const _mt = document.getElementById("menuToggle");
    if (_mt) {
      const _mti = _mt.querySelector("i");
      if (_mti) _mti.className = "fas fa-bars";
    }
    const _ov = document.getElementById("navOverlay");
    if (_ov) _ov.classList.remove("active");
    // Trigger animations
    setTimeout(() => runScrollAnimations(), 300);
    // Update URL hash
    history.pushState(null, "", "#" + pageId);
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-page]");
    if (!link) return;

    e.preventDefault();
    const rawTarget = link.getAttribute("data-page") || link.getAttribute("href") || "";
    let cleanTarget = rawTarget.replace("#", "");
    
    // Alias mapping for Careers
    if (cleanTarget === 'jobs') cleanTarget = 'contact#careers-section';

    const [pageId, sectionId] = cleanTarget.split("#"); 

    // Actually, let's just support simple pageId and then handle section if # is in href
    const page = pageId || link.getAttribute("data-page");
    const href = link.getAttribute("href") || "";
    const section = sectionId || (href.includes("#") ? href.split("#")[1] : null);
    
    if (page) {
        window.navigateTo(page);
        
        // Handle section scroll if present
        if (section && section !== page) {
            setTimeout(() => {
                const targetEl = document.getElementById(section);
                if (targetEl) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight || 80;
                    window.scrollTo({
                        top: targetEl.offsetTop - navbarHeight,
                        behavior: 'smooth'
                    });
                }
            }, 400);
            return; // skip the default merged logic below
        }

        // Custom scroll for merged page (legacy handling for specific nav links)
        if (page === 'build-pc-services') {
            if (link.innerHTML.includes('nav_services') || href === '#services') {
                setTimeout(() => {
                    const servicesSection = document.getElementById('services-content');
                    if (servicesSection) {
                        const navbarHeight = document.querySelector('.navbar').offsetHeight || 80;
                        window.scrollTo({
                            top: servicesSection.offsetTop - navbarHeight,
                            behavior: 'smooth'
                        });
                    }
                }, 350);
            } else {
                setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 350);
            }
        }
    }
  });

  // Handle browser back/forward
  window.addEventListener("popstate", () => {
    const hash = window.location.hash.replace("#", "") || "home";
    navigateTo(hash);
  });

  // Load initial page from hash
  const initialPage = window.location.hash.replace("#", "") || "home";
  if (initialPage !== "home") navigateTo(initialPage);

  /* ===== SITE SETTINGS & FESTIVALS ===== */
  async function applySiteSettings() {
    try {
      const res = await fetch(API_BASE + '/api/site_settings');
      const d = await res.json();
      if (d.success && d.data) {
        const settings = d.data;
        
        // 1. Handle Festival Effects
        const festival = settings.active_festival || 'none';
        if (festival !== 'none') {
          // Load the festival CSS if not already present
          if (!document.getElementById('festival-css')) {
            const link = document.createElement('link');
            link.id = 'festival-css';
            link.rel = 'stylesheet';
            link.href = '/festivals/festival.css';
            document.head.appendChild(link);
          }
          // Load the specific festival JS
          const script = document.createElement('script');
          script.src = `/festivals/${festival}.js`;
          document.body.appendChild(script);
        }
        
        window.siteSettings = settings;
        // If settings specify a duration, update the global interval
        if (settings.hero_slide_duration) {
          window.heroInterval = parseInt(settings.hero_slide_duration) * 1000;
        }
      }
    } catch (err) {
      console.warn('Failed to load site settings:', err);
    }
  }
  window.heroInterval = 8000; // Default
  applySiteSettings();

  async function loadHeroSlides() {
    const track = document.getElementById("heroSliderTrack");
    if (!track) return;

    try {
      const res = await fetch(API_BASE + '/api/hero_slides');
      const d = await res.json();
      if (d.success && d.data && d.data.length > 0) {
        track.innerHTML = d.data.map((slide, index) => {
          const mediaUrl = slide.media_url.startsWith('http') ? slide.media_url : API_BASE + slide.media_url;
          let mediaHtml = '';
          
          if (slide.media_type === 'video') {
            mediaHtml = `<video class="slide-poster-video" autoplay muted loop playsinline><source src="${mediaUrl}" type="video/mp4"></video>`;
          } else {
            mediaHtml = `<img src="${mediaUrl}" alt="${slide.title}" class="slide-poster-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`;
          }

          const pageTarget = (slide.target_page || 'home').split('#')[0];
          return `
            <div class="hero-slide hero-slide-poster ${index === 0 ? 'active' : ''}" 
                 data-page="${pageTarget}" 
                 style="cursor: pointer; --slide-img: url('${mediaUrl}');">
              <div class="slide-poster-backdrop"></div>
              ${mediaHtml}
              <div class="slide-poster-fallback">
                <div class="slide-poster-icon"><i class="fas ${slide.media_type === 'video' ? 'fa-video' : 'fa-desktop'}"></i></div>
                <h3>${slide.title ? slide.title.replace('\n', '<br>') : ''}</h3>
                <p>${slide.subtitle || ''}</p>
                <div class="btn btn-primary btn-sm">
                  <i class="fas fa-arrow-right"></i> ${slide.button_text || (currentLang === 'bm' ? 'Ketahui Lanjut' : 'Learn More')}
                </div>
              </div>
            </div>`;
        }).join('');
        
        // Re-initialize slider logic
        initHeroSlider();
      } else {
        // Fallback if no slides exist in DB
        track.innerHTML = `
          <div class="hero-slide hero-slide-poster active">
            <img src="images/banners/slide-1.jpg" alt="Welcome to SHIRO IT" class="slide-poster-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="slide-poster-fallback">
              <div class="slide-poster-icon"><i class="fas fa-desktop"></i></div>
              <h3>Welcome to<br><span class="gradient-text">SHIRO IT</span></h3>
              <p>Your one-stop destination for Premium PC Builds and IT Services.</p>
              <a href="#build-pc-services" data-page="build-pc-services" class="btn btn-primary btn-sm"><i class="fas fa-gamepad"></i> Explore Now</a>
            </div>
          </div>`;
        // Re-initialize slider logic even for fallback (hides arrows if count=1)
        initHeroSlider();
      }
    } catch (err) {
      console.error('Failed to load hero slides:', err);
    }
  }
  loadHeroSlides();

  /* ===== MOBILE MENU ===== */
  const menuToggle = document.getElementById("menuToggle");
  const navOverlay = document.getElementById("navOverlay");

  function closeMobileMenu() {
    navMenu.classList.remove("open");
    if (navOverlay) navOverlay.classList.remove("active");
    menuToggle.querySelector("i").className = "fas fa-bars";
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      const icon = menuToggle.querySelector("i");
      if (icon) icon.className = isOpen ? "fas fa-times" : "fas fa-bars";
      if (navOverlay) navOverlay.classList.toggle("active", isOpen);
    });
  }

  // Close menu when tapping the backdrop overlay
  if (navOverlay) {
    navOverlay.addEventListener("click", closeMobileMenu);
  }

  // Mobile dropdowns (updated breakpoint to match CSS: 1024px)
  document.querySelectorAll(".dropdown > a").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        trigger.parentElement.classList.toggle("open");
      }
    });
  });

  /* ===== NAVBAR SCROLL ===== */
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 50);
  });

  /* ===== THEME TOGGLE ===== */
  const themeToggle = document.getElementById("themeToggle");
  let savedTheme = localStorage.getItem("shiro-theme");
  if (!savedTheme) {
    savedTheme = "dark";
    localStorage.setItem("shiro-theme", "dark");
  }

  if (themeToggle) {
    const themeIcon = themeToggle.querySelector("i");
    if (themeIcon) {
      if (savedTheme === "light") {
        document.body.classList.add("light");
        themeIcon.className = "fas fa-sun";
      } else {
        document.body.classList.remove("light");
        themeIcon.className = "fas fa-moon";
      }
    }

    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light");
      const isLight = document.body.classList.contains("light");
      if (themeIcon) {
        themeIcon.className = isLight ? "fas fa-sun" : "fas fa-moon";
      }
      localStorage.setItem("shiro-theme", isLight ? "light" : "dark");
    });
  }

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
      contact_form_title: "Taklimat Misi",
      contact_form_badge: "Inkuiri Rasmi",
      contact_form_desc: "Terbaik untuk spesifikasi binaan custom, perkongsian perniagaan, atau sebut harga rasmi yang memerlukan rekod terperinci.",
      contact_field_name: "Nama",
      contact_field_email: "Emel",
      contact_field_phone: "Telefon (Pilihan)",
      contact_field_subject: "Subjek",
      contact_field_msg: "Ringkasan Mesej",
      contact_ph_identity: "Identiti",
      contact_ph_link: "Pautan Komunikasi",
      contact_ph_objective: "Pilih Objektif",
      contact_ph_brief: "Gariskan keperluan projek anda atau soalan khusus...",
      contact_transmit: "HANTAR MESEJ",
      contact_intel_badge: "Respon Terpantas",
      contact_intel_title: "Perisikan Terus",
      contact_intel_desc: "Untuk bantuan segera, ketersediaan stok, atau soalan teknikal pantas. Hubungi pasukan kami secara terus.",
      contact_whatsapp_btn: "SEMBANG DI WHATSAPP",
      contact_stat_resp: "Purata 30min",
      contact_stat_live: "Sokongan Langsung",
      contact_hours_title: "Waktu Operasi",
      contact_hours_sun: "Tutup",
      contact_timezone: "Kuala Lumpur (GMT+8)",
      contact_find_badge: "Cari Kami",
      contact_loc1: "Lokasi",
      contact_loc2: "Kami",
      careers_badge: "Kerjaya",
      careers_h2_1: "Sertai",
      careers_h2_2: "Pasukan Kami",
      // Language
      language_english: "English",
      language_bm: "Bahasa Malaysia",
      // Shop
      shop_in_stock: "dalam stok",
      shop_only_left: "Tinggal 1 sahaja!",
      shop_add_cart: "Tambah ke Troli",
      shop_ask_price: "Tanya Harga",
      cat_all: "Semua",
      cat_gaming_pcs: "PC Gaming",
      cat_laptops: "Laptop",
      cat_components: "Komponen",
      cat_peripherals: "Aksesori",
      cat_monitors: "Monitor",
      cat_networking: "Rangkaian",
      cat_custom: "Binaan Custom",
      cat_other: "Lain-lain",
      // WhatsApp
      wa_order_intro: "Hai SHIRO IT! Saya ingin membuat pesanan:\n\n",
      wa_order_total: "Jumlah: RM ",
      wa_order_outro: "\n\nSila sahkan ketersediaan. Terima kasih!",
      // Cart
      cart_title: "Troli Anda",
      cart_empty: "Troli anda kosong",
      cart_browse: "Lihat Kedai",
      cart_checkout: "Tempah di WhatsApp",
      cart_total: "Jumlah Besar",
    },
  };

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("shiro-lang", lang);
    const flag = document.getElementById("currentFlag");
    const langText = document.getElementById("currentLanguage");
    if (lang === "bm") {
      if (flag) flag.className = "fi fi-my";
      if (langText) langText.textContent = "BM";
    } else {
      if (flag) flag.className = "fi fi-us";
      if (langText) langText.textContent = "EN";
    }
    document.querySelectorAll("[data-translate]").forEach((el) => {
      const key = el.getAttribute("data-translate");
      if (lang === "bm" && translations.bm[key]) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = translations.bm[key];
        } else {
          el.textContent = translations.bm[key];
        }
      } else if (lang === "en") {
        if (el.dataset.originalText) {
          if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
            el.placeholder = el.dataset.originalText;
          } else {
            el.textContent = el.dataset.originalText;
          }
        }
      }
    });
    langDropdown.classList.remove("open");
  }

  // Store original texts
  document.querySelectorAll("[data-translate]").forEach((el) => {
    el.dataset.originalText = (el.tagName === "INPUT" || el.tagName === "TEXTAREA") ? el.placeholder : el.textContent;
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
  let products = [];

  const productsGrid = document.getElementById("productsGrid");
  const emptyState = document.getElementById("emptyState");
  const categoryTabs = document.querySelectorAll(".cat-tab");
  const sortSelect = document.getElementById("sortSelect");
  let activeCategory = "All";
  let activeBrand    = "All";

  function renderProducts() {
    if (!productsGrid) return;
    let filtered = products.filter(
      (p) => activeCategory === "All" || p.category === activeCategory,
    );
    // Filter by brand
    if (activeBrand !== "All") {
      filtered = filtered.filter((p) => p.brand === activeBrand);
    }
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
      
      let displayCategory = p.category;
      let displayStock = "";
      let displayPrice = p.price > 0 ? "RM " + p.price.toLocaleString() : "Ask for Price";
      let displayBtn = "Add to Cart";

      if (currentLang === 'bm') {
        const catKey = "cat_" + p.category.toLowerCase().replace(/\s+/g, '_');
        displayCategory = translations.bm[catKey] || p.category;
        displayBtn = translations.bm.shop_add_cart;
        if (p.price <= 0) displayPrice = translations.bm.shop_ask_price;
        
        if (p.stock > 1) displayStock = `${p.stock} ${translations.bm.shop_in_stock}`;
        else if (p.stock === 1) displayStock = translations.bm.shop_only_left;
      } else {
        if (p.stock > 1) displayStock = `${p.stock} in stock`;
        else if (p.stock === 1) displayStock = "Only 1 left!";
      }

      card.innerHTML = `
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ""}
        <div class="product-image">
          ${p.image && (p.image.startsWith('/') || p.image.startsWith('http'))
            ? `<img src="${resolveImagePath(p.image)}" alt="${p.name}" style="width:100%; height:100%; object-fit:contain;">`
            : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:2.5rem;">${getCategoryIcon(p.category)}</div>`}
        </div>
        <div class="product-category">${displayCategory}</div>
        <h3>${p.name}</h3>
        <p class="product-specs">${p.specs}</p>
        ${p.health ? `<p class="product-health"><i class="fas fa-heartbeat"></i> Health: ${p.health}</p>` : ""}
        ${displayStock ? `<p class="product-stock"><i class="fas fa-boxes"></i> ${displayStock}</p>` : ""}
        <div class="product-bottom">
          <div class="product-price">${p.price > 0 ? "RM " + p.price.toLocaleString() : `<span style="color:var(--accent-blue);font-size:0.85em;">${displayPrice}</span>`}</div>
          <button class="btn btn-primary product-btn" onclick="addShopItemToCart(this)">
            <i class="fas fa-cart-plus"></i> ${displayBtn}
          </button>
        </div>
      `;
      productsGrid.appendChild(card);
    });
    // Re-run animations for new cards
    setTimeout(runScrollAnimations, 50);
  }

  /* Render brand filter pills for the shop */
  function renderBrandFilter(category) {
    const bar = document.getElementById('brandFilterBar');
    const row = document.getElementById('brandFilterRow');
    if (!bar || !row) return;
    const pool = category === 'All' ? products : products.filter(p => p.category === category);
    const brands = [...new Set(pool.map(p => p.brand).filter(b => b && b.trim()))];
    if (brands.length < 1) {
      row.style.display = 'none';
      return;
    }
    row.style.display = 'block';
    bar.innerHTML = ['All', ...brands.sort()].map(b =>
      `<button class="brand-pill${activeBrand === b ? ' active' : ''}" data-brand="${b}">${b}</button>`
    ).join('');
    bar.querySelectorAll('.brand-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        activeBrand = btn.dataset.brand;
        bar.querySelectorAll('.brand-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProducts();
      });
    });
  }

  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      categoryTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeCategory = tab.dataset.category;
      activeBrand    = "All";        // reset brand on category change
      renderBrandFilter(activeCategory);
      renderProducts();
    });
  });

  if (sortSelect) sortSelect.addEventListener("change", () => {
    // Basic alphabetical sort for static items if needed
    const allCards = Array.from(productsGrid.querySelectorAll(".product-card"));
    const sort = sortSelect.value;
    
    if (sort === "price-low" || sort === "price-high") {
       allCards.sort((a,b) => {
          const priceA = parseInt(a.querySelector(".product-price").innerText.replace(/[^\d]/g, '')) || 0;
          const priceB = parseInt(b.querySelector(".product-price").innerText.replace(/[^\d]/g, '')) || 0;
          return sort === "price-low" ? priceA - priceB : priceB - priceA;
       });
    } else {
       // Featured sort: cards with .featured class first
       allCards.sort((a,b) => (b.classList.contains("featured") ? 1 : 0) - (a.classList.contains("featured") ? 1 : 0));
    }
    
    allCards.forEach(card => productsGrid.appendChild(card));
  });
  
  // Initial run of animations for static content
  setTimeout(runScrollAnimations, 100);

  /* ===== BUILD PC — Configurator ===== */
  // SVG data URIs for components without photo images
  const SVG_CPU = `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="30" width="60" height="60" rx="4" fill="rgba(37,99,235,0.12)" stroke="rgba(37,99,235,0.6)" stroke-width="2"/><rect x="42" y="42" width="36" height="36" rx="2" fill="rgba(37,99,235,0.08)" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><text x="60" y="64" text-anchor="middle" font-size="14" font-family="monospace" fill="rgba(37,99,235,0.8)">CPU</text><line x1="38" y1="25" x2="38" y2="30" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="25" x2="50" y2="30" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="62" y1="25" x2="62" y2="30" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="74" y1="25" x2="74" y2="30" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="38" y1="90" x2="38" y2="95" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="90" x2="50" y2="95" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="62" y1="90" x2="62" y2="95" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="74" y1="90" x2="74" y2="95" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="25" y1="38" x2="30" y2="38" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="25" y1="50" x2="30" y2="50" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="25" y1="62" x2="30" y2="62" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="25" y1="74" x2="30" y2="74" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="90" y1="38" x2="95" y2="38" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="90" y1="50" x2="95" y2="50" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="90" y1="62" x2="95" y2="62" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="90" y1="74" x2="95" y2="74" stroke="rgba(37,99,235,0.5)" stroke-width="2" stroke-linecap="round"/></svg>`;

  const SVG_MOBO = `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="124" height="84" rx="4" fill="rgba(37,99,235,0.08)" stroke="rgba(37,99,235,0.5)" stroke-width="1.5"/><rect x="16" y="16" width="36" height="32" rx="2" fill="rgba(37,99,235,0.12)" stroke="rgba(37,99,235,0.4)" stroke-width="1" stroke-dasharray="3 2"/><text x="34" y="36" text-anchor="middle" font-size="7" fill="rgba(37,99,235,0.7)" font-family="monospace">CPU</text><rect x="60" y="16" width="72" height="14" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><text x="96" y="26" text-anchor="middle" font-size="6" fill="rgba(239,68,68,0.7)" font-family="monospace">RAM SLOTS</text><rect x="16" y="56" width="52" height="12" rx="2" fill="rgba(37,99,235,0.08)" stroke="rgba(37,99,235,0.35)" stroke-width="1"/><rect x="16" y="72" width="52" height="12" rx="2" fill="rgba(37,99,235,0.08)" stroke="rgba(37,99,235,0.35)" stroke-width="1"/><text x="42" y="64" text-anchor="middle" font-size="5" fill="rgba(37,99,235,0.6)" font-family="monospace">PCIe x16</text><text x="42" y="80" text-anchor="middle" font-size="5" fill="rgba(37,99,235,0.6)" font-family="monospace">PCIe x4</text><rect x="76" y="38" width="18" height="18" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><rect x="100" y="38" width="12" height="12" rx="1" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.4)" stroke-width="1"/><rect x="76" y="60" width="56" height="28" rx="3" fill="rgba(37,99,235,0.06)" stroke="rgba(37,99,235,0.3)" stroke-width="1"/><text x="104" y="77" text-anchor="middle" font-size="6" fill="rgba(37,99,235,0.6)" font-family="monospace">I/O PORTS</text></svg>`;

  const SVG_CASE = `<svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="64" height="104" rx="5" fill="rgba(239,68,68,0.07)" stroke="rgba(239,68,68,0.5)" stroke-width="2"/><rect x="14" y="14" width="52" height="62" rx="3" fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.3)" stroke-width="1" stroke-dasharray="3 3"/><circle cx="40" cy="38" r="14" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.35)" stroke-width="1"/><circle cx="40" cy="38" r="6" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><line x1="40" y1="24" x2="40" y2="30" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><line x1="40" y1="46" x2="40" y2="52" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><line x1="26" y1="38" x2="32" y2="38" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><line x1="48" y1="38" x2="54" y2="38" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><rect x="14" y="82" width="20" height="8" rx="2" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.4)" stroke-width="1"/><rect x="38" y="82" width="28" height="8" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/><rect x="14" y="94" width="52" height="12" rx="2" fill="rgba(37,99,235,0.06)" stroke="rgba(37,99,235,0.25)" stroke-width="1"/><circle cx="20" cy="100" r="2" fill="rgba(37,99,235,0.4)"/><circle cx="28" cy="100" r="2" fill="rgba(37,99,235,0.4)"/></svg>`;

  const SVG_PSU = `<svg viewBox="0 0 130 90" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="114" height="74" rx="5" fill="rgba(37,99,235,0.07)" stroke="rgba(37,99,235,0.5)" stroke-width="2"/><circle cx="38" cy="45" r="22" fill="rgba(37,99,235,0.06)" stroke="rgba(37,99,235,0.35)" stroke-width="1.5"/><circle cx="38" cy="45" r="10" fill="rgba(37,99,235,0.08)" stroke="rgba(37,99,235,0.3)" stroke-width="1"/><line x1="38" y1="23" x2="38" y2="31" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><line x1="38" y1="59" x2="38" y2="67" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><line x1="16" y1="45" x2="24" y2="45" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><line x1="52" y1="45" x2="60" y2="45" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><rect x="72" y="18" width="42" height="7" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><rect x="72" y="30" width="42" height="7" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><rect x="72" y="42" width="42" height="7" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><rect x="72" y="54" width="42" height="7" rx="2" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><text x="93" y="73" text-anchor="middle" font-size="7" fill="rgba(37,99,235,0.6)" font-family="monospace">MODULAR CABLES</text><text x="15" y="82" font-size="8" fill="rgba(37,99,235,0.7)" font-family="monospace">80+ GOLD</text></svg>`;

  const SVG_COOLING = `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="110" height="30" rx="3" fill="rgba(37,99,235,0.07)" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><rect x="5" y="40" width="110" height="30" rx="3" fill="rgba(37,99,235,0.07)" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><rect x="5" y="75" width="110" height="30" rx="3" fill="rgba(37,99,235,0.07)" stroke="rgba(37,99,235,0.4)" stroke-width="1.5"/><circle cx="60" cy="20" r="10" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.5)" stroke-width="1.5"/><circle cx="60" cy="55" r="10" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.5)" stroke-width="1.5"/><circle cx="60" cy="90" r="10" fill="rgba(37,99,235,0.1)" stroke="rgba(37,99,235,0.5)" stroke-width="1.5"/><circle cx="60" cy="20" r="3" fill="rgba(37,99,235,0.4)"/><circle cx="60" cy="55" r="3" fill="rgba(37,99,235,0.4)"/><circle cx="60" cy="90" r="3" fill="rgba(37,99,235,0.4)"/><line x1="30" y1="20" x2="45" y2="20" stroke="rgba(239,68,68,0.5)" stroke-width="1.5"/><line x1="75" y1="20" x2="90" y2="20" stroke="rgba(239,68,68,0.5)" stroke-width="1.5"/><line x1="30" y1="55" x2="45" y2="55" stroke="rgba(239,68,68,0.5)" stroke-width="1.5"/><line x1="75" y1="55" x2="90" y2="55" stroke="rgba(239,68,68,0.5)" stroke-width="1.5"/><line x1="30" y1="90" x2="45" y2="90" stroke="rgba(239,68,68,0.5)" stroke-width="1.5"/><line x1="75" y1="90" x2="90" y2="90" stroke="rgba(239,68,68,0.5)" stroke-width="1.5"/></svg>`;

  let inventoryData = [];
  let cartItems = []; // Current selection in PC Builder
  let globalCart = [];
  try {
    const saved = localStorage.getItem("shiro-global-cart");
    if (saved) globalCart = JSON.parse(saved);
  } catch (e) {
    console.warn("Could not parse global cart:", e);
    globalCart = [];
  }

  const MANDATORY_COMPONENTS = ["CPU", "Motherboard", "RAM", "Storage", "GPU", "Case", "PSU"];
  const COOLING_COMPONENTS = ["Cooling", "AIO Cooling"];

  const componentsList = document.getElementById("componentsList");
  const summaryItems = document.getElementById("summaryItems");
  const summaryTotal = document.getElementById("summaryTotal");
  const whatsappOrder = document.getElementById("whatsappOrder");

  // Modal elements
  const builderModal = document.getElementById("builderModal");
  const builderModalTitle = document.getElementById("builderModalTitle");
  const builderModalSearch = document.getElementById("builderModalSearch");
  const builderModalBody = document.getElementById("builderModalBody");

  const categoryConfigs = [
    { id: "CPU", icon: "fas fa-microchip", color: "#0066FF", svg: SVG_CPU },
    { id: "Motherboard", icon: "fas fa-server", color: "#0066FF", svg: SVG_MOBO },
    { id: "RAM", icon: "fas fa-memory", color: "#0066FF", svg: null },
    { id: "Storage", icon: "fas fa-hdd", color: "#FF0033", svg: null },
    { id: "SSD Laptop", icon: "fas fa-laptop", color: "#FF0033", svg: null },
    { id: "HDD", icon: "fas fa-hdd", color: "#ef4444", svg: null },
    { id: "GPU", icon: "fas fa-film", color: "#FF0033", svg: null },
    { id: "Case", icon: "fas fa-box", color: "#FF0033", svg: SVG_CASE },
    { id: "PSU", icon: "fas fa-bolt", color: "#0066FF", svg: SVG_PSU },
    { id: "Cooling", icon: "fas fa-fan", color: "#FF0033", svg: SVG_COOLING },
    { id: "AIO Cooling", icon: "fas fa-fan", color: "#FF0033", svg: SVG_COOLING },
    { id: "Monitor", icon: "fas fa-desktop", color: "#0066FF", svg: null },
    { id: "Keyboard", icon: "fas fa-keyboard", color: "#FF0033", svg: null },
    { id: "Mouse", icon: "fas fa-mouse", color: "#0066FF", svg: null },
    { id: "Accessories", icon: "fas fa-plus-circle", color: "#FF0033", svg: null },
  ];

  async function fetchInventory() {
    try {
      const res = await fetch(API_BASE + "/api/inventory");
      const d = await res.json();
      if (d.success && d.components && d.components.length > 0) {
        inventoryData = d.components;
        
        // Also update the main Shop products
        products = d.components.map((item, idx) => ({
          id: item.id || idx,
          name: item.name,
          category: item.category,
          brand: item.brand || '',
          price: item.price || 0,
          badge: item.stock > 0 ? (item.featured ? "Featured 🔥" : "In Stock") : "Out of Stock",
          specs: item.specs || (item.category + " | Ask for details"),
          image: item.image || null,
          featured: item.featured || false,
          stock: item.stock || 0,
          health: item.health || null
        }));
        
        console.log("Inventory loaded from DB:", products.length, "items");
        renderProducts();
        renderBrandFilter(activeCategory);
        renderBuilder();
        updateSummary();
      } else {
        inventoryData = [];
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
      inventoryData = [];
    }
  }

  fetchInventory();

  /* ===== DYNAMIC PREBUILT PCs ===== */
  async function loadPrebuiltPCs() {
    const container = document.getElementById('prebuiltPcsContainer');
    if (!container) return;
    try {
      const res = await fetch(API_BASE + '/api/prebuilt_pcs');
      const d = await res.json();
      if (d.success && d.data && d.data.length > 0) {
        container.innerHTML = d.data.map(pc => {
          const photoUrl = pc.photo_url || "";
          const isVideo = pc.media_type === 'video';
          const fullUrl = photoUrl.startsWith('http') ? photoUrl : API_BASE + (photoUrl.startsWith('/') ? photoUrl : '/' + photoUrl);
          
          let mediaHtml = '';
          if (photoUrl) {
            if (isVideo) {
              mediaHtml = `
                <video src="${fullUrl}" autoplay muted loop playsinline></video>
                <div class="video-overlay"><i class="fas fa-play-circle"></i></div>`;
            } else {
              mediaHtml = `<img src="${fullUrl}" alt="${pc.name}">`;
            }
          }
          
          const discountHtml = pc.discount ? `<div class="tier-discount"><i class="fas fa-tag"></i> ${pc.discount}</div>` : '';
          const featuredClass = pc.featured ? ' featured' : '';
          const ribbonHtml = pc.featured ? '<div class="tier-ribbon">★ BEST SELLER</div>' : '';
          const specsHtml = (pc.specs || []).map(s => `<div>${s}</div>`).join('');
          const tagsHtml = (pc.tags || []).map(t => `<span class="tier-tag">${t}</span>`).join('');
          const color = pc.tier_color || '#0066FF';
          
          return `
            <div class="tier-card${featuredClass}" style="--tier-color: ${color};">
              ${ribbonHtml}
              <div class="tier-media-wrapper">
                ${mediaHtml}
              </div>
              <div class="tier-card-content">
                <div class="tier-badge">${pc.tier_badge || ''}</div>
                <div class="tier-name">${pc.tier_name || ''}</div>
                <div class="tier-tags-row">${tagsHtml}</div>
                <h3>${pc.name}</h3>
                <div class="tier-price">RM ${Number(pc.price || 0).toLocaleString()}</div>
                ${discountHtml}
                <div class="tier-specs">${specsHtml}</div>
                <a href="#build-pc-services" data-page="build-pc-services" class="btn btn-primary tier-btn">Configure <i class="fas fa-arrow-right"></i></a>
              </div>
            </div>`;
        }).join('');
        // Re-run nav listeners for new tier buttons
        container.querySelectorAll('[data-page]').forEach(link => {
          link.addEventListener('click', e => {
            e.preventDefault();
            navigateTo(link.getAttribute('data-page'));
          });
        });
        setTimeout(runScrollAnimations, 100);
      } else {
        // Fallback: show a placeholder
        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem;">PC configurations coming soon.</p>';
      }
    } catch (err) {
      console.warn('Failed to load prebuilt PCs from API:', err);
      // Leave blank — content.py may not be registered yet
    }
  }
  loadPrebuiltPCs();

  /* ===== DYNAMIC IT TIPS GALLERY ===== */
  async function loadITTips() {
    const grid = document.getElementById('tipsVideoGrid');
    if (!grid) return;
    try {
      const res = await fetch(API_BASE + '/api/it_tips');
      const d = await res.json();
      if (d.success && d.data && d.data.length > 0) {
        grid.innerHTML = d.data.map(tip => {
          // Resolve relative /uploads/... paths via API_BASE
          const resolveMedia = (url) => {
            if (!url) return '';
            if (url.startsWith('http')) return url;
            return API_BASE + (url.startsWith('/') ? url : '/' + url);
          };
          const mediaUrl = resolveMedia(tip.media_url);

          const ext = (tip.media_url || '').split('.').pop().toLowerCase();
          const mimeMap = { mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg', mov: 'video/mp4', mkv: 'video/mp4' };
          const mimeType = mimeMap[ext] || 'video/mp4';

          const mediaHtml = tip.media_type === 'image'
            ? `<div class="video-wrapper"><img src="${mediaUrl}" alt="${tip.title}"></div>`
            : `<div class="video-wrapper"><video controls preload="metadata"><source src="${mediaUrl}" type="${mimeType}">Your browser does not support video.</video></div>`;
          const tagsHtml = (tip.tags || []).map(t => `<span class="video-tag">${t}</span>`).join('');
          
          return `
            <div class="video-card clickable-tip" data-target="${tip.target_page || 'home'}">
              ${mediaHtml}
              <div class="video-info">
                <h4>${tip.title}</h4>
                <p>${tip.description || ''}</p>
                <div class="video-tags">${tagsHtml}</div>
              </div>
            </div>`;
        }).join('');

        // Add click listeners for navigation
        grid.querySelectorAll('.clickable-tip').forEach(card => {
          card.addEventListener('click', (e) => {
            // Don't navigate if clicking the video controls
            if (e.target.closest('video')) return;
            
            const rawTarget = card.getAttribute('data-target');
            const [pageId, sectionId] = rawTarget.split('#');
            
            navigateTo(pageId);
            
            if (sectionId) {
              setTimeout(() => {
                const targetEl = document.getElementById(sectionId) || document.getElementById('page-' + pageId).querySelector('#' + sectionId);
                if (targetEl) {
                  const navbarHeight = document.querySelector('.navbar').offsetHeight || 80;
                  window.scrollTo({
                    top: targetEl.offsetTop - navbarHeight,
                    behavior: 'smooth'
                  });
                }
              }, 400);
            }
          });
        });
      } else {
        grid.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No tips available yet.</p>';
      }
    } catch (err) {
      console.warn('Failed to load IT Tips from API:', err);
    }
  }
  loadITTips();


  function getCategoryIcon(cat) {
    const icons = {
      'CPU':        'fa-microchip',
      'Motherboard':'fa-server',
      'RAM':        'fa-memory',
      'RAM Laptop': 'fa-memory',
      'Storage':    'fa-hdd',
      'SSD Laptop': 'fa-laptop',
      'HDD':        'fa-hdd',
      'GPU':        'fa-desktop',
      'Case':       'fa-box-open',
      'PSU':        'fa-bolt',
      'AIO Cooling':'fa-fan',
      'Cooling':    'fa-fan',
      'Monitor':    'fa-tv',
      'Keyboard':   'fa-keyboard',
      'Mouse':      'fa-mouse',
      'Accessories':'fa-plug',
    };
    const cls = icons[cat] || 'fa-cog';
    const colors = {
      'CPU':'#3b82f6','Motherboard':'#3b82f6','RAM':'#a855f7','RAM Laptop':'#a855f7',
      'Storage':'#ef4444','SSD Laptop':'#ef4444','HDD':'#ef4444',
      'GPU':'#f59e0b','Case':'#ef4444','PSU':'#3b82f6',
      'AIO Cooling':'#38bdf8','Cooling':'#38bdf8','Monitor':'#22c55e',
      'Keyboard':'#f87171','Mouse':'#38bdf8','Accessories':'#94a3b8',
    };
    const col = colors[cat] || '#94a3b8';
    return `<i class="fas ${cls}" style="color:${col};"></i>`;
  }

  function getCategoryConfig(cat) {
    return categoryConfigs.find((c) => c.id === cat) || { id: cat, icon: "fas fa-cog", color: "#888", svg: null };
  }

  function renderBuilder() {
    if (!componentsList) return;
    componentsList.innerHTML = "";

    // Group cart items by category
    const cartByCategory = {};
    cartItems.forEach((item, index) => {
      if (!cartByCategory[item.category]) cartByCategory[item.category] = [];
      cartByCategory[item.category].push({ ...item, cartIndex: index });
    });

    // Default categories to show empty slots for if nothing selected
    const initialCategories = ["CPU", "Motherboard", "RAM", "Storage", "GPU", "Case", "PSU", "AIO Cooling", "Cooling", "Monitor", "Keyboard", "Mouse", "Accessories"];
    initialCategories.forEach((cat) => {
      if (!cartByCategory[cat]) cartByCategory[cat] = [];
    });

    // Render each category block
    Object.keys(cartByCategory).forEach((cat, i) => {
      const itemsInCat = cartByCategory[cat];
      const cfg = getCategoryConfig(cat);

      const group = document.createElement("div");
      group.className = "card component-group";

      let itemsHTML = itemsInCat.map(
        (item) => `
        <div class="comp-option active" style="justify-content: space-between; cursor: default;">
          <div>
            <span class="opt-name">${item.name}</span>
            <span class="opt-price" style="display:block; font-size:0.8rem; margin-top:2px;">RM ${item.price.toLocaleString()}</span>
          </div>
          <div style="display:flex; gap:0.5rem; flex-shrink:0;">
            <button class="btn btn-ghost" style="padding:0.4rem; font-size:0.8rem;" onclick="removeCartItem(${item.cartIndex})"><i class="fas fa-trash" style="color:var(--accent-red)"></i></button>
          </div>
        </div>
      `
      ).join("");

      if (itemsInCat.length === 0) {
        itemsHTML = `<div style="padding: 1rem; color: var(--text-secondary); font-size: 0.9rem; font-style: italic;">No ${cat} selected</div>`;
      }

      group.innerHTML = `
        ${
          cfg.svg
            ? `<div class="comp-img-wrap">${cfg.svg}</div>`
            : `<div class="comp-img-wrap" style="display:flex;align-items:center;justify-content:center;font-size:3rem;color:${cfg.color}50;"><i class="${cfg.icon}"></i></div>`
        }
        <div class="comp-header">
          <div class="comp-icon" style="color:${cfg.color}; background:${cfg.color}20;">
            <i class="${cfg.icon}"></i>
          </div>
          <div>
            <h4>${cat}</h4>
          </div>
          <button class="btn btn-ghost" style="padding:0.4rem 0.8rem; font-size:0.8rem; color:${cfg.color}" onclick="toggleInline('${cat}')">
            <i class="fas fa-search"></i> Browse
          </button>
        </div>
        <div class="comp-options" style="grid-template-columns: 1fr; gap:0.5rem;">${itemsHTML}</div>
        <div id="inline-${cat}" class="inline-selector" style="${itemsInCat.length === 0 ? 'display:block' : 'display:none'}">
          <div class="inline-selector-header">
            <h5>Available ${cat}s</h5>
          </div>
          <div class="inline-options-list">
            ${renderInlineOptions(cat)}
          </div>
        </div>
      `;
      componentsList.appendChild(group);
    });
  }

  window.toggleInline = function(category) {
    const el = document.getElementById(`inline-${category}`);
    if (el) {
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
  };

  function renderInlineOptions(category, selectedBrand = 'All') {
    let items = inventoryData
      .filter(c => c.category === category);

    // Derive unique brands for this category
    const brands = [...new Set(items.map(i => i.brand || '').filter(b => b.trim()))].sort();
    const brandFilterHtml = brands.length > 0
      ? `<div class="brand-pills-build" style="display:flex;gap:0.4rem;flex-wrap:wrap;padding:0.5rem 0 0.75rem;">
           ${['All', ...brands].map(b => `
             <button onclick="filterBuildBrand('${CSS.escape(category)}', '${b}', this)" style="
               padding:0.25rem 0.75rem;border-radius:20px;font-size:0.78rem;cursor:pointer;
               border:1px solid ${selectedBrand===b ? 'var(--blue)' : 'rgba(255,255,255,0.15)'};
               background:${selectedBrand===b ? 'rgba(0,102,255,0.15)' : 'transparent'};
               color:${selectedBrand===b ? 'var(--blue)' : 'var(--text-secondary)'};
               font-weight:${selectedBrand===b ? '600' : '400'};
               transition:all 0.2s;">${b}</button>`).join('')}
         </div>` : '';

    if (selectedBrand !== 'All') {
      items = items.filter(i => (i.brand || '') === selectedBrand);
    }
    items = items.sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.name.localeCompare(b.name));

    if (items.length === 0) {
      return brandFilterHtml + `<p style="font-size:0.8rem; color:var(--text-secondary); text-align:center; padding:1rem;">No ${category}s available${selectedBrand !== 'All' ? ' for ' + selectedBrand : ' at the moment'}.</p>`;
    }

    return brandFilterHtml + items.map(item => {
      const itemId = item.id || item._id;
      const isSelected = cartItems.some(ci => ci.id === itemId);
      
      const displayImage = item.image && item.image.includes('/') 
        ? `<img src="${resolveImagePath(item.image)}" alt="${item.name}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">`
        : `<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.04);border-radius:6px;font-size:1.2rem;">${getCategoryIcon(category)}</div>`;
      
      return `
      <div class="inline-item" ${!isSelected ? `onclick="addInlineItem('${itemId}', '${category}')"` : ''} style="${isSelected ? 'opacity:0.6; cursor:default; border-color:var(--border-color);' : ''}">
        <div style="display:flex; align-items:center; gap:1rem;">
          ${displayImage}
          <div class="inline-item-info">
            <h4>${item.name} ${item.featured ? "<i class='fas fa-star' style='color:var(--accent-yellow);font-size:0.7rem;'></i>" : ""}</h4>
            <p>${item.brand ? '<span style="color:var(--text-secondary);font-size:0.75rem;">' + item.brand + '</span> &bull; ' : ''}${item.specs || ""}</p>
          </div>
        </div>
        <div class="inline-item-action">
          <span class="inline-item-price">RM ${item.price.toLocaleString()}</span>
          <div class="inline-add-btn" style="${isSelected ? 'background:#22c55e; color:white;' : ''}">
            <i class="fas ${isSelected ? 'fa-check' : 'fa-plus'}"></i>
          </div>
        </div>
      </div>
    `}).join("");
  }

  /* Allow Build PC brand filter buttons to re-render inline options */
  window.filterBuildBrand = function(category, brand) {
    const list = document.querySelector(`#inline-${category} .inline-options-list`);
    if (list) list.innerHTML = renderInlineOptions(category, brand);
  };


  window.addInlineItem = function(itemId, category) {
    const item = inventoryData.find(c => String(c.id || c._id) === String(itemId));
    if (item) {
      cartItems.push({
        id: item._id || item.id,
        name: item.name,
        category: item.category,
        price: item.price
      });
      showToast(`${item.name} added to your build!`, "success");
      renderBuilder();
      updateSummary();
    }
  };

  window.openSelector = function (category) {
    if (!builderModal) return;
    builderModalTitle.textContent = category === "All" ? "Select Component" : "Select " + category;
    builderModal.dataset.filterCategory = category;
    builderModalSearch.value = "";
    
    // Sort items so featured items show first, otherwise alphabetically
    const filtered = inventoryData
          .filter(c => category === "All" || c.category === category)
          .sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.name.localeCompare(b.name));
    
    renderSelectorItems(filtered);
    builderModal.classList.add("show");
  };

  function renderSelectorItems(items) {
    builderModalBody.innerHTML = "";
    if (items.length === 0) {
      builderModalBody.innerHTML = "<p style='color:var(--text-secondary); text-align:center;'>No components found in this category.</p>";
      return;
    }

    items.forEach(item => {
      const el = document.createElement("div");
      el.className = "builder-item";
      
      el.innerHTML = `
        <div style="display:flex; align-items:center; gap:1rem;">
          ${item.image && item.image.includes('/') 
            ? `<img src="${resolveImagePath(item.image)}" alt="${item.name}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">`
            : `<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.04);border-radius:6px;font-size:1.1rem;">${getCategoryIcon(item.category)}</div>`}
          <div class="builder-item-info">
            <h4>${item.name} ${item.featured ? "<i class='fas fa-star' style='color:var(--accent-yellow);font-size:0.8rem;'></i>" : ""}</h4>
            <p>${item.category} ${item.specs ? " | " + item.specs : ""}</p>
          </div>
        </div>
        <div class="builder-item-price">RM ${item.price.toLocaleString()}</div>
      `;
      el.onclick = () => {
        cartItems.push({
          id: item._id || item.id,
          name: item.name,
          category: item.category,
          price: item.price
        });
        builderModal.classList.remove("show");
        renderBuilder();
        updateSummary();
      };
      builderModalBody.appendChild(el);
    });
  }

  if(builderModalSearch) {
    builderModalSearch.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const cat = builderModal.dataset.filterCategory;
        const filtered = inventoryData.filter(c => {
           if(cat !== "All" && c.category !== cat) return false;
           return c.name.toLowerCase().includes(query) || (c.specs && c.specs.toLowerCase().includes(query));
        });
        renderSelectorItems(filtered);
    });
  }

  if (document.getElementById("builderModalClose")) {
    document.getElementById("builderModalClose").addEventListener("click", () => {
      builderModal.classList.remove("show");
    });
  }

  window.removeCartItem = function (index) {
    cartItems.splice(index, 1);
    renderBuilder();
    updateSummary();
  };

  function updateSummary() {
    if (!summaryItems) return;
    summaryItems.innerHTML = "";
    let total = 0;

    cartItems.forEach((opt) => {
      total += opt.price;
      const item = document.createElement("div");
      item.className = "summary-item";
      item.innerHTML = `
        <span class="summary-cat">${opt.category}</span>
        <span class="summary-name">${opt.name}</span>
        <span class="summary-price">RM ${opt.price.toLocaleString()}</span>
      `;
      summaryItems.appendChild(item);
    });

    if (cartItems.length === 0) {
      summaryItems.innerHTML = `<div style="text-align:center; color:var(--text-secondary); font-size:0.9rem; padding: 1rem 0;">Selection is empty.</div>`;
    }

    summaryTotal.textContent = "RM " + total.toLocaleString();

    // Validation
    const validation = validateBuild();
    
    // UI Feedback for validation
    const summaryCard = document.querySelector('.summary-card');
    if (summaryCard) {
      let validationEl = document.getElementById('buildValidation');
      if (!validationEl) {
        validationEl = document.createElement('div');
        validationEl.id = 'buildValidation';
        summaryCard.insertBefore(validationEl, whatsappOrder);
      }
      
      if (validation.isValid) {
        validationEl.innerHTML = `<div class="validation-msg success"><i class="fas fa-check-circle"></i> Complete Build! Ready to add to cart.</div>`;
        if(whatsappOrder) {
          whatsappOrder.innerHTML = `<i class="fas fa-cart-plus"></i> Add Build to Cart`;
          whatsappOrder.classList.remove('disabled');
          whatsappOrder.style.opacity = "1";
          whatsappOrder.style.pointerEvents = "auto";
        }
      } else {
        validationEl.innerHTML = `
          <div class="validation-msg error">
            <i class="fas fa-exclamation-triangle"></i> Incomplete Build
            <ul class="missing-list">
              ${validation.missing.map(m => `<li>Missing ${m}</li>`).join('')}
            </ul>
          </div>
        `;
        if(whatsappOrder) {
          whatsappOrder.innerHTML = `<i class="fas fa-lock"></i> Incomplete Build`;
          whatsappOrder.classList.add('disabled');
          whatsappOrder.style.opacity = "0.5";
          whatsappOrder.style.pointerEvents = "none";
        }
      }
    }

    // Build WhatsApp message (legacy or for direct order later)
    const lines = cartItems.map((opt) => `• ${opt.category}: ${opt.name} (RM ${opt.price.toLocaleString()})`);
    const msg = encodeURIComponent(
      `Hi SHIRO IT! I'd like to order a custom PC build:\n\n${lines.length > 0 ? lines.join("\n") : "Empty Build"}\n\nTotal: RM ${total.toLocaleString()}\n\nPlease confirm availability and delivery time. Thank you!`
    );
    // We'll handle the click in the event listener instead of href
    if(whatsappOrder) whatsappOrder.dataset.msg = msg;

    // Store build config for cart
    if(whatsappOrder) {
      whatsappOrder._buildConfig = {
        items: [...cartItems],
        total: total,
        timestamp: new Date().toISOString()
      };
    }
  }

  function validateBuild() {
    const selectedCats = new Set(cartItems.map(item => item.category));
    const missing = [];

    MANDATORY_COMPONENTS.forEach(cat => {
      if (!selectedCats.has(cat)) missing.push(cat);
    });

    return {
      isValid: missing.length === 0,
      missing: missing
    };
  }

  function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
      const itemsCount = globalCart.length;
      badge.textContent = itemsCount;
      badge.style.display = itemsCount > 0 ? "flex" : "none";
    }
  }

  window.addToGlobalCart = function(item) {
    globalCart.push(item);
    localStorage.setItem("shiro-global-cart", JSON.stringify(globalCart));
    updateCartBadge();
    showToast(`${item.name} added to cart!`, "success");
    renderGlobalCart();
  };

  // Cart UI Logic
  const cartOverlay = document.getElementById('cartOverlay');
  const cartOpenBtn = document.getElementById('cartOpenBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartBody = document.getElementById('cartBody');
  const cartGrandTotal = document.getElementById('cartGrandTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (cartOpenBtn) {
    cartOpenBtn.addEventListener('click', () => {
      cartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      renderGlobalCart();
    });
  }

  if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', () => {
      cartOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', (e) => {
      if (e.target === cartOverlay) cartCloseBtn.click();
    });
  }

  if (whatsappOrder) {
    whatsappOrder.addEventListener("click", () => {
      if (whatsappOrder.classList.contains("disabled")) return;
      const cfg = whatsappOrder._buildConfig;
      if (!cfg || cfg.items.length === 0) {
        showToast("Your build is empty!", "error");
        return;
      }
      
      addToGlobalCart({
        type: 'build',
        name: 'Custom PC Build',
        price: cfg.total,
        items: cfg.items,
        id: 'build-' + Date.now()
      });
      
      // Optionally open the cart right away
      if (cartOpenBtn) cartOpenBtn.click();
      
      // Reset builder after adding to cart
      cartItems = [];
      renderBuilder();
      updateSummary();
    });
  }

  function renderGlobalCart() {
    if (!cartBody) return;
    cartBody.innerHTML = "";
    let grandTotal = 0;

    if (globalCart.length === 0) {
      const emptyText = currentLang === 'bm' ? translations.bm.cart_empty : "Your cart is empty";
      const browseText = currentLang === 'bm' ? translations.bm.cart_browse : "Browse Shop";
      cartBody.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-shopping-basket"></i>
          <p>${emptyText}</p>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('cartCloseBtn').click(); navigateTo('shop');">${browseText}</button>
        </div>
      `;
      cartGrandTotal.textContent = "RM 0";
      return;
    }

    globalCart.forEach((item, index) => {
      grandTotal += item.price;
      const el = document.createElement('div');
      el.className = 'cart-item';
      
      let itemsList = "";
      if (item.type === 'build' && item.items) {
        itemsList = `<div class="cart-build-list">
          ${item.items.map(i => `<div>• ${i.category}: ${i.name}</div>`).join('')}
        </div>`;
      }

      el.innerHTML = `
        <div class="cart-item-header">
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">RM ${item.price.toLocaleString()}</div>
          </div>
          <div class="cart-item-remove" onclick="removeFromGlobalCart(${index})">
            <i class="fas fa-trash"></i>
          </div>
        </div>
        ${itemsList}
      `;
      cartBody.appendChild(el);
    });

    cartGrandTotal.textContent = "RM " + grandTotal.toLocaleString();
  }

  window.removeFromGlobalCart = function(index) {
    globalCart.splice(index, 1);
    localStorage.setItem("shiro-global-cart", JSON.stringify(globalCart));
    updateCartBadge();
    renderGlobalCart();
  };

  // Build the WhatsApp message from current cart
  function buildCartWhatsAppMessage() {
    let intro = currentLang === 'bm' ? translations.bm.wa_order_intro : "Hi SHIRO IT! I'd like to place an order:\n\n";
    let totalLabel = currentLang === 'bm' ? translations.bm.wa_order_total : "Total: RM ";
    let outro = currentLang === 'bm' ? translations.bm.wa_order_outro : "\n\nPlease confirm availability. Thank you!";
    let message = intro;
    globalCart.forEach((item, idx) => {
      message += `${idx + 1}. ${item.name} (RM ${item.price.toLocaleString()})\n`;
      if (item.type === 'build' && item.items) {
        item.items.forEach(i => { message += `   - ${i.category}: ${i.name}\n`; });
      }
      message += "\n";
    });
    const total = globalCart.reduce((sum, item) => sum + item.price, 0);
    message += `${totalLabel}${total.toLocaleString()}${outro}`;
    return { message, total };
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (globalCart.length === 0) return;
      // Open the info modal instead of going straight to WhatsApp
      document.getElementById('checkoutInfoOverlay').style.display = 'flex';
      document.getElementById('checkoutInfoForm').reset();
      const ciMsg = document.getElementById('ci-msg');
      if (ciMsg) { ciMsg.style.display = 'none'; ciMsg.textContent = ''; }
    });
  }

  // Handle checkout info form submission
  const checkoutInfoForm = document.getElementById('checkoutInfoForm');
  if (checkoutInfoForm) {
    checkoutInfoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name  = document.getElementById('ci-name').value.trim();
      const phone = document.getElementById('ci-phone').value.trim();
      const email = document.getElementById('ci-email').value.trim();
      const ciMsg = document.getElementById('ci-msg');
      const submitBtn = checkoutInfoForm.querySelector('[type="submit"]');
      if (!name || !phone) { return; }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

      const { message, total } = buildCartWhatsAppMessage();

      // Build the quote payload
      const buildItems = globalCart.filter(i => i.type === 'build').flatMap(i => i.items || []);
      const shopItems  = globalCart.filter(i => i.type === 'product').map(i => ({ name: i.name, price: i.price }));
      const buildConfig = [...buildItems, ...shopItems];

      try {
        await fetch(API_BASE + '/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name, phone,
            email: email || `${phone}@whatsapp.com`,
            build_config: buildConfig,
            total_price: total,
            notes: 'Submitted via website cart checkout'
          })
        });
      } catch (err) {
        console.warn('Quote save failed (non-blocking):', err);
      }

      // Always open WhatsApp regardless of save result
      document.getElementById('checkoutInfoOverlay').style.display = 'none';
      window.open(`https://wa.me/60177617672?text=${encodeURIComponent(message)}`, '_blank');

      // Reset cart after checkout
      globalCart = [];
      localStorage.setItem('shiro-global-cart', '[]');
      updateCartBadge();
      renderGlobalCart();
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Save & Open WhatsApp';
    });
  }

  window.addShopItemToCart = function(btn) {
    const card = btn.closest('.product-card');
    if (!card) return;
    
    const name = card.querySelector('h3').textContent;
    const priceText = card.querySelector('.product-price').textContent;
    const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
    
    addToGlobalCart({
      type: 'product',
      name: name,
      price: price,
      id: 'prod-' + Date.now()
    });
  };


  // Initial updates
  updateCartBadge();
  fetchInventory();

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
  (async function () {
    const track = document.getElementById("tsliderTrack");
    const dotsEl = document.getElementById("tsliderDots");
    const btnPrev = document.getElementById("tsliderPrev");
    const btnNext = document.getElementById("tsliderNext");
    if (!track) return;

    try {
      const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : window.location.origin;
      const res = await fetch(API + '/api/testimonials');
      const d = await res.json();
      if (d.success && d.data && d.data.length > 0) {
        track.innerHTML = "";
        d.data.forEach(t => {
          const stars = Array(t.rating || 5).fill('<i class="fas fa-star"></i>').join('');
          const avatarHtml = t.image_url 
            ? `<img src="${t.image_url.startsWith('http') ? t.image_url : (t.image_url.startsWith('/') ? t.image_url : '/'+t.image_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
            : `<div class="author-avatar" style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:var(--card-bg-hover);border-radius:50%;color:var(--neon-blue);font-weight:bold">${t.name.charAt(0).toUpperCase()}</div>`;
          
          const slide = document.createElement("div");
          slide.className = "card testimonial-card tslide";
          slide.innerHTML = `
            <div class="testimonial-stars">${stars}</div>
            <p>"${t.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}"</p>
            <div class="testimonial-author">
                <div style="width:40px;height:40px;margin-right:1rem;flex-shrink:0;">${avatarHtml}</div>
                <div><strong>${t.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</strong><span>${t.role.replace(/</g, "&lt;").replace(/>/g, "&gt;") || 'Customer'}</span></div>
            </div>
          `;
          track.appendChild(slide);
        });
      }
    } catch(e) {
      console.error("Testimonials load failed", e);
    }

    const slides = Array.from(track.querySelectorAll(".tslide"));
    if (slides.length === 0) return;
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
  function initHeroSlider() {
    const track = document.getElementById("heroSliderTrack");
    const dotsEl = document.getElementById("heroSliderDots");
    const btnPrev = document.getElementById("heroSliderPrev");
    const btnNext = document.getElementById("heroSliderNext");
    const progressBar = document.getElementById("heroSliderProgressBar");
    if (!track) return;

    const slides = Array.from(track.querySelectorAll(".hero-slide"));
    if (slides.length <= 1) {
      if (btnPrev) btnPrev.style.display = 'none';
      if (btnNext) btnNext.style.display = 'none';
      if (dotsEl) dotsEl.style.display = 'none';
      return;
    }

    const total = slides.length;
    let current = 0;
    let autoTimer = null;
    const INTERVAL = window.heroInterval || 8000;

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
  }

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
  let rings   = [];
  let stars   = [];
  let comps   = [];
  let nodes   = [];        // ← network nodes
  let mouseX  = 0, mouseY = 0;

  // Track mouse for node attraction
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  /* -- Network nodes (connected particle web) -- */
  function initNodes() {
    nodes = Array.from({ length: 72 }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - 0.5) * 0.55,
      vy:    (Math.random() - 0.5) * 0.55,
      r:     Math.random() * 2 + 1.5,
      col:   Math.random() > 0.5 ? 'a' : 'b',
      pulse: Math.random() * Math.PI * 2,
    }));
  }

  function drawNetwork(p) {
    const MAX_D  = 170;
    const MAX_D2 = MAX_D * MAX_D;

    // Move nodes
    nodes.forEach(n => {
      // Subtle mouse attraction
      const dx = mouseX - n.x, dy = mouseY - n.y;
      const md = Math.sqrt(dx * dx + dy * dy);
      if (md < 220 && md > 0) {
        n.vx += (dx / md) * 0.018;
        n.vy += (dy / md) * 0.018;
      }
      // Speed cap
      const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (spd > 1.4) { n.vx *= 0.94; n.vy *= 0.94; }
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += 0.028;
      // Bounce
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      n.x = Math.max(0, Math.min(W, n.x));
      n.y = Math.max(0, Math.min(H, n.y));
    });

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > MAX_D2) continue;
        const d    = Math.sqrt(d2);
        const t    = 1 - d / MAX_D;          // 0→1 as nodes get closer
        const alpha = t * 0.18;              // subtle lines

        // Use solid color instead of expensive gradient
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = rgba(p[a.col], alpha);
        ctx.lineWidth   = t * 1.2;
        ctx.stroke();

        // Bloom glow on close connections
        if (d < 90) {
          const ca = p[a.col], cb = p[b.col];
          const gt = 1 - d / 90;
          const gr2 = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          gr2.addColorStop(0, rgba(ca, gt * 0.06));
          gr2.addColorStop(1, rgba(cb, gt * 0.06));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = gr2;
          ctx.lineWidth   = gt * 4;
          ctx.stroke();
        }
      }
    }

    // Draw glowing node dots
    nodes.forEach(n => {
      const c    = p[n.col];
      const pls  = Math.sin(n.pulse) * 0.5 + 0.5;
      const gRad = n.r + pls * 5;

      // Radial glow halo
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, gRad * 3);
      grd.addColorStop(0, rgba(c, 0.12 + pls * 0.08));
      grd.addColorStop(1, rgba(c, 0));
      ctx.beginPath();
      ctx.arc(n.x, n.y, gRad * 3, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + pls * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = rgba(c, 0.45 + pls * 0.15);
      ctx.fill();
    });
  }

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
    if (rings.length > 10) return;
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
    if (meteors.length > 15) return;
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
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    mouseX = W / 2;
    mouseY = H / 2;
    initStars();
    initComponents();
    initNodes();
  }

  function draw() {
    const p = palettes();
    ctx.clearRect(0, 0, W, H);

    /* -- Connected node network -- */
    drawNetwork(p);

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
  fetchInventory();

  /* ===== JOB APPLICATION MODAL ===== */
  window.openJobModal = function(position) {
    const titleText = document.getElementById('jobModalPositionText');
    const inputField = document.getElementById('jobPositionInput');
    const overlay = document.getElementById('jobModalOverlay');
    if (titleText) titleText.textContent = position;
    if (inputField) inputField.value = position;
    if (overlay) overlay.style.display = 'flex';
  };

  window.closeJobModal = function() {
    const overlay = document.getElementById('jobModalOverlay');
    const form = document.getElementById('jobApplicationForm');
    const msg = document.getElementById('jobFormMessage');
    if (overlay) overlay.style.display = 'none';
    if (form) form.reset();
    if (msg) msg.style.display = 'none';
  };

  const jobApplicationForm = document.getElementById('jobApplicationForm');
  if (jobApplicationForm) {
    jobApplicationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('jobFormMessage');
      if (msg) {
        msg.style.display = 'block';
        msg.textContent = 'Submitting...';
        msg.style.color = 'var(--text-secondary)';
      }

      const formData = new FormData(jobApplicationForm);

      try {
        const res = await fetch(API_BASE + '/api/job-application', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        
        if (msg) {
          if (data.success) {
            msg.style.color = 'var(--accent, #4ade80)';
            msg.textContent = data.message || 'Application submitted successfully!';
            setTimeout(window.closeJobModal, 3000);
          } else {
            msg.style.color = 'var(--accent-red, #ff4444)';
            msg.textContent = data.error || 'Submission failed.';
          }
        }
      } catch (err) {
        if (msg) {
           msg.style.color = 'var(--accent-red, #ff4444)';
           msg.textContent = 'Network error. Please try again later.';
        }
      }
    });
  }
})();


/* ===== SERVICE BOOKING MODAL ===== */
window.openServiceBooking = function(serviceName) {
  const overlay = document.getElementById('serviceBookingOverlay');
  if (!overlay) return;
  document.getElementById('serviceBookingForm').reset();
  document.getElementById('sb-service').value = serviceName;
  document.getElementById('sb-service-display').value = serviceName;
  clearBookingPhoto();
  const sbMsg = document.getElementById('sb-msg');
  if (sbMsg) { sbMsg.style.display = 'none'; sbMsg.textContent = ''; }
  overlay.classList.add('show');
};

window.clearBookingPhoto = function() {
  const photoInput = document.getElementById('sb-photo');
  const preview = document.getElementById('sb-photo-preview');
  const label = document.getElementById('sb-photo-label');
  if (photoInput) photoInput.value = '';
  if (preview) preview.style.display = 'none';
  if (label) label.textContent = 'Click or drag a photo here';
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('checkoutInfoOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'checkoutInfoOverlay') e.target.style.display = 'none';
  });
  document.getElementById('serviceBookingOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'serviceBookingOverlay') e.target.classList.remove('show');
  });

  const sbPhoto = document.getElementById('sb-photo');
  if (sbPhoto) {
    sbPhoto.addEventListener('change', function() {
      const file = this.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById('sb-photo-img').src = ev.target.result;
        document.getElementById('sb-photo-preview').style.display = 'block';
        document.getElementById('sb-photo-label').textContent = file.name;
      };
      reader.readAsDataURL(file);
    });
  }

  const serviceBookingForm = document.getElementById('serviceBookingForm');
  if (serviceBookingForm) {
    serviceBookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const service  = document.getElementById('sb-service').value;
      const name     = document.getElementById('sb-name').value.trim();
      const phone    = document.getElementById('sb-phone').value.trim();
      const device   = document.getElementById('sb-device')?.value.trim() || '';
      const problem  = document.getElementById('sb-problem')?.value.trim() || '';
      const date     = document.getElementById('sb-date').value;
      const sbMsg    = document.getElementById('sb-msg');
      const submitBtn = document.getElementById('sb-submit-btn') || serviceBookingForm.querySelector('[type="submit"]');

      if (!name || !phone || !problem) {
        if (sbMsg) {
          sbMsg.style.display = 'block';
          sbMsg.style.color = '#ef4444';
          sbMsg.style.background = 'rgba(239,68,68,0.08)';
          sbMsg.textContent = 'Please fill in your name, phone and problem description.';
        }
        return;
      }

      submitBtn.disabled = true;
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      if (sbMsg) sbMsg.style.display = 'none';

      let photoUrl = '';
      const photoFile = document.getElementById('sb-photo')?.files[0];
      if (photoFile) {
        try {
          const fd = new FormData();
          fd.append('photo', photoFile);
          const upRes = await fetch(API_BASE + '/api/service-booking/upload-photo', { method: 'POST', body: fd });
          const upData = await upRes.json();
          if (upData.success) photoUrl = upData.url;
        } catch(uploadErr) {
          console.warn('Photo upload failed, continuing without:', uploadErr);
        }
      }

      try {
        const res = await fetch(API_BASE + '/api/service-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name, phone,
            email: phone + '@whatsapp.com',
            service_name: service,
            preferred_date: date,
            device_model: device,
            problem_description: problem,
            photo_url: photoUrl,
            notes: ''
          })
        });

        const d = await res.json();
        if (d.success) {
          if (sbMsg) {
            sbMsg.style.display = 'block';
            sbMsg.style.color = '#22c55e';
            sbMsg.style.background = 'rgba(34,197,94,0.08)';
            sbMsg.textContent = 'Booking saved! Opening WhatsApp...';
          }

          let waMsg = 'SHIRO IT Service Request\n\n';
          waMsg += 'Service: ' + service + '\n';
          waMsg += 'Name: ' + name + '\n';
          waMsg += 'Phone: ' + phone + '\n';
          if (device) waMsg += 'Device: ' + device + '\n';
          waMsg += '\nProblem Description:\n' + problem + '\n';
          if (date) waMsg += '\nPreferred Date: ' + date + '\n';
          if (photoUrl) waMsg += '\nPhoto: ' + API_BASE + photoUrl + '\n';
          waMsg += '\nPlease confirm my appointment. Thank you!';

          // Immediate redirect for mobile reliability
          const waUrl = 'https://wa.me/60177617672?text=' + encodeURIComponent(waMsg);
          window.location.href = waUrl;
          
          document.getElementById('serviceBookingOverlay').classList.remove('show');
          serviceBookingForm.reset();
          clearBookingPhoto();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;

        } else {
          throw new Error(d.error || 'Server error');
        }
      } catch (err) {
        console.error('Booking failed:', err);
        if (sbMsg) {
          sbMsg.style.display = 'block';
          sbMsg.style.color = '#ef4444';
          sbMsg.style.background = 'rgba(239,68,68,0.08)';
          sbMsg.textContent = 'Error: ' + err.message;
        }
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }
});/* ===== BOOKING STATUS CHECKER ===== */
window.checkBookingStatus = async function() {
  const phone = document.getElementById('statusPhone').value.trim();
  const resDiv = document.getElementById('statusResult');
  const errDiv = document.getElementById('statusError');
  const btn = document.getElementById('statusBtn');
  
  if (!phone) return;
  
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  resDiv.style.display = 'none';
  errDiv.style.display = 'none';
  
  try {
    const res = await fetch(`${API_BASE}/api/service-booking/status?phone=${encodeURIComponent(phone)}`);
    const d = await res.json();
    
    if (d.success) {
      if (d.bookings.length === 0) {
        errDiv.textContent = 'No bookings found for this number.';
        errDiv.style.display = 'block';
      } else {
        resDiv.innerHTML = d.bookings.map(b => `
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);padding:1rem;border-radius:10px;margin-bottom:.8rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem;">
              <span style="font-weight:700;color:#38bdf8;font-size:.9rem;">${b.service_name}</span>
              <span style="font-size:.7rem;color:var(--text-secondary);">${b.created_at.split(' ')[0]}</span>
            </div>
            <div style="display:flex;align-items:center;gap:.5rem;">
              <div style="width:8px;height:8px;border-radius:50%;background:${b.status === 'Confirmed' ? '#22c55e' : '#f59e0b'};box-shadow:0 0 10px ${b.status === 'Confirmed' ? '#22c55e' : '#f59e0b'};"></div>
              <span style="font-size:.85rem;font-weight:600;color:${b.status === 'Confirmed' ? '#22c55e' : '#f59e0b'};">${b.status}</span>
            </div>
          </div>
        `).join('');
        resDiv.style.display = 'block';
      }
    } else {
      throw new Error(d.error);
    }
  } catch(e) {
    errDiv.textContent = 'Error: ' + e.message;
    errDiv.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Check';
  }
};

// Also close the new modal on backdrop click
document.getElementById('checkStatusModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'checkStatusModal') e.target.classList.remove('show');
});