/* ========== SHIRO IT v2 — Main JavaScript ========== */

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
  ? 'http://localhost:5000'
  : window.location.origin;

function resolveImagePath(path) {
  if (!path || typeof path !== 'string' || !path.includes('/')) return path;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return API_BASE + cleanPath;
}

let globalCart = [];
try {
  const saved = localStorage.getItem("shiro-global-cart");
  if (saved) globalCart = JSON.parse(saved);
} catch (e) {
  console.warn("Could not parse global cart:", e);
  globalCart = [];
}

window.openCheckoutModal = function() {
  console.log("openCheckoutModal called. Current cart size:", globalCart.length);
  if (globalCart.length === 0) {
    console.warn("Cart is empty, cannot open checkout modal.");
    if (typeof showToast === 'function') showToast("Your cart is empty", "error");
    else alert("Your cart is empty");
    return;
  }
  const overlay = document.getElementById('checkoutInfoOverlay');
  if (overlay) {
    console.log("Showing checkout overlay.");
    overlay.classList.add('show');
    const form = document.getElementById('checkoutInfoForm');
    if (form) form.reset();
    const ciMsg = document.getElementById('ci-msg');
    if (ciMsg) { ciMsg.style.display = 'none'; ciMsg.textContent = ''; }
  } else {
    console.error("checkoutInfoOverlay not found in the DOM");
    alert("Checkout system is currently unavailable. Please try again or contact us via WhatsApp directly.");
  }
};

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
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("data-page") === pageId)
        link.classList.add("active");
    });
    if (navMenu) navMenu.classList.remove("open");
    const _mt = document.getElementById("menuToggle");
    if (_mt) {
      const _mti = _mt.querySelector("i");
      if (_mti) _mti.className = "fas fa-bars";
    }
    const _ov = document.getElementById("navOverlay");
    if (_ov) _ov.classList.remove("active");
    setTimeout(() => runScrollAnimations(), 300);
    history.pushState(null, "", "#" + pageId);
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-page]");
    if (!link) return;
    e.preventDefault();
    const rawTarget = link.getAttribute("data-page") || link.getAttribute("href") || "";
    let cleanTarget = rawTarget.replace("#", "");
    if (cleanTarget === 'jobs') cleanTarget = 'contact#careers-section';
    const [pageId, sectionId] = cleanTarget.split("#"); 
    const page = pageId || link.getAttribute("data-page");
    const href = link.getAttribute("href") || "";
    const section = sectionId || (href.includes("#") ? href.split("#")[1] : null);
    if (page) {
        window.navigateTo(page);
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
            return;
        }
    }
  });

  window.addEventListener("popstate", () => {
    const hash = window.location.hash.replace("#", "") || "home";
    navigateTo(hash);
  });

  const initialPage = window.location.hash.replace("#", "") || "home";
  if (initialPage !== "home") navigateTo(initialPage);

  /* ===== SITE SETTINGS & FESTIVALS ===== */
  async function applySiteSettings() {
    try {
      const res = await fetch(API_BASE + '/api/site_settings');
      const d = await res.json();
      if (d.success && d.data) {
        const settings = d.data;
        const festival = settings.active_festival || 'none';
        if (festival !== 'none') {
          if (!document.getElementById('festival-css')) {
            const link = document.createElement('link');
            link.id = 'festival-css';
            link.rel = 'stylesheet';
            link.href = '/festivals/festival.css';
            document.head.appendChild(link);
          }
          const script = document.createElement('script');
          script.src = `/festivals/${festival}.js`;
          document.body.appendChild(script);
        }
        window.siteSettings = settings;
        if (settings.hero_slide_duration) {
          window.heroInterval = parseInt(settings.hero_slide_duration) * 1000;
        }
      }
    } catch (err) {}
  }
  window.heroInterval = 8000;
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
            mediaHtml = `<img src="${mediaUrl}" alt="${slide.title}" class="slide-poster-img">`;
          }
          const pageTarget = (slide.target_page || 'home').split('#')[0];
          return `
            <div class="hero-slide hero-slide-poster ${index === 0 ? 'active' : ''}" 
                 data-page="${pageTarget}" 
                 style="cursor: pointer; --slide-img: url('${mediaUrl}');">
              <div class="slide-poster-backdrop"></div>
              ${mediaHtml}
              <div class="slide-poster-fallback">
                <h3>${slide.title ? slide.title.replace('\n', '<br>') : ''}</h3>
                <p>${slide.subtitle || ''}</p>
                <div class="btn btn-primary btn-sm">
                  <i class="fas fa-arrow-right"></i> \${slide.button_text || (currentLang === 'bm' ? 'Ketahui Lanjut' : 'Learn More')}
                </div>
              </div>
            </div>`;
        }).join('');
        initHeroSlider();
      }
    } catch (err) {}
  }
  loadHeroSlides();

  /* ===== MOBILE MENU ===== */
  const menuToggle = document.getElementById("menuToggle");
  const navOverlay = document.getElementById("navOverlay");
  function closeMobileMenu() {
    if(navMenu) navMenu.classList.remove("open");
    if (navOverlay) navOverlay.classList.remove("active");
    if(menuToggle && menuToggle.querySelector("i")) menuToggle.querySelector("i").className = "fas fa-bars";
  }
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      const icon = menuToggle.querySelector("i");
      if (icon) icon.className = isOpen ? "fas fa-times" : "fas fa-bars";
      if (navOverlay) navOverlay.classList.toggle("active", isOpen);
    });
  }
  if (navOverlay) navOverlay.addEventListener("click", closeMobileMenu);
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
  let savedTheme = localStorage.getItem("shiro-theme") || "dark";
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector("i");
    if (savedTheme === "light") {
      document.body.classList.add("light");
      if(themeIcon) themeIcon.className = "fas fa-sun";
    }
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light");
      const isLight = document.body.classList.contains("light");
      if (themeIcon) themeIcon.className = isLight ? "fas fa-sun" : "fas fa-moon";
      localStorage.setItem("shiro-theme", isLight ? "light" : "dark");
    });
  }

  /* ===== LANGUAGE SWITCHER ===== */
  const langToggle = document.getElementById("languageToggle");
  const langDropdown = document.getElementById("languageDropdown");
  const langOptions = document.querySelectorAll(".language-option");
  let currentLang = localStorage.getItem("shiro-lang") || "en";

  const translations = {
    en: {
      nav_home: "Home",
      nav_tips: "IT Tips & Tricks",
      nav_gaming: "Gaming",
      nav_services: "Services",
      nav_shop: "Shop",
      nav_about: "About",
      nav_contact: "Contact",
      nav_build_1: "Build PC",
      nav_build_2: "IT Services",
      hero_badge: "Malaysia's Custom PC Builder",
      hero_title_1: "Build Your Dream",
      hero_title_2: "Gaming PC",
      hero_desc: "From budget builds to ultimate powerhouses — we craft custom PCs that match your performance needs and style. Expert IT services in Kepala Batas, Penang.",
      hero_f1: "Quick Response",
      hero_f2: "2-Year Warranty",
      hero_f3: "Expert Engineers",
      hero_cta1: "Build Your PC",
      hero_cta2: "View Shop",
      hero_trust: "customers trust SHIRO IT",
      svc_badge: "Our Services",
      svc_title_1: "What We",
      svc_title_2: "Offer",
      svc_desc: "From custom PC builds to comprehensive IT solutions, we've got you covered.",
      svc_1_title: "Custom PC Build",
      svc_1_desc: "Hand-built gaming rigs tailored to your performance needs and budget.",
      svc_2_title: "PC Repair",
      svc_2_desc: "Expert diagnosis and repair for all PC hardware and software issues.",
      svc_3_title: "Networking",
      svc_3_desc: "Professional network setup, configuration, and troubleshooting.",
      svc_4_title: "IT Support",
      svc_4_desc: "Comprehensive IT support for businesses and individuals.",
      svc_5_title: "Data Recovery",
      svc_5_desc: "Retrieve lost data from failed drives and corrupted systems.",
      svc_6_title: "Cloud Solutions",
      svc_6_desc: "Cloud migration, setup, and management for your business.",
      tier_title_1: "Choose",
      tier_title_2: "Your PC",
      stat_1: "PCs Built",
      stat_2: "Satisfaction",
      stat_3: "Years Exp",
      stat_4: "Support",
      test_title_1: "What Customers",
      test_title_2: "Say",
      cta_1: "Ready to Build",
      cta_2: "Dream PC",
      cta_desc: "Use our interactive configurator to design your perfect gaming PC. Choose from the latest components and get an instant estimate.",
      cta_start: "Start Building",
      cta_whatsapp: "WhatsApp Us",
      test_badge: "Testimonials",
      about_badge: "About Us",
      about_h1_1: "We Build",
      about_h1_2: "Dreams",
      about_desc: "SHIRO IT is a passionate Malaysian custom PC builder and IT service provider dedicated to delivering high-performance systems and exceptional service.",
      about_stat1: "PCs Built",
      about_stat2: "Years",
      about_stat3: "Satisfaction",
      about_stat4v: "Penang",
      about_stat4: "Based",
      about_journey_badge: "Our Journey",
      about_story1: "The SHIRO IT",
      about_story2: "Story",
      about_tl1_title: "The Beginning",
      about_tl1_desc: "SHIRO IT was founded with a passion for building high-performance custom PCs.",
      about_tl2_title: "Growing Strong",
      about_tl2_desc: "Expanded into IT services, offering repairs, networking, and cloud solutions.",
      about_tl3_title: "Online Presence",
      about_tl3_desc: "Launched our e-commerce platform and interactive PC configurator.",
      about_tl4_title: "Community Impact",
      about_tl4_desc: "Partnered with local schools and universities for tech education programs.",
      about_tl5_title: "Expansion",
      about_tl5_desc: "Opened our Penang showroom and grew to serve over 500 customers.",
      about_tl6_title: "Innovation",
      about_tl6_desc: "Introduced AI-powered build recommendations and real-time compatibility checks.",
      about_values_badge: "Our Values",
      about_values1: "What Drives",
      about_values2: "Us",
      val_1_title: "Passion",
      val_1_desc: "Every build is crafted with a genuine love for technology and gaming.",
      val_2_title: "Trust",
      val_2_desc: "Transparent pricing, honest recommendations, and reliable after-sales support.",
      val_3_title: "Innovation",
      val_3_desc: "Constantly embracing the latest technology to provide the best experience for our customers.",
      val_4_title: "Community",
      val_4_desc: "Building a community of gamers and tech enthusiasts across Malaysia.",
      about_team_badge: "Our Team",
      about_team1: "Meet The",
      about_team2: "Team",
      tips_badge: "Knowledge Base",
      tips_h1_1: "IT",
      tips_h1_2: "Tips & Tricks",
      tips_desc: "Practical tech tips to keep your PC running fast, secure, and optimized. From SHIRO IT experts to you.",
      tips_video_badge: "Video Guides",
      tips_video1: "Watch &",
      tips_video2: "Learn",
      tips_care_badge: "PC Care",
      tips_care1: "Keep Your PC",
      tips_care2: "Healthy",
      tips_cta1: "Need",
      tips_cta2: "Expert Help",
      tips_cta_desc: "Our technicians can diagnose and fix any PC issue. From slow performance to hardware failures — we've got you covered.",
      svcp_badge: "Our Services",
      svcp_h1_1: "Professional",
      svcp_h1_2: "IT Solutions",
      svcp_desc: "From custom PC builds to enterprise IT support — we deliver reliable, high-quality technology services tailored to your needs.",
      proc_badge: "How It Works",
      proc_h2_1: "Our",
      proc_h2_2: "Process",
      faq_badge: "FAQ",
      faq_h2_1: "Frequently",
      faq_h2_2: "Asked",
      shop_badge: "Shop",
      shop_h1_1: "SHIRO IT",
      shop_h1_2: "Store",
      shop_desc: "Pre-built gaming PCs, workstations, components, and accessories — all picked by SHIRO IT.",
      shop_cta_h2: "Can't Find What You Need?",
      shop_cta_desc: "We can source any component or build a custom PC just for you.",
      build_badge: "PC Configurator & Services",
      build_h1_1: "Build PC &",
      build_h1_2: "IT Services",
      build_desc: "Select your components below and get an instant price estimate. Order via WhatsApp!",
      contact_badge: "Contact Us",
      contact_h1_1: "Get In",
      contact_h1_2: "Touch",
      contact_desc: "Have a question or need a quote? Reach out to us through any of the channels below.",
      contact_form_title: "Mission Briefing",
      contact_form_badge: "Official Inquiry",
      contact_form_desc: "Best for custom build specifications, business partnerships, or formal quotes requiring detailed records.",
      contact_field_name: "Name",
      contact_field_email: "Email",
      contact_field_phone: "Phone (Optional)",
      contact_field_subject: "Subject",
      contact_field_msg: "Message Brief",
      contact_ph_identity: "Identity",
      contact_ph_link: "Communication Link",
      contact_ph_objective: "Select Objective",
      contact_ph_brief: "Outline your project requirements or specific questions...",
      contact_transmit: "SEND MESSAGE",
      contact_intel_badge: "Fastest Response",
      contact_intel_title: "Direct Intelligence",
      contact_intel_desc: "For immediate assistance, stock availability, or quick technical questions. Connect with our team instantly.",
      contact_whatsapp_btn: "CHAT ON WHATSAPP",
      contact_stat_resp: "Avg. 30min",
      contact_stat_live: "Live Support",
      contact_hours_title: "Operational Hours",
      contact_hours_sun: "Closed",
      contact_timezone: "Kuala Lumpur (GMT+8)",
      contact_find_badge: "Find Us",
      contact_loc1: "Our",
      contact_loc2: "Location",
      careers_badge: "Careers",
      careers_h2_1: "Join Our",
      careers_h2_2: "Team",
      language_english: "English",
      language_bm: "Bahasa Malaysia",
      shop_in_stock: "in stock",
      shop_only_left: "Only 1 left!",
      shop_add_cart: "Add to Cart",
      shop_ask_price: "Ask Price",
      cat_all: "All",
      cat_cpu: "CPU",
      cat_motherboard: "Motherboard",
      cat_ram: "RAM",
      cat_gpu: "GPU",
      cat_storage: "SSD",
      cat_psu: "PSU",
      cat_case: "Case",
      cat_aio: "AIO Cooling",
      cat_cooling: "Air Cooling",
      cat_monitor: "Monitor",
      cat_keyboard: "Keyboard",
      cat_mouse: "Mouse",
      cat_accessories: "Accessories",
      cat_gaming_pcs: "Gaming PCs",
      cat_laptops: "Laptops",
      cat_components: "Components",
      cat_peripherals: "Peripherals",
      cat_monitors: "Monitors",
      cat_networking: "Networking",
      cat_custom: "Custom Builds",
      cat_other: "Other",
      wa_order_intro: "Hi SHIRO IT! I'd like to place an order:\n\n",
      wa_order_total: "Total: RM ",
      wa_order_outro: "\n\nPlease confirm availability. Thank you!",
      cart_title: "Your Cart",
      cart_empty: "Your cart is empty",
      cart_browse: "Browse Shop",
      cart_checkout: "Order on WhatsApp",
      cart_total: "Grand Total",
      check_status_btn: "Check My Booking Status",
      check_status_title: "Check Status",
      check_status_action: "Check",
      svc_ewaste_title: "E-Waste Collection",
      svc_ewaste_desc: "Properly dispose of your old electronics. We ensure eco-friendly recycling and 100% data destruction.",
      svc_ewaste_f1: "Eco-Friendly Disposal",
      svc_ewaste_f2: "Certified Data Destruction",
      svc_ewaste_f3: "Component Recycling",
      svc_ewaste_f4: "Small & Large Batch Pickup",
      svc_ewaste_cta: "Schedule a Pickup",
      svc_repair_f1: "Logic Board Chip-Level Repair",
      svc_repair_f2: "Screen & Keyboard Replacement",
      svc_repair_f3: "OS Installation & Optimization",
      svc_repair_f4: "Liquid Damage Treatment",
      svc_spa_f1: "Full Dust Removal",
      svc_spa_f2: "Thermal Paste (MX-4/Kryonaut)",
      svc_spa_f3: "Fan Lubrication & Cleaning",
      svc_spa_f4: "Performance Benchmarking",
      svc_net_f1: "WiFi 6 Mesh Network Setup",
      svc_net_f2: "SME Server & Rack Mounting",
      svc_net_f3: "NAS & Private Cloud Storage",
      svc_net_f4: "IP CCTV Security Systems",
      svc_data_f1: "SSD & NVMe Data Retrieval",
      svc_data_f2: "Mechanical HDD Recovery",
      svc_data_f3: "RAID Array Reconstruction",
      svc_data_f4: "Secure Data Erasure",
      sb_service: "Service",
      sb_name: "Your Name",
      sb_phone: "WhatsApp No.",
      sb_device: "Device / Item",
      sb_problem: "Describe the Problem",
      sb_photo_title: "Attach Photos / Videos",
      sb_photo_ph: "Click or drag photos/videos here",
      sb_date: "Preferred Service Date",
      sb_submit: "Confirm Booking via WhatsApp",
      svc_repair_title: "Expert Hardware Repair",
      svc_repair_desc: "Fast diagnosis for desktops and laptops. We specialize in logic board and hardware level troubleshooting.",
      svc_repair_cta: "Book Repair",
      svc_spa_title: "Laptop Spa & Cooling",
      svc_spa_desc: "Overheating? We provide deep cleaning and high-performance thermal paste re-application.",
      svc_spa_cta: "Book Spa",
      svc_net_title: "Network Solutions",
      svc_net_desc: "Enterprise-grade network solutions for SMEs and high-performance WiFi 6 setups for modern homes.",
      svc_net_cta: "Get Quote",
      svc_data_title: "Data Recovery",
      svc_data_desc: "Advanced recovery for corrupted SSDs, dead HDDs, and accidental file deletions.",
      svc_data_cta: "Emergency Help",
      svc_trade_title: "PC & Laptop Trade-In",
      svc_trade_desc: "Upgrade your setup by trading in your old hardware. We offer fair market value for working systems and components.",
      svc_trade_cta: "Get Valuation",
      proc_step1_title: "Consultation",
      proc_step1_desc: "Tell us what you need — we listen and recommend the best solution.",
      proc_step2_title: "Planning",
      proc_step2_desc: "We design a tailored solution with transparent pricing.",
      proc_step3_title: "Execution",
      proc_step3_desc: "Our experts build or repair your system with precision.",
      proc_step4_title: "Testing",
      proc_step4_desc: "Rigorous testing ensures your system is stable and ready.",
      career_full_time: "Full-time",
      career_internship: "Internship",
      career_pc_tech_title: "PC Build Technician",
      career_pc_tech_desc: "Assemble and test custom gaming PCs with attention to detail and cable management.",
      career_it_intern_title: "IT Support Intern",
      career_it_intern_desc: "Learn the ropes of IT support while assisting with real client systems.",
      career_sales_title: "Sales & Customer Service",
      career_sales_desc: "Help customers choose the right PC build and provide excellent after-sales support.",
      career_apply_now: "Apply Now",
      footer_desc: "Malaysia's premier custom PC builder and IT services provider. Building dreams one component at a time.",
      footer_services: "Services",
      footer_company: "Company",
      footer_support: "Support",
      footer_newsletter: "Newsletter",
      footer_legal: "Legal",
      footer_rights: "All rights reserved.",
      footer_addr_label: "Address",
      footer_phone_label: "Phone",
      footer_email_label: "Email",
      footer_policy: "Privacy Policy",
      footer_terms: "Terms of Service",
      footer_warranty: "Warranty",
    },
    bm: {
      nav_home: "Utama",
      nav_tips: "Tips & Trik IT",
      nav_gaming: "Gaming",
      nav_services: "Perkhidmatan",
      nav_shop: "Kedai",
      nav_about: "Tentang Kami",
      nav_contact: "Hubungi Kami",
      nav_build_1: "Konfigurasi PC",
      nav_build_2: "Penyelesaian IT",
      hero_badge: "Pakar Bina PC Custom Malaysia",
      hero_title_1: "Realisasikan Impian",
      hero_title_2: "PC Gaming Anda",
      hero_desc: "Dari binaan bajet hingga prestasi ekstrem — kami membina PC custom yang memenuhi keperluan prestasi dan gaya anda. Perkhidmatan IT profesional di Kepala Batas, Pulau Pinang.",
      hero_f1: "Respon Pantas",
      hero_f2: "Jaminan 2 Tahun",
      hero_f3: "Jurutera Pakar",
      hero_cta1: "Bina PC Anda",
      hero_cta2: "Lihat Kedai",
      hero_trust: "pelanggan mempercayai SHIRO IT",
      svc_badge: "Perkhidmatan Kami",
      svc_title_1: "Apa Yang",
      svc_title_2: "Kami Tawarkan",
      svc_desc: "Daripada konfigurasi PC custom sehingga penyelesaian IT menyeluruh, kami sedia membantu anda.",
      svc_1_title: "Binaan PC Custom",
      svc_1_desc: "Sistem gaming binaan tangan yang disesuaikan mengikut prestasi dan bajet anda.",
      svc_2_title: "Baik Pulih PC",
      svc_2_desc: "Diagnosis pakar dan pembaikan untuk sebarang gangguan perkakasan serta perisian PC.",
      svc_3_title: "Sistem Rangkaian",
      svc_3_desc: "Pemasangan rangkaian profesional, konfigurasi, dan penyelesaian masalah.",
      svc_4_title: "Sokongan IT",
      svc_4_desc: "Sokongan IT menyeluruh untuk sektor perniagaan dan individu.",
      svc_5_title: "Pemulihan Data",
      svc_5_desc: "Memulihkan data yang hilang daripada pemacu yang rosak atau sistem yang terjejas.",
      svc_6_title: "Penyelesaian Awan",
      svc_6_desc: "Migrasi awan (cloud), pemasangan, dan pengurusan untuk perniagaan anda.",
      tier_title_1: "Pilih",
      tier_title_2: "PC Anda",
      stat_1: "PC Dibina",
      stat_2: "Kepuasan",
      stat_3: "Tahun Pengalaman",
      stat_4: "Sokongan",
      test_title_1: "Kata",
      test_title_2: "Pelanggan",
      cta_1: "Sedia Untuk Bina",
      cta_2: "PC Impian?",
      cta_desc: "Gunakan konfigurator interaktif kami untuk merangka PC gaming sempurna anda. Pilih komponen terkini dan dapatkan sebut harga segera.",
      about_badge: "Tentang Kami",
      about_h1_1: "Kami Membina",
      about_h1_2: "Impian Anda",
      about_desc: "SHIRO IT merupakan pakar pembina PC custom Malaysia yang berdedikasi dalam menyediakan sistem berprestasi tinggi dan perkhidmatan IT yang luar biasa.",
      about_stat1: "Unit Dibina",
      about_stat2: "Tahun",
      about_stat3: "Kepuasan",
      about_stat4v: "Pulau Pinang",
      about_stat4: "Berpusat di",
      about_journey_badge: "Sejarah Perjalanan",
      about_story1: "Kisah",
      about_story2: "SHIRO IT",
      about_tl1_title: "Permulaan",
      about_tl1_desc: "SHIRO IT diasaskan dengan minat mendalam dalam membina PC custom berprestasi tinggi.",
      about_tl2_title: "Pertumbuhan",
      about_tl2_desc: "Berkembang ke arah perkhidmatan IT, menawarkan baik pulih, rangkaian, dan penyelesaian awan.",
      about_tl3_title: "Kehadiran Digital",
      about_tl3_desc: "Melancarkan platform e-dagang dan konfigurator PC interaktif kami.",
      about_tl4_title: "Impak Komuniti",
      about_tl4_desc: "Bekerjasama dengan institusi pendidikan tempatan untuk program kesedaran teknologi.",
      about_tl5_title: "Pengembangan",
      about_tl5_desc: "Membuka bilik pameran di Pulau Pinang dan melayani lebih 500 pelanggan setia.",
      about_tl6_title: "Inovasi",
      about_tl6_desc: "Memperkenalkan cadangan binaan berasaskan AI dan semakan keserasian masa nyata.",
      about_values_badge: "Nilai Kami",
      about_values1: "Tunjang",
      about_values2: "Utama Kami",
      val_1_title: "Minat Mendalam",
      val_1_desc: "Setiap binaan dihasilkan dengan penuh teliti kerana minat kami terhadap teknologi.",
      val_2_title: "Kepercayaan",
      val_2_desc: "Harga yang telus, cadangan yang jujur, dan sokongan selepas jualan yang dipercayai.",
      val_3_title: "Inovasi",
      val_3_desc: "Sentiasa mengaplikasikan teknologi terkini untuk memberikan pengalaman terbaik kepada pelanggan.",
      val_4_title: "Komuniti",
      val_4_desc: "Membina komuniti peminat tegar gaming dan teknologi di seluruh Malaysia.",
      about_team_badge: "Pasukan Kami",
      about_team1: "Kenali",
      about_team2: "Pasukan Kami",
      tips_badge: "Pangkalan Pengetahuan",
      tips_h1_1: "Panduan &",
      tips_h1_2: "Tips IT",
      tips_desc: "Tips teknologi praktikal untuk memastikan PC anda kekal pantas, selamat, dan optimum daripada pakar SHIRO IT.",
      tips_video_badge: "Panduan Video",
      tips_video1: "Tonton &",
      tips_video2: "Belajar",
      tips_care_badge: "Penjagaan PC",
      tips_care1: "Kekalkan Prestasi",
      tips_care2: "PC Anda",
      tips_cta1: "Perlukan",
      tips_cta2: "Bantuan Pakar?",
      tips_cta_desc: "Juruteknik kami sedia mendiagnosis dan membaiki sebarang masalah PC anda, daripada masalah prestasi sehingga kerosakan perkakasan.",
      svcp_badge: "Perkhidmatan Kami",
      svcp_h1_1: "Penyelesaian",
      svcp_h1_2: "IT Profesional",
      svcp_desc: "Daripada binaan PC custom sehingga sokongan IT perusahaan — kami memberikan perkhidmatan berkualiti tinggi yang disesuaikan mengikut keperluan anda.",
      proc_badge: "Cara Kami Bekerja",
      proc_h2_1: "Proses",
      proc_h2_2: "Kami",
      faq_badge: "Soalan Lazim",
      faq_h2_1: "Soalan",
      faq_h2_2: "Lazim",
      shop_badge: "Kedai Kami",
      shop_h1_1: "Gedung",
      shop_h1_2: "SHIRO IT",
      shop_desc: "PC gaming siap bina, stesen kerja, komponen, dan aksesori — semuanya dipilih rapi oleh pakar kami.",
      shop_cta_h2: "Tidak Menemui Apa Yang Anda Cari?",
      shop_cta_desc: "Kami boleh mendapatkan sebarang komponen khusus atau membina PC custom mengikut impian anda.",
      build_badge: "Konfigurator & Perkhidmatan",
      build_h1_1: "Bina PC &",
      build_h1_2: "Servis IT",
      build_desc: "Pilih komponen anda di bawah dan dapatkan anggaran harga segera. Tempah terus melalui WhatsApp!",
      contact_badge: "Hubungi Kami",
      contact_h1_1: "Hubungi",
      contact_h1_2: "Kami Segera",
      contact_desc: "Ada sebarang soalan atau memerlukan sebut harga? Hubungi kami melalui mana-mana saluran di bawah.",
      contact_form_title: "Taklimat Misi",
      contact_form_badge: "Inkuiri Rasmi",
      contact_form_desc: "Sesuai untuk spesifikasi binaan custom, perkongsian perniagaan, atau sebut harga rasmi yang memerlukan rekod.",
      contact_field_name: "Nama",
      contact_field_email: "Emel",
      contact_field_phone: "No. Telefon (Pilihan)",
      contact_field_subject: "Subjek",
      contact_field_msg: "Perincian Mesej",
      contact_ph_identity: "Identiti Anda",
      contact_ph_link: "Talian Komunikasi",
      contact_ph_objective: "Pilih Objektif",
      contact_ph_brief: "Nyatakan keperluan projek atau soalan khusus anda...",
      contact_transmit: "HANTAR SEKARANG",
      contact_intel_badge: "Respon Terpantas",
      contact_intel_title: "Talian Terus",
      contact_intel_desc: "Untuk bantuan segera, ketersediaan stok, atau soalan teknikal pantas. Hubungi pasukan kami secara langsung.",
      contact_whatsapp_btn: "HUBUNGI WHATSAPP",
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
      careers_h2_2: "Kerjaya Bersama Kami",
      language_english: "English",
      language_bm: "Bahasa Melayu",
      shop_in_stock: "Stok Tersedia",
      shop_only_left: "Stok Terhad: 1 Sahaja!",
      shop_add_cart: "Tambah ke Troli",
      shop_ask_price: "Hubungi untuk Harga",
      cat_all: "Semua",
      cat_cpu: "CPU",
      cat_motherboard: "Papan Induk",
      cat_ram: "RAM",
      cat_gpu: "Kad Grafik",
      cat_storage: "SSD",
      cat_psu: "PSU",
      cat_case: "Casing",
      cat_aio: "Penyejuk AIO",
      cat_cooling: "Penyejuk Udara",
      cat_monitor: "Monitor",
      cat_keyboard: "Papan Kekunci",
      cat_mouse: "Tetikus",
      cat_accessories: "Aksesori",
      cat_gaming_pcs: "PC Gaming",
      cat_laptops: "Laptop",
      cat_components: "Komponen",
      cat_peripherals: "Aksesori",
      cat_monitors: "Monitor",
      cat_networking: "Rangkaian",
      cat_custom: "Binaan Custom",
      cat_other: "Lain-lain",
      wa_order_intro: "Hai SHIRO IT! Saya ingin membuat pesanan:\n\n",
      wa_order_total: "Jumlah Keseluruhan: RM ",
      wa_order_outro: "\n\nSila sahkan ketersediaan stok. Terima kasih!",
      cart_title: "Troli Anda",
      cart_empty: "Troli anda masih kosong",
      cart_browse: "Lihat Kedai",
      cart_checkout: "Tempah via WhatsApp",
      cart_total: "Jumlah Keseluruhan",
      cta_start: "Mula Membina",
      cta_whatsapp: "WhatsApp Kami",
      test_badge: "Testimoni",
      check_status_btn: "Semak Status Tempahan",
      check_status_title: "Semak Status",
      check_status_action: "Semak",
      svc_ewaste_title: "Pengumpulan E-Sisa",
      svc_ewaste_desc: "Lupuskan peralatan elektronik lama anda dengan cara yang betul. Kami menjamin kitar semula mesra alam dan pemusnahan data 100%.",
      svc_ewaste_f1: "Pelupusan Mesra Alam",
      svc_ewaste_f2: "Pemusnahan Data Diperakui",
      svc_ewaste_f3: "Kitar Semula Komponen",
      svc_ewaste_f4: "Pengambilan Batch Kecil & Besar",
      svc_ewaste_cta: "Jadualkan Pengambilan",
      svc_repair_f1: "Baik Pulih Tahap Cip Logic Board",
      svc_repair_f2: "Ganti Skrin & Papan Kekunci",
      svc_repair_f3: "Pemasangan & Pengoptimuman OS",
      svc_repair_f4: "Rawatan Kerosakan Cecair",
      svc_spa_f1: "Pembersihan Habuk Menyeluruh",
      svc_spa_f2: "Thermal Paste (MX-4/Kryonaut)",
      svc_spa_f3: "Pelinciran & Pembersihan Kipas",
      svc_spa_f4: "Ujian Prestasi (Benchmarking)",
      svc_net_f1: "Setup Rangkaian Mesh WiFi 6",
      svc_net_f2: "Server PKS & Pemasangan Rak",
      svc_net_f3: "Simpanan NAS & Awan Peribadi",
      svc_net_f4: "Sistem Keselamatan IP CCTV",
      svc_data_f1: "Pemulihan Data SSD & NVMe",
      svc_data_f2: "Pemulihan HDD Mekanikal",
      svc_data_f3: "Rekonstruksi Array RAID",
      svc_data_f4: "Pemadaman Data Selamat",
      sb_service: "Perkhidmatan",
      sb_name: "Nama Anda",
      sb_phone: "No. WhatsApp",
      sb_device: "Model Peranti / Item",
      sb_problem: "Keterangan Masalah",
      sb_photo_title: "Lampirkan Foto / Video",
      sb_photo_ph: "Klik atau seret foto/video ke sini",
      sb_date: "Tarikh Servis Pilihan",
      sb_submit: "Sahkan Tempahan via WhatsApp",
      svc_repair_title: "Baik Pulih Perkakasan Pakar",
      svc_repair_desc: "Diagnosis pantas untuk desktop dan laptop. Kami pakar dalam penyelesaian masalah tahap cip dan perkakasan.",
      svc_repair_cta: "Tempah Baik Pulih",
      svc_spa_title: "Spa & Penyejukan Laptop",
      svc_spa_desc: "Laptop anda panas? Kami menyediakan pembersihan mendalam dan penggantian thermal paste berprestasi tinggi.",
      svc_spa_cta: "Tempah Spa",
      svc_net_title: "Penyelesaian Rangkaian",
      svc_net_desc: "Penyelesaian rangkaian gred perusahaan untuk PKS dan pemasangan WiFi 6 berprestasi tinggi untuk kediaman moden.",
      svc_net_cta: "Dapatkan Sebut Harga",
      svc_data_title: "Pemulihan Data",
      svc_data_desc: "Pemulihan lanjutan untuk SSD yang rosak, HDD yang mati, dan pemadaman fail secara tidak sengaja.",
      svc_data_cta: "Bantuan Kecemasan",
      svc_trade_title: "Trade-In PC & Laptop",
      svc_trade_desc: "Naik taraf sistem anda dengan trade-in perkakasan lama. Kami menawarkan nilai pasaran yang adil untuk sistem anda.",
      svc_trade_cta: "Dapatkan Penilaian",
      proc_step1_title: "Konsultasi",
      proc_step1_desc: "Nyatakan keperluan anda — kami mendengar dan menyarankan penyelesaian terbaik.",
      proc_step2_title: "Perancangan",
      proc_step2_desc: "Kami merangka penyelesaian khusus dengan harga yang telus.",
      proc_step3_title: "Pelaksanaan",
      proc_step3_desc: "Pakar kami membina atau membaiki sistem anda dengan penuh ketepatan.",
      proc_step4_title: "Pengujian",
      proc_step4_desc: "Ujian rapi memastikan sistem anda stabil dan sedia untuk digunakan.",
      career_full_time: "Sepenuh Masa",
      career_internship: "Latihan Industri (Internship)",
      career_pc_tech_title: "Juruteknik Binaan PC",
      career_pc_tech_desc: "Memasang dan menguji PC gaming custom dengan ketelitian tinggi serta pengurusan kabel yang kemas.",
      career_it_intern_title: "Pelatih Sokongan IT",
      career_it_intern_desc: "Mempelajari selok-belok sokongan IT sambil membantu sistem pelanggan sebenar.",
      career_sales_title: "Jualan & Khidmat Pelanggan",
      career_sales_desc: "Membantu pelanggan memilih binaan PC yang tepat dan memberikan sokongan selepas jualan yang cemerlang.",
      career_apply_now: "Mohon Sekarang",
      footer_desc: "Pembina PC custom utama di Malaysia dan penyedia perkhidmatan IT. Merealisasikan impian anda satu persatu.",
      footer_services: "Perkhidmatan",
      footer_company: "Syarikat",
      footer_support: "Sokongan",
      footer_newsletter: "Surat Berita",
      footer_legal: "Undang-undang",
      footer_rights: "Hak Cipta Terpelihara.",
      footer_addr_label: "Alamat",
      footer_phone_label: "Telefon",
      footer_email_label: "Emel",
      footer_policy: "Dasar Privasi",
      footer_terms: "Syarat Perkhidmatan",
      footer_warranty: "Waranti",
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
      if (translations[lang] && translations[lang][key]) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = translations[lang][key];
        } else {
          el.textContent = translations[lang][key];
        }
      }
    });
    const ld = document.getElementById("languageDropdown");
    if (ld) ld.classList.remove("open");
  }

  const lt = document.getElementById("languageToggle");
  if (lt) {
    lt.addEventListener("click", () => {
      const ld = document.getElementById("languageDropdown");
      if (ld) ld.classList.toggle("open");
    });
  }

  langOptions.forEach((opt) => {
    opt.addEventListener("click", () =>
      setLanguage(opt.getAttribute("data-lang")),
    );
  });

  setLanguage(currentLang);

  document.addEventListener("click", (e) => {
    const ld = document.getElementById("languageDropdown");
    if (ld && !e.target.closest(".language-switcher"))
      ld.classList.remove("open");
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
  let allPrebuiltPCs = [];
  let currentPcCategory = 'Office PC';

  async function loadPrebuiltPCs() {
    try {
      const res = await fetch(API_BASE + '/api/prebuilt_pcs');
      const d = await res.json();
      if (d.success && d.data && d.data.length > 0) {
        allPrebuiltPCs = d.data;
        renderPrebuiltPCs();
      } else {
        const container = document.getElementById('prebuiltPcsContainer');
        if (container) container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem;">PC configurations coming soon.</p>';
      }
    } catch (err) {
      console.warn('Failed to load prebuilt PCs from API:', err);
    }
  }

  function renderPrebuiltPCs() {
    const container = document.getElementById('prebuiltPcsContainer');
    if (!container) return;

    let filteredPCs = allPrebuiltPCs;
    if (currentPcCategory !== 'All') {
      filteredPCs = allPrebuiltPCs.filter(pc => pc.pc_type === currentPcCategory);
    }

    if (filteredPCs.length === 0) {
      container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No PCs found in this category.</p>';
      return;
    }

    container.innerHTML = filteredPCs.map(pc => {
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
          
          if (pc.display_style === 'poster') {
            return `
              <div class="tier-card poster-style${featuredClass}" style="--tier-color: ${color};">
                ${ribbonHtml}
                <div class="tier-media-wrapper" style="height: 400px;">
                  ${mediaHtml}
                </div>
                <div class="tier-card-content" style="padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); flex-grow: 0;">
                  <div class="tier-price" style="text-align: center; margin-bottom: 1rem;">
                    ${pc.price && pc.price > 0 
                      ? `RM ${Number(pc.price).toLocaleString()}` 
                      : '<span style="font-size:1rem; opacity:0.8; text-transform:uppercase; letter-spacing:1px; font-weight:700; font-family:var(--font-heading);">Contact for Price</span>'}
                  </div>
                  <button onclick="fillBuilderFromPrebuilt('${pc.name}')" class="btn btn-primary tier-btn" style="width: 100%;">Order Now <i class="fas fa-shopping-cart"></i></button>
                </div>
              </div>`;
          } else {
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
                  <div class="tier-price">
                    ${pc.price && pc.price > 0 
                      ? `RM ${Number(pc.price).toLocaleString()}` 
                      : '<span style="font-size:1rem; opacity:0.8; text-transform:uppercase; letter-spacing:1px; font-weight:700; font-family:var(--font-heading);">Contact for Price</span>'}
                  </div>
                  ${discountHtml}
                  <div class="tier-specs">${specsHtml}</div>
                  <button onclick="fillBuilderFromPrebuilt('${pc.name}')" class="btn btn-primary tier-btn">Order Now <i class="fas fa-shopping-cart"></i></button>
                </div>
              </div>`;
          }
    }).join('');

    // Re-run nav listeners for new tier buttons
    container.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-page'));
      });
    });
    setTimeout(runScrollAnimations, 100);
  }

  // Setup tab click listeners
  document.querySelectorAll('.pc-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.pc-tab').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentPcCategory = e.target.getAttribute('data-pctype') || 'All';
      renderPrebuiltPCs();
    });
  });
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
            : `<div class="video-wrapper"><video autoplay muted loop playsinline controls preload="metadata"><source src="${mediaUrl}" type="${mimeType}">Your browser does not support video.</video></div>`;
          return `
            <div class="video-card">
              ${mediaHtml}
              <div class="video-info">
                <h4>${tip.title}</h4>
                <p>${tip.description || ''}</p>
              </div>
            </div>`;
        }).join('');
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
      group.id = "comp-group-" + cat.replace(/\s+/g, "-");

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

  window.fillBuilderFromPrebuilt = function(pcName) {
    const pc = allPrebuiltPCs.find(p => p.name === pcName);
    if (!pc) return;

    // Reset current build
    cartItems = [];
    
    // Parse specs - assuming they are JSON strings or arrays
    let specs = [];
    try {
      specs = typeof pc.specs === 'string' ? JSON.parse(pc.specs) : pc.specs;
    } catch(e) {
      console.warn("Failed to parse specs for", pcName);
      specs = [];
    }

    if (specs && specs.length > 0) {
      specs.forEach(specStr => {
        // Spec format: "Category: Name"
        const parts = specStr.split(':');
        if (parts.length >= 2) {
          const category = parts[0].trim();
          const itemName = parts[1].trim();
          
          // Map category names if needed
          let searchCat = category;
          if (category === 'Processor') searchCat = 'CPU';
          if (category === 'Graphics') searchCat = 'GPU';
          if (category === 'Storage') searchCat = 'Storage';
          if (category === 'Power Supply') searchCat = 'PSU';
          if (category === 'Case') searchCat = 'Case';
          if (category === 'AIO Cooling') searchCat = 'AIO Cooling';
          if (category === 'Air Cooling') searchCat = 'Cooling';

          // Search in inventory
          const match = inventoryData.find(inv => {
            const catMatch = inv.category.toLowerCase() === searchCat.toLowerCase();
            const nameMatch = inv.name.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(inv.name.toLowerCase());
            return catMatch && nameMatch;
          });

          if (match) {
            cartItems.push(match);
          }
        }
      });
    }

    // Refresh UI
    renderBuilder();
    updateSummary();
    
    // Navigate to Build PC page
    navigateTo('build-pc-services');
    
    // Smooth scroll to builder
    setTimeout(() => {
      const builderEl = document.getElementById('componentsList');
      if (builderEl) {
        builderEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    
    if (typeof showToast === 'function') showToast(`${pcName} configuration loaded into Builder!`, "success");
  };

  window.filterBuildComponent = function(category, clickedBtn) {
    // Update active tab
    document.querySelectorAll(".build-tab").forEach(btn => btn.classList.remove("active"));
    if (clickedBtn) clickedBtn.classList.add("active");

    // Show/hide component groups in place — no scroll
    const groups = document.querySelectorAll(".component-group");
    groups.forEach(group => {
      if (category === "All") {
        group.style.display = "";
      } else {
        const groupId = group.id || "";
        const groupCat = groupId.replace("comp-group-", "").replace(/-/g, " ");
        group.style.display = (groupCat === category) ? "" : "none";
      }
    });
  };

  window.scrollBuildNav = function(amount) {
    const nav = document.getElementById('buildCatNav');
    if (nav) {
      nav.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

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

    cartItems.forEach((opt, index) => {
      total += opt.price;

      // Resolve image URL
      const imgSrc = opt.image
        ? (opt.image.startsWith('http') ? opt.image : API_BASE + (opt.image.startsWith('/') ? opt.image : '/' + opt.image))
        : null;
      const imgHtml = imgSrc
        ? `<img src="${imgSrc}" alt="${opt.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <i class="fas fa-microchip" style="display:none;"></i>`
        : `<i class="fas fa-microchip"></i>`;

      // Badge
      const badgeHtml = opt.badge ? `<span class="summary-badge">${opt.badge}</span>` : '';

      // Specs
      let specsHtml = '';
      if (opt.specs) {
        try {
          const specArr = typeof opt.specs === 'string' ? JSON.parse(opt.specs) : opt.specs;
          if (Array.isArray(specArr) && specArr.length > 0) {
            specsHtml = `<div class="summary-specs">${specArr.slice(0,4).join(' · ')}</div>`;
          }
        } catch(e) {
          specsHtml = `<div class="summary-specs">${opt.specs}</div>`;
        }
      }

      const item = document.createElement("div");
      item.className = "summary-item";
      item.innerHTML = `
        <div class="summary-item-img">${imgHtml}</div>
        <div class="summary-item-body">
          <div class="summary-cat">${opt.category}</div>
          <div class="summary-name">${opt.name}</div>
          ${badgeHtml}
          ${specsHtml}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
          <span class="summary-price">RM ${opt.price.toLocaleString()}</span>
          <button class="summary-remove-btn" onclick="removeCartItem(${index})" title="Remove">
            <i class="fas fa-times"></i>
          </button>
        </div>
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
    console.log("Adding item to cart:", item);
    
    // Check if item already exists (and it's not a unique build)
    const existingIndex = globalCart.findIndex(i => i.id === item.id && i.type !== 'build');
    
    if (existingIndex > -1) {
      globalCart[existingIndex].quantity = (globalCart[existingIndex].quantity || 1) + 1;
    } else {
      item.quantity = 1;
      globalCart.push(item);
    }
    
    localStorage.setItem("shiro-global-cart", JSON.stringify(globalCart));
    updateCartBadge();
    if (typeof showToast === 'function') showToast(`${item.name} added to cart!`, "success");
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
      const qty = item.quantity || 1;
      const itemTotal = item.price * qty;
      grandTotal += itemTotal;
      
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
          <div style="flex:1;">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">RM ${item.price.toLocaleString()}</div>
          </div>
          <div class="cart-item-remove" onclick="removeFromGlobalCart(${index})">
            <i class="fas fa-trash"></i>
          </div>
        </div>
        ${itemsList}
        <div class="cart-item-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
          <div class="qty-control">
            <button onclick="updateCartQty(${index}, -1)"><i class="fas fa-minus"></i></button>
            <span class="qty-num">${qty}</span>
            <button onclick="updateCartQty(${index}, 1)"><i class="fas fa-plus"></i></button>
          </div>
          <div class="cart-item-subtotal" style="font-weight:700; color:white;">RM ${itemTotal.toLocaleString()}</div>
        </div>
      `;
      cartBody.appendChild(el);
    });

    cartGrandTotal.textContent = "RM " + grandTotal.toLocaleString();
  }

  window.updateCartQty = function(index, delta) {
    if (globalCart[index]) {
      const newQty = (globalCart[index].quantity || 1) + delta;
      if (newQty > 0) {
        globalCart[index].quantity = newQty;
      } else {
        // If 0, maybe remove? For now keep min 1 or user can use trash icon
        globalCart.splice(index, 1);
      }
      localStorage.setItem("shiro-global-cart", JSON.stringify(globalCart));
      renderGlobalCart();
      updateCartBadge();
    }
  };

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

  // Note: checkoutBtn listener removed as we use onclick in HTML to avoid double-triggering

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

      // Robust buildConfig extraction (handles legacy items)
      const buildConfig = globalCart.flatMap(item => {
        if (item.type === 'build' && item.items) return item.items;
        return [{ name: item.name, price: item.price }];
      });

      try {
        const response = await fetch(API_BASE + '/api/quote', {
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
        
        const resData = await response.json();
        if (!response.ok) {
           console.error('API Error:', resData);
           throw new Error(resData.error || 'Failed to save quote');
        }
        console.log('Quote saved successfully:', resData);
      } catch (err) {
        console.warn('Quote save failed:', err);
        // We still continue to WhatsApp even if API fails, but we show a warning
        if (typeof showToast === 'function') showToast("Note: Offline copy saved, but cloud sync failed.", "warning");
      }

      // Hide modal
      document.getElementById('checkoutInfoOverlay').classList.remove('show');
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

  /* ===== TEAM MEMBERS ===== */
  (async function loadTeamMembers() {
    const teamGrid = document.getElementById("teamGrid");
    if (!teamGrid) return;

    try {
      const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : window.location.origin;
      const res = await fetch(API + '/api/team');
      const d = await res.json();
      
      if (d.success && d.data && d.data.length > 0) {
        teamGrid.innerHTML = "";
        d.data.forEach(m => {
          const imgUrl = m.image_url 
            ? (m.image_url.startsWith('http') ? m.image_url : (m.image_url.startsWith('/') ? m.image_url : '/'+m.image_url))
            : 'images/placeholder-team.jpg';

          const card = document.createElement("div");
          card.className = "card team-card";
          card.innerHTML = `
            <div class="team-avatar">
                <img src="${imgUrl}" alt="${m.role}">
            </div>
            <h4>${m.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h4>
            <span class="team-role">${m.role.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
            <p>${m.bio.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            <div class="team-social"></div>
          `;
          teamGrid.appendChild(card);
        });
      }
    } catch(e) {
      console.error("Team load failed", e);
    }
  })();

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
  toast.style.cursor = "pointer"; // Make it look clickable
  toast.innerHTML = `
    <i class="${icon}"></i>
    <span class="toast-msg">${message}</span>
    <div class="toast-action">View Cart <i class="fas fa-arrow-right"></i></div>
  `;
  
  // Click to open cart
  toast.onclick = () => {
    const cartOpenBtn = document.getElementById('cartOpenBtn');
    if (cartOpenBtn) cartOpenBtn.click();
    toast.remove();
  };

  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.4s";
      setTimeout(() => toast.remove(), 400);
    }
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
  const previewContainer = document.getElementById('sb-photo-preview-container');
  const preview = document.getElementById('sb-photo-preview');
  const label = document.getElementById('sb-photo-label');
  if (photoInput) photoInput.value = '';
  window.bookingMediaFiles = []; // Clear accumulative files
  if (preview) preview.innerHTML = '';
  if (previewContainer) previewContainer.style.display = 'none';
  if (label) {
    const isBM = localStorage.getItem('shiro-lang') === 'bm';
    label.textContent = isBM ? "Klik atau seret foto/video ke sini" : "Click or drag photos/videos here";
  }
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('checkoutInfoOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'checkoutInfoOverlay') e.target.style.display = 'none';
  });
  document.getElementById('serviceBookingOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'serviceBookingOverlay') e.target.classList.remove('show');
  });

  window.bookingMediaFiles = [];

  window.removeBookingMedia = function(index) {
    window.bookingMediaFiles.splice(index, 1);
    renderBookingMediaPreviews();
  };

  function renderBookingMediaPreviews() {
    const previewContainer = document.getElementById('sb-photo-preview-container');
    const preview = document.getElementById('sb-photo-preview');
    const label = document.getElementById('sb-photo-label');
    
    if (window.bookingMediaFiles.length === 0) {
      window.clearBookingPhoto();
      return;
    }
    
    preview.innerHTML = '';
    previewContainer.style.display = 'block';
    label.textContent = `${window.bookingMediaFiles.length} file(s) selected`;
    
    window.bookingMediaFiles.forEach((file, index) => {
      const isVideo = file.type.startsWith('video/');
      const el = document.createElement('div');
      el.style.cssText = 'position:relative; width:60px; height:60px; border-radius:6px; overflow:hidden; border:1px solid rgba(255,255,255,0.2); background:#1e293b; display:flex; align-items:center; justify-content:center;';
      
      const rmBtn = `<button type="button" onclick="window.removeBookingMedia(${index})" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.6);border:none;color:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;cursor:pointer;z-index:10;"><i class="fas fa-times"></i></button>`;

      if (isVideo) {
         el.innerHTML = rmBtn + `<i class="fas fa-video" style="color:var(--neon-blue);font-size:1.5rem;"></i>`;
         preview.appendChild(el);
      } else {
         const reader = new FileReader();
         reader.onload = ev => {
           el.innerHTML = rmBtn + `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
         };
         reader.readAsDataURL(file);
         preview.appendChild(el);
      }
    });
  }

  const sbPhoto = document.getElementById('sb-photo');
  if (sbPhoto) {
    sbPhoto.addEventListener('change', function() {
      const newFiles = Array.from(this.files);
      if (newFiles.length > 0) {
        window.bookingMediaFiles = window.bookingMediaFiles.concat(newFiles);
        renderBookingMediaPreviews();
      }
      // Reset input value so same files can be selected again if needed
      this.value = '';
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

      let photoUrls = [];
      const photoFiles = window.bookingMediaFiles || [];
      
      if (photoFiles.length > 0) {
        try {
          const uploadPromises = photoFiles.map(async file => {
            const fd = new FormData();
            fd.append('photo', file);
            const res = await fetch(API_BASE + '/api/service-booking/upload-photo', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) return data.url;
            return null;
          });
          const results = await Promise.all(uploadPromises);
          photoUrls = results.filter(url => url !== null);
        } catch(uploadErr) {
          console.warn('Photo upload failed, continuing without some files:', uploadErr);
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
            photo_url: JSON.stringify(photoUrls),
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
          if (photoUrls.length > 0) {
            waMsg += '\nAttachments:\n';
            photoUrls.forEach((url, index) => {
              waMsg += `${index + 1}. ${API_BASE}${url}\n`;
            });
          }
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