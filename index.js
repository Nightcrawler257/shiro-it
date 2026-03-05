/**
 * SHIRO IT - Single Page Application
 * Consolidated from: script.js, contact.js, configurator.js, it-service.js, tech-animations.js
 */

// ===================================================================
// 1. SPA ROUTER
// ===================================================================

const SPA = {
    currentPage: 'home',
    pages: ['home', 'about', 'services', 'contact', 'build-pc'],

    init() {
        // Handle hash changes
        window.addEventListener('hashchange', () => this.navigate());

        // Handle clicks on [data-page] links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page && this.pages.includes(page)) {
                    window.location.hash = '#' + page;
                }
            }
        });

        // Navigate to initial page (from URL hash or default to home)
        const hash = window.location.hash.replace('#', '') || 'home';
        // Handle sub-hashes like #services and scroll targets
        const page = hash.split('/')[0];
        if (this.pages.includes(page)) {
            this.navigate(page);
        } else {
            this.navigate('home');
        }
    },

    navigate(targetPage) {
        if (!targetPage) {
            const hash = window.location.hash.replace('#', '') || 'home';
            targetPage = hash.split('/')[0];
        }

        if (!this.pages.includes(targetPage)) {
            targetPage = 'home';
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show target page
        const pageEl = document.getElementById('page-' + targetPage);
        if (pageEl) {
            pageEl.classList.add('active');
        }

        // Update nav active states
        document.querySelectorAll('.nav-menu a').forEach(a => {
            a.classList.remove('active');
            const dp = a.getAttribute('data-page');
            if (dp === targetPage) {
                a.classList.add('active');
            }
        });

        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'instant' });

        this.currentPage = targetPage;

        // Close mobile menu if open
        const navMenu = document.querySelector('.nav-menu');
        const menuToggle = document.querySelector('.menu-toggle');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (menuToggle) menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }

        console.log('SPA navigated to:', targetPage);
    }
};


// ===================================================================
// 2. CORE INITIALIZATION (from script.js)
// ===================================================================

document.addEventListener('DOMContentLoaded', function () {

    // ----- SPA Router -----
    SPA.init();

    // ===== MOBILE MENU TOGGLE =====
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            menuToggle.innerHTML = navMenu.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.nav-container') && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // ===== IMAGE SLIDER =====
    const slides = document.querySelectorAll('#page-home .image-slide');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');

    if (slides.length > 0 && prevBtn && nextBtn) {
        let currentSlide = 0;
        showSlide(currentSlide);

        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });

        let slideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 5000);

        const sliderContainer = document.querySelector('.image-slides-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
            sliderContainer.addEventListener('mouseleave', () => {
                slideInterval = setInterval(() => {
                    currentSlide = (currentSlide + 1) % slides.length;
                    showSlide(currentSlide);
                }, 5000);
            });
        }

        function showSlide(index) {
            slides.forEach(s => s.classList.remove('active'));
            slides[index].classList.add('active');
            const indicator = document.querySelector('.slides-indicator .current-slide');
            if (indicator) indicator.textContent = index + 1;
        }
    }

    // ===== THEME TOGGLE =====
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.setAttribute('data-theme', 'dark');
                updateThemeIcon('dark');
                localStorage.setItem('theme', 'dark');
            }
        }

        themeToggle.addEventListener('click', function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            this.style.transform = 'scale(0.9)';
            setTimeout(() => { this.style.transform = 'scale(1)'; }, 150);
        });

        function updateThemeIcon(theme) {
            const icon = themeToggle.querySelector('i');
            if (theme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                themeToggle.setAttribute('aria-label', 'Switch to light mode');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                themeToggle.setAttribute('aria-label', 'Switch to dark mode');
            }
        }
    }

    // ===== LANGUAGE SWITCHER =====
    const languageToggle = document.getElementById('languageToggle');
    const languageDropdown = document.getElementById('languageDropdown');
    const languageOptions = document.querySelectorAll('.language-option');

    if (languageToggle && languageDropdown) {
        languageToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            languageDropdown.classList.toggle('show');
        });
        document.addEventListener('click', () => languageDropdown.classList.remove('show'));
        languageDropdown.addEventListener('click', (e) => e.stopPropagation());

        languageOptions.forEach(option => {
            option.addEventListener('click', function (e) {
                e.preventDefault();
                switchLanguage(this.getAttribute('data-lang'));
                languageDropdown.classList.remove('show');
            });
        });

        const savedLang = localStorage.getItem('shiroit_lang') || 'bm';
        switchLanguage(savedLang);
    }

    function switchLanguage(lang) {
        const currentFlag = document.getElementById('currentFlag');
        const currentLanguage = document.getElementById('currentLanguage');
        if (!currentFlag || !currentLanguage) return;

        if (lang === 'en') {
            currentFlag.className = 'fi fi-us';
            currentLanguage.textContent = 'EN';
        } else {
            currentFlag.className = 'fi fi-my';
            currentLanguage.textContent = 'BM';
        }

        localStorage.setItem('shiroit_lang', lang);
        document.documentElement.lang = lang;

        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-lang') === lang) option.classList.add('active');
        });
    }

    // ===== BACK TO TOP =====
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.pageYOffset > 300);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== DROPDOWN FUNCTIONALITY =====
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.addEventListener('mouseenter', function () {
            if (window.innerWidth > 768) {
                const menu = this.querySelector('.dropdown-menu');
                if (menu) menu.style.display = 'block';
            }
        });
        dropdown.addEventListener('mouseleave', function () {
            if (window.innerWidth > 768) {
                const menu = this.querySelector('.dropdown-menu');
                if (menu) menu.style.display = 'none';
            }
        });
    });

    // ===== WHATSAPP FLOAT =====
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (whatsappFloat) {
        whatsappFloat.addEventListener('mouseenter', function () {
            this.style.width = '180px';
            this.style.borderRadius = '30px';
        });
        whatsappFloat.addEventListener('mouseleave', function () {
            this.style.width = '60px';
            this.style.borderRadius = '50%';
        });
    }

    // ===== TIER CARD INTERACTIONS =====
    document.querySelectorAll('.tier-card').forEach(card => {
        card.addEventListener('mouseenter', function () { this.style.transform = 'translateY(-10px)'; });
        card.addEventListener('mouseleave', function () { this.style.transform = 'translateY(0)'; });
        const configBtn = card.querySelector('.btn-block');
        if (configBtn) {
            configBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const tier = this.closest('.tier-card').querySelector('h3').textContent;
                localStorage.setItem('selectedTier', tier.toLowerCase().replace(' ', '-'));
                window.location.hash = '#build-pc';
            });
        }
    });

    // ===== STAT COUNTER ANIMATION =====
    function animateStats() {
        document.querySelectorAll('.stat-number[data-count]').forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            if (!target) return;
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) { current = target; clearInterval(timer); }
                stat.textContent = Math.floor(current);
            }, 16);
        });
    }

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }

    // ===== SERVICE CARD ANIMATIONS =====
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length > 0) {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('animated');
            });
        }, { threshold: 0.1 });
        serviceCards.forEach(card => cardObserver.observe(card));
    }

    // ===== PC 1.jpg FALLBACK =====
    const pcImage = document.querySelector('img[src="PC 1.jpg"]');
    if (pcImage) {
        pcImage.onerror = function () {
            this.src = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=500&fit=crop&auto=format';
            this.alt = 'Custom Gaming PC Build';
        };
    }

    // ===== ADD LOADED CLASS =====
    setTimeout(() => document.body.classList.add('loaded'), 100);


    // ===================================================================
    // 3. CONTACT PAGE: Career Carousel (from contact.js)
    // ===================================================================

    let currentCareerIndex = 0;
    const careerCards = document.querySelectorAll('.career-card');
    const careerDots = document.querySelectorAll('.career-dot');
    let careerInterval;

    function showCareer(index) {
        if (index < 0 || index >= careerCards.length) return;
        careerCards.forEach(card => card.classList.remove('active'));
        careerCards[index].classList.add('active');
        careerDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentCareerIndex = index;
    }

    function nextCareer() {
        showCareer((currentCareerIndex + 1) % careerCards.length);
    }

    function prevCareer() {
        showCareer((currentCareerIndex - 1 + careerCards.length) % careerCards.length);
    }

    function startCareerInterval() {
        if (careerCards.length > 1) {
            clearInterval(careerInterval);
            careerInterval = setInterval(nextCareer, 10000);
        }
    }

    if (careerCards.length > 0) {
        showCareer(0);
        startCareerInterval();

        const prevCareerBtn = document.querySelector('.prev-career');
        const nextCareerBtn = document.querySelector('.next-career');
        if (prevCareerBtn) prevCareerBtn.addEventListener('click', (e) => { e.preventDefault(); prevCareer(); clearInterval(careerInterval); startCareerInterval(); });
        if (nextCareerBtn) nextCareerBtn.addEventListener('click', (e) => { e.preventDefault(); nextCareer(); clearInterval(careerInterval); startCareerInterval(); });

        careerCards.forEach(card => {
            card.addEventListener('mouseenter', () => clearInterval(careerInterval));
            card.addEventListener('mouseleave', () => startCareerInterval());
        });

        careerDots.forEach((dot, idx) => {
            dot.addEventListener('click', (e) => { e.preventDefault(); showCareer(idx); clearInterval(careerInterval); startCareerInterval(); });
        });
    }

    window.applyForJob = function (position) {
        const applyForm = document.getElementById('apply-form');
        if (applyForm) applyForm.scrollIntoView({ behavior: 'smooth' });
        const jobTitleElement = document.getElementById('job-title');
        if (jobTitleElement) jobTitleElement.textContent = position;
        const positionSelect = document.getElementById('applicant-position');
        if (positionSelect) positionSelect.value = position;
        setTimeout(() => {
            const nameField = document.getElementById('applicant-name');
            if (nameField) nameField.focus();
        }, 500);
    };


    // ===================================================================
    // 4. IT SERVICES (from it-service.js)
    // ===================================================================

    window.itServicesManager = new ITServicesManager();


    // ===================================================================
    // 5. CONFIGURATOR (from configurator.js)
    // ===================================================================

    // Only init if pcComponentsDB and pcVisualizer exist (build-pc page elements present)
    if (document.querySelector('.advanced-configurator')) {
        try {
            window.pcConfigurator = new PCConfigurator();
        } catch (err) {
            console.warn('PCConfigurator init skipped:', err.message);
        }

        // Component selection delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('component-select-btn')) {
                const componentId = e.target.dataset.id;
                const category = e.target.dataset.category;
                if (window.pcComponentsDB) {
                    const component = window.pcComponentsDB.components[category]?.find(c => c.id === componentId);
                    if (component && window.pcVisualizer) {
                        window.pcVisualizer.displayComponent(category, component);
                    }
                }
            }
        });

        // Gallery build application
        document.querySelectorAll('.btn-apply-build').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const buildType = e.currentTarget.dataset.build;
                if (window.pcVisualizer) window.pcVisualizer.applyGalleryBuild(buildType);
            });
        });
    }


    // ===================================================================
    // 6. ANIMATIONS (from tech-animations.js + script.js activator)
    // ===================================================================

    initAnimations();


    // ===================================================================
    // ALL INITIALIZED
    // ===================================================================
    console.log('SHIRO IT SPA loaded successfully');
});


// ===================================================================
// IT SERVICES MANAGER CLASS (from it-service.js)
// ===================================================================

class ITServicesManager {
    constructor() {
        this.servicePrices = {
            'computer-slow': 80, 'computer-no-power': 150,
            'computer-blue-screen': 120, 'computer-overheating': 100,
            'laptop-screen': 299, 'laptop-battery': 199,
            'laptop-keyboard': 149, 'laptop-charging': 120,
            'wifi-setup': 120, 'network-cabling': 250,
            'virus-removal': 99, 'data-recovery': 399,
            'pos-setup': 599, 'server-setup': 899
        };
        this.init();
    }

    init() {
        this.initServiceSelector();
        this.initRepairTracker();
        this.initBookingSystem();
        this.initEmergencyWidget();
        this.initSolutionTutorials();
        this.initBusinessPackages();
        this.initMaintenanceBooking();
    }

    initServiceSelector() {
        const issueCategories = document.querySelectorAll('.issue-category');
        const issueOptions = document.getElementById('issueOptions');
        if (!issueCategories.length || !issueOptions) return;

        const serviceOptions = {
            computer: [
                { id: 'computer-slow', name: 'Computer is Slow', price: 80 },
                { id: 'computer-no-power', name: 'Computer Won\'t Turn On', price: 150 },
                { id: 'computer-blue-screen', name: 'Blue Screen Errors', price: 120 },
                { id: 'computer-overheating', name: 'Overheating Issues', price: 100 }
            ],
            laptop: [
                { id: 'laptop-screen', name: 'Screen Repair/Replacement', price: 299 },
                { id: 'laptop-battery', name: 'Battery Replacement', price: 199 },
                { id: 'laptop-keyboard', name: 'Keyboard Repair', price: 149 },
                { id: 'laptop-charging', name: 'Charging Issues', price: 120 }
            ],
            network: [
                { id: 'wifi-setup', name: 'WiFi Setup & Optimization', price: 120 },
                { id: 'network-cabling', name: 'Network Cabling', price: 250 },
                { id: 'router-config', name: 'Router Configuration', price: 100 },
                { id: 'internet-slow', name: 'Slow Internet Fix', price: 80 }
            ],
            virus: [
                { id: 'virus-removal', name: 'Virus & Malware Removal', price: 99 },
                { id: 'antivirus-setup', name: 'Antivirus Installation', price: 60 },
                { id: 'ransomware', name: 'Ransomware Recovery', price: 299 },
                { id: 'security-scan', name: 'Security Scan', price: 50 }
            ],
            data: [
                { id: 'data-recovery', name: 'Data Recovery', price: 399 },
                { id: 'backup-setup', name: 'Backup System Setup', price: 150 },
                { id: 'raid-recovery', name: 'RAID Recovery', price: 499 },
                { id: 'ssd-recovery', name: 'SSD Data Recovery', price: 599 }
            ],
            business: [
                { id: 'pos-setup', name: 'POS System Setup', price: 599 },
                { id: 'server-setup', name: 'Server Configuration', price: 899 },
                { id: 'email-setup', name: 'Email System Setup', price: 299 },
                { id: 'network-infra', name: 'Network Infrastructure', price: 1200 }
            ]
        };

        issueCategories.forEach(category => {
            category.addEventListener('click', () => {
                issueCategories.forEach(cat => cat.classList.remove('active'));
                category.classList.add('active');
                const categoryType = category.getAttribute('data-category');
                const options = serviceOptions[categoryType] || [];

                let html = '<h4>Select Specific Issue:</h4><div class="service-options-grid">';
                if (options.length > 0) {
                    options.forEach(option => {
                        html += `<div class="service-option" data-id="${option.id}" data-price="${option.price}">
                            <span>${option.name}</span>
                            <span class="option-price">RM ${option.price}</span>
                        </div>`;
                    });
                }
                html += '</div>';
                issueOptions.innerHTML = html;
                this.initServiceOptions();
            });
        });

        if (issueCategories.length > 0) {
            setTimeout(() => issueCategories[0].click(), 500);
        }
    }

    initServiceOptions() {
        const serviceOptions = document.querySelectorAll('.service-option');
        const estimatedPrice = document.getElementById('estimatedPrice');
        const bookServiceBtn = document.getElementById('bookService');

        serviceOptions.forEach(option => {
            option.addEventListener('click', () => {
                serviceOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                const price = option.getAttribute('data-price');
                if (estimatedPrice) estimatedPrice.textContent = price;
                if (bookServiceBtn) { bookServiceBtn.disabled = false; bookServiceBtn.textContent = 'Book This Service'; }
            });
        });

        if (bookServiceBtn) {
            bookServiceBtn.addEventListener('click', () => {
                const selectedOption = document.querySelector('.service-option.selected');
                if (!selectedOption) { this.showNotification('Please select a service first', 'warning'); return; }
                const serviceId = selectedOption.getAttribute('data-id');
                const servicePrice = selectedOption.getAttribute('data-price');
                const serviceName = selectedOption.querySelector('span:first-child').textContent;

                localStorage.setItem('selected_service', JSON.stringify({
                    id: serviceId, name: serviceName, price: servicePrice,
                    timestamp: new Date().toISOString()
                }));

                const bookingSection = document.getElementById('booking');
                if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });

                setTimeout(() => {
                    const serviceTypeSelect = document.getElementById('serviceType');
                    if (serviceTypeSelect) {
                        const serviceText = serviceName.toLowerCase();
                        for (let option of serviceTypeSelect.options) {
                            if (option.text.toLowerCase().includes(serviceText.substring(0, 10))) {
                                serviceTypeSelect.value = option.value; break;
                            }
                        }
                    }
                }, 500);

                this.showNotification(`Service "${serviceName}" selected. Please fill booking form.`, 'success');
            });
        }
    }

    initRepairTracker() {
        const trackBtn = document.getElementById('trackRepair');
        const ticketInput = document.getElementById('ticketNumber');
        const trackerResults = document.getElementById('trackerResults');
        if (!trackBtn) return;

        const repairDatabase = {
            'SHIRO2024001': { device: 'ASUS Laptop TUF Gaming', issue: 'Screen Replacement', status: 'testing', received: '2024-01-28', estimated: '2024-02-02', technician: 'Ahmad', notes: 'Screen replaced, running burn-in tests' },
            'SHIRO2024002': { device: 'Custom Gaming PC', issue: 'CPU Upgrade & Thermal Paste', status: 'repair', received: '2024-01-29', estimated: '2024-02-03', technician: 'Siti', notes: 'Waiting for thermal paste delivery' },
            'SHIRO2024003': { device: 'Dell OptiPlex Desktop', issue: 'Virus Removal & OS Reinstall', status: 'ready', received: '2024-01-27', estimated: '2024-01-30', technician: 'Raj', notes: 'Ready for pickup. Data backed up.' },
            'SHIRO2024004': { device: 'HP Pavilion Laptop', issue: 'Keyboard Replacement', status: 'diagnosis', received: '2024-01-30', estimated: '2024-02-05', technician: 'Ali', notes: 'Diagnosing keyboard connection issue' }
        };

        trackBtn.addEventListener('click', () => {
            const ticketNo = ticketInput.value.trim().toUpperCase();
            if (!ticketNo) { this.showNotification('Please enter a ticket number', 'warning'); return; }
            if (!ticketNo.startsWith('SHIRO')) { this.showNotification('Please enter a valid SHIRO ticket number', 'warning'); return; }

            const repair = repairDatabase[ticketNo];
            if (repair) {
                const statusMap = {
                    diagnosis: { text: 'In Diagnosis', cls: 'status-diagnosis', icon: 'fas fa-search' },
                    repair: { text: 'Repair in Progress', cls: 'status-repair', icon: 'fas fa-tools' },
                    testing: { text: 'Quality Testing', cls: 'status-testing', icon: 'fas fa-vial' },
                    ready: { text: 'Ready for Pickup', cls: 'status-ready', icon: 'fas fa-check-circle' }
                };
                const s = statusMap[repair.status] || statusMap.diagnosis;

                trackerResults.innerHTML = `
                    <div class="repair-details">
                        <div class="repair-header">
                            <h4><i class="fas fa-ticket-alt"></i> Repair Ticket: ${ticketNo}</h4>
                            <span class="status-badge ${s.cls}"><i class="${s.icon}"></i> ${s.text}</span>
                        </div>
                        <div class="detail-grid">
                            <div class="detail-item"><span><i class="fas fa-desktop"></i> Device:</span><span>${repair.device}</span></div>
                            <div class="detail-item"><span><i class="fas fa-exclamation-circle"></i> Issue:</span><span>${repair.issue}</span></div>
                            <div class="detail-item"><span><i class="fas fa-user-tie"></i> Technician:</span><span>${repair.technician}</span></div>
                            <div class="detail-item"><span><i class="fas fa-calendar-check"></i> Received:</span><span>${repair.received}</span></div>
                            <div class="detail-item"><span><i class="fas fa-calendar-alt"></i> Estimated:</span><span>${repair.estimated}</span></div>
                            <div class="detail-item"><span><i class="fas fa-sticky-note"></i> Notes:</span><span class="notes">${repair.notes}</span></div>
                        </div>
                        <div class="repair-notice"><i class="fas fa-info-circle"></i><p>We will contact you when your device is ready for pickup.</p></div>
                    </div>`;
                this.updateRepairFlow(repair.status);
                trackerResults.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                trackerResults.innerHTML = `
                    <div class="repair-not-found">
                        <i class="fas fa-search"></i>
                        <h4>Repair Ticket Not Found</h4>
                        <p>The ticket number <strong>${ticketNo}</strong> was not found.</p>
                        <div class="suggestions"><ul>
                            <li>Check the ticket number on your receipt</li>
                            <li>Contact us at 017-458 2351</li>
                        </ul></div>
                    </div>`;
            }
        });

        if (ticketInput) {
            ticketInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') trackBtn.click(); });
        }
    }

    updateRepairFlow(status) {
        const flowSteps = document.querySelectorAll('.flow-step');
        const statusIndex = { diagnosis: 0, repair: 1, testing: 2, ready: 3 };
        flowSteps.forEach(step => { step.classList.remove('active', 'completed'); });
        const currentIndex = statusIndex[status];
        for (let i = 0; i <= currentIndex; i++) {
            if (flowSteps[i]) {
                flowSteps[i].classList.add(i < currentIndex ? 'completed' : 'active');
            }
        }
    }

    initBookingSystem() {
        const submitBtn = document.getElementById('submitBooking');
        if (!submitBtn) return;

        const dateInput = document.getElementById('preferredDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.value = today;
        }

        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceType = document.getElementById('serviceType')?.value;
            const preferredDate = document.getElementById('preferredDate')?.value;
            const timeSlot = document.getElementById('timeSlot')?.value;
            const customerName = document.getElementById('customerName')?.value;
            const customerPhone = document.getElementById('customerPhone')?.value;
            const issueDescription = document.getElementById('issueDescription')?.value;

            const errors = [];
            if (!serviceType) errors.push('Service Type');
            if (!preferredDate) errors.push('Preferred Date');
            if (!timeSlot) errors.push('Time Slot');
            if (!customerName) errors.push('Your Name');
            if (!customerPhone) errors.push('Phone Number');
            if (!issueDescription) errors.push('Issue Description');

            if (errors.length > 0) { this.showNotification(`Please fill in: ${errors.join(', ')}`, 'warning'); return; }

            const phoneRegex = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;
            if (!phoneRegex.test(customerPhone.replace(/\s+/g, ''))) {
                this.showNotification('Please enter a valid Malaysian phone number', 'warning');
                return;
            }

            const bookingData = {
                serviceType, preferredDate, timeSlot, customerName, customerPhone,
                customerEmail: document.getElementById('customerEmail')?.value || '',
                issueDescription,
                selectedService: JSON.parse(localStorage.getItem('selected_service') || '{}'),
                timestamp: new Date().toISOString(),
                bookingId: 'BOOK' + Date.now()
            };

            const existingBookings = JSON.parse(localStorage.getItem('shiroit_bookings') || '[]');
            existingBookings.push(bookingData);
            localStorage.setItem('shiroit_bookings', JSON.stringify(existingBookings));
            localStorage.removeItem('selected_service');

            this.showNotification(`<strong>Booking Successful!</strong><br>Your Booking ID: <strong>${bookingData.bookingId}</strong>`, 'success');

            const form = document.querySelector('.booking-form');
            if (form) form.reset();
            if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        });
    }

    initEmergencyWidget() {
        const emergencyWidget = document.getElementById('emergencyWidget');
        const closeBtn = document.getElementById('closeEmergency');
        if (!emergencyWidget || !closeBtn) return;

        // Show widget after 20s if on services page
        setTimeout(() => {
            if (SPA.currentPage === 'services' && !localStorage.getItem('emergency_widget_closed')) {
                emergencyWidget.style.display = 'block';
                emergencyWidget.classList.add('visible');
            }
        }, 20000);

        closeBtn.addEventListener('click', () => {
            emergencyWidget.classList.remove('visible');
            setTimeout(() => { emergencyWidget.style.display = 'none'; }, 300);
            localStorage.setItem('emergency_widget_closed', 'true');
        });
    }

    initSolutionTutorials() {
        document.querySelectorAll('.btn-show-steps').forEach(btn => {
            btn.addEventListener('click', () => {
                const stepsContainer = btn.previousElementSibling;
                if (stepsContainer.style.maxHeight) {
                    stepsContainer.style.maxHeight = null;
                    btn.innerHTML = '<i class="fas fa-chevron-down"></i> Show Detailed Steps';
                } else {
                    stepsContainer.style.maxHeight = stepsContainer.scrollHeight + 'px';
                    btn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Steps';
                }
            });
        });
    }

    initBusinessPackages() {
        document.querySelectorAll('.choose-plan').forEach(btn => {
            btn.addEventListener('click', () => {
                const plan = btn.getAttribute('data-plan');
                const planName = btn.closest('.package-card')?.querySelector('h3')?.textContent || plan;
                const planPrice = btn.closest('.package-card')?.querySelector('.package-price')?.textContent || '';

                localStorage.setItem('selected_business_plan', JSON.stringify({
                    plan, name: planName, price: planPrice, timestamp: new Date().toISOString()
                }));

                const bookingSection = document.getElementById('booking');
                if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });

                setTimeout(() => {
                    const serviceTypeSelect = document.getElementById('serviceType');
                    if (serviceTypeSelect) serviceTypeSelect.value = 'business';
                    const issueDescription = document.getElementById('issueDescription');
                    if (issueDescription) issueDescription.value = `Interested in ${planName} (${planPrice}).`;
                }, 500);

                this.showNotification(`Selected ${planName} business package.`, 'success');
            });
        });
    }

    initMaintenanceBooking() {
        document.querySelectorAll('.book-service').forEach(button => {
            button.addEventListener('click', () => {
                const service = button.getAttribute('data-service');
                const priceElement = button.closest('.service-item, .service-tier')?.querySelector('.price');
                const price = priceElement ? priceElement.textContent : 'Contact for quote';

                localStorage.setItem('selected_maintenance', JSON.stringify({
                    service, price, timestamp: new Date().toISOString()
                }));

                const bookingSection = document.getElementById('booking');
                if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });

                setTimeout(() => {
                    const serviceTypeSelect = document.getElementById('serviceType');
                    const issueDescription = document.getElementById('issueDescription');
                    if (serviceTypeSelect) serviceTypeSelect.value = 'other';
                    if (issueDescription) issueDescription.value = `Interested in: ${service}\nPrice: ${price}`;
                }, 500);

                this.showNotification(`Selected "${service}" service.`, 'success');
            });
        });

        const assessmentBtn = document.getElementById('bookAssessment');
        if (assessmentBtn) {
            assessmentBtn.addEventListener('click', () => {
                localStorage.setItem('selected_service', JSON.stringify({
                    id: 'network-assessment', name: 'Free Network Assessment', price: 'FREE',
                    timestamp: new Date().toISOString()
                }));

                const bookingSection = document.getElementById('booking');
                if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });

                setTimeout(() => {
                    const serviceTypeSelect = document.getElementById('serviceType');
                    const issueDescription = document.getElementById('issueDescription');
                    if (serviceTypeSelect) serviceTypeSelect.value = 'network';
                    if (issueDescription) issueDescription.value = 'I would like to book a FREE Network Assessment.';
                }, 500);

                this.showNotification('Free Network Assessment selected!', 'success');
            });
        }
    }

    showNotification(message, type = 'info') {
        document.querySelectorAll('.service-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `service-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <div class="notification-content">${message}</div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;

        document.body.appendChild(notification);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => { if (notification.parentNode) notification.remove(); }, 300);
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => { if (notification.parentNode) notification.remove(); }, 300);
            }
        }, 5000);

        setTimeout(() => notification.classList.add('show'), 10);
    }
}


// ===================================================================
// PC CONFIGURATOR CLASS (from configurator.js)
// ===================================================================

class PCConfigurator {
    constructor() {
        this.currentBuild = {};
        this.totalPrice = 300;
        this.init();
    }

    init() {
        this.setupQuickStart();
        this.setupActionButtons();
        this.loadSavedConfig();
    }

    setupQuickStart() {
        document.querySelectorAll('.quick-start-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const tier = e.currentTarget.dataset.tier;
                this.loadQuickStartBuild(tier);
            });
        });
    }

    loadQuickStartBuild(tier) {
        const builds = {
            starter: {}, pro: {}, elite: {}
        };

        // Build component maps from pcComponentsDB
        if (window.pcComponentsDB) {
            ['starter', 'pro', 'elite'].forEach((t, idx) => {
                ['case', 'motherboard', 'cpu', 'gpu', 'ram', 'storage', 'cooling', 'psu'].forEach(type => {
                    if (window.pcComponentsDB.components[type]?.[idx]) {
                        builds[t][type] = window.pcComponentsDB.components[type][idx];
                    }
                });
            });
        }

        if (builds[tier] && window.pcVisualizer) {
            window.pcVisualizer.resetView();
            Object.entries(builds[tier]).forEach(([type, component], index) => {
                setTimeout(() => {
                    window.pcVisualizer.displayComponent(type, component);
                }, index * 300);
            });
            this.showNotification(`${tier} build loaded!`, 'success');
        }
    }

    setupActionButtons() {
        const ids = ['save-configuration', 'get-quote', 'share-build', 'print-build', 'export-build'];
        const handlers = [() => this.saveConfiguration(), () => this.getQuote(), () => this.shareBuild(), () => this.printBuild(), () => this.exportBuild()];

        ids.forEach((id, i) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', handlers[i]);
        });
    }

    saveConfiguration() {
        if (window.pcVisualizer) window.pcVisualizer.saveConfiguration();
    }

    getQuote() {
        this.showNotification('Quote request sent! We\'ll contact you soon.', 'success');
    }

    shareBuild() {
        if (window.pcVisualizer) window.pcVisualizer.generateShareLink();
    }

    printBuild() {
        const components = window.pcVisualizer ? window.pcVisualizer.components : {};
        let html = `<!DOCTYPE html><html><head><title>SHIRO IT - PC Build</title>
            <style>body{font-family:Arial,sans-serif;margin:40px}h1{color:#333}.component{margin:20px 0;padding:15px;border:1px solid #ddd}.price{font-weight:bold;color:#2ecc71}.total{font-size:1.5em;margin-top:30px}</style>
            </head><body><h1>PC Build Configuration - SHIRO IT</h1><p>Generated: ${new Date().toLocaleString()}</p><hr>`;

        Object.entries(components).forEach(([type, component]) => {
            if (component) {
                html += `<div class="component"><h3>${type.toUpperCase()}: ${component.brand} ${component.name}</h3>
                    <p>${component.specs}</p><p class="price">Price: RM ${component.price}</p></div>`;
            }
        });

        const total = this.calculateTotalPrice();
        html += `<div class="total"><h3>Total: RM ${total}</h3></div><hr>
            <p>Contact: 017-458 2351 / 017-761 7672</p></body></html>`;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }

    exportBuild() {
        const components = window.pcVisualizer ? window.pcVisualizer.components : {};
        const data = {
            components, totalPrice: this.calculateTotalPrice(),
            timestamp: new Date().toISOString(), shop: 'SHIRO IT'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shiro-it-pc-build-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showNotification('Build exported as JSON file', 'success');
    }

    calculateTotalPrice() {
        return window.pcVisualizer ? window.pcVisualizer.calculateTotalPrice() : 300;
    }

    loadSavedConfig() {
        const saved = localStorage.getItem('pcBuildConfig');
        if (saved) {
            try { console.log('Loaded saved config:', JSON.parse(saved)); }
            catch (e) { console.error('Error loading saved config:', e); }
        }
    }

    showNotification(message, type = 'info') {
        if (window.pcVisualizer) window.pcVisualizer.showNotification(message, type);
        else if (window.itServicesManager) window.itServicesManager.showNotification(message, type);
        else alert(message);
    }
}


// ===================================================================
// ANIMATIONS (from tech-animations.js + script.js activator)
// ===================================================================

function initAnimations() {
    // Configurator animations
    const configurator = document.querySelector('.advanced-configurator');
    if (configurator && !configurator.querySelector('.configurator-animations')) {
        const animationsContainer = document.createElement('div');
        animationsContainer.className = 'configurator-animations';
        configurator.insertBefore(animationsContainer, configurator.firstChild);

        // Circuit board
        const circuitBoard = document.createElement('div');
        circuitBoard.className = 'circuit-board';
        animationsContainer.appendChild(circuitBoard);
        for (let i = 0; i < 4; i++) {
            const line = document.createElement('div');
            line.className = 'circuit-line';
            circuitBoard.appendChild(line);
        }

        // Data stream
        const dataStream = document.createElement('div');
        dataStream.className = 'data-stream';
        animationsContainer.appendChild(dataStream);
        for (let i = 0; i < 40; i++) {
            const point = document.createElement('div');
            point.className = 'data-point';
            point.style.left = `${Math.random() * 100}%`;
            point.style.top = `${Math.random() * 100}%`;
            point.style.animationDelay = `${Math.random() * 4}s`;
            point.style.animationDuration = `${3 + Math.random() * 3}s`;
            dataStream.appendChild(point);
        }

        // Binary rain
        const binaryRain = document.createElement('div');
        binaryRain.className = 'binary-rain';
        animationsContainer.appendChild(binaryRain);
        for (let i = 0; i < 25; i++) {
            const digit = document.createElement('div');
            digit.className = 'binary-digit';
            digit.textContent = Math.random() > 0.5 ? '1' : '0';
            digit.style.left = `${Math.random() * 100}%`;
            digit.style.animationDelay = `${Math.random() * 8}s`;
            digit.style.animationDuration = `${6 + Math.random() * 4}s`;
            binaryRain.appendChild(digit);
        }

        // Tech grid + particle network
        animationsContainer.appendChild(Object.assign(document.createElement('div'), { className: 'tech-grid' }));

        const particleNetwork = document.createElement('div');
        particleNetwork.className = 'particle-network';
        animationsContainer.appendChild(particleNetwork);
        for (let i = 0; i < 60; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            particleNetwork.appendChild(particle);
        }

        // Energy pulse
        const energyPulse = document.createElement('div');
        energyPulse.className = 'energy-pulse';
        animationsContainer.appendChild(energyPulse);
        for (let i = 0; i < 3; i++) {
            const ring = document.createElement('div');
            ring.className = 'pulse-ring';
            energyPulse.appendChild(ring);
        }

        // Floating chips
        const chipsContainer = document.createElement('div');
        chipsContainer.className = 'floating-chips';
        animationsContainer.appendChild(chipsContainer);
        for (let i = 0; i < 4; i++) {
            const chip = document.createElement('div');
            chip.className = 'floating-chip';
            chip.style.left = `${5 + i * 25}%`;
            chip.style.top = `${10 + i * 20}%`;
            chipsContainer.appendChild(chip);
        }
    }

    // Section animations (hero, services, gaming, etc.)
    const sectionsToAnimate = ['.hero-section', '.services-section', '.gaming-section', '.cta-section', '.contact-section'];
    sectionsToAnimate.forEach(sel => {
        const section = document.querySelector(sel);
        if (section && !section.querySelector('.dynamic-animations')) {
            const container = document.createElement('div');
            container.className = 'dynamic-animations';
            section.insertBefore(container, section.firstChild);

            // Circuit board
            const cb = document.createElement('div');
            cb.className = 'circuit-board';
            container.appendChild(cb);
            for (let i = 0; i < 4; i++) {
                const l = document.createElement('div');
                l.className = 'circuit-line';
                cb.appendChild(l);
            }

            // Data stream
            const ds = document.createElement('div');
            ds.className = 'data-stream';
            container.appendChild(ds);
            for (let i = 0; i < 20; i++) {
                const p = document.createElement('div');
                p.className = 'data-point';
                p.style.left = `${Math.random() * 100}%`;
                p.style.top = `${Math.random() * 100}%`;
                p.style.animationDelay = `${Math.random() * 6}s`;
                ds.appendChild(p);
            }

            // Particle network
            const pn = document.createElement('div');
            pn.className = 'particle-network';
            container.appendChild(pn);
            for (let i = 0; i < 30; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                p.style.left = `${Math.random() * 100}%`;
                p.style.top = `${Math.random() * 100}%`;
                p.style.animationDelay = `${Math.random() * 3}s`;
                pn.appendChild(p);
            }

            // Energy pulse for hero/cta
            if (section.classList.contains('hero-section') || section.classList.contains('cta-section')) {
                const ep = document.createElement('div');
                ep.className = 'energy-pulse';
                container.appendChild(ep);
                for (let i = 0; i < 3; i++) {
                    const ring = document.createElement('div');
                    ring.className = 'pulse-ring';
                    ep.appendChild(ring);
                }
            }
        }
    });
}


// ===================================================================
// WINDOW-LEVEL HANDLERS
// ===================================================================

window.addEventListener('resize', function () {
    const navMenu = document.querySelector('.nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    if (window.innerWidth > 768 && navMenu) {
        navMenu.classList.remove('active');
        if (menuToggle) menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
    }
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        const menuToggle = document.querySelector('.menu-toggle');
        const languageDropdown = document.getElementById('languageDropdown');
        if (navMenu?.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (menuToggle) menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
        if (languageDropdown?.classList.contains('show')) {
            languageDropdown.classList.remove('show');
        }
    }
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        document.getElementById('themeToggle')?.click();
    }
});


// ===================================================================
// NOTIFICATION STYLES (injected once)
// ===================================================================

if (!document.querySelector('#service-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'service-notification-styles';
    style.textContent = `
        .service-notification {
            position: fixed; top: 20px; right: 20px;
            background: var(--bg-card, #1a1a2e); border-left: 4px solid var(--primary, #00dbde);
            padding: 15px 20px; border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            display: flex; align-items: flex-start; gap: 12px;
            z-index: 10000; max-width: 400px;
            transform: translateX(120%); transition: transform 0.3s ease;
        }
        .service-notification.show { transform: translateX(0); }
        .service-notification.success { border-left-color: #16a34a; }
        .service-notification.warning { border-left-color: #d97706; }
        .service-notification i:first-child { font-size: 1.3rem; margin-top: 2px; }
        .service-notification.success i:first-child { color: #16a34a; }
        .service-notification.warning i:first-child { color: #d97706; }
        .notification-content { flex: 1; font-size: 0.95rem; line-height: 1.5; color: white; }
        .notification-close { background: none; border: none; color: #aaa; cursor: pointer; padding: 5px; }
        .notification-close:hover { color: white; }
    `;
    document.head.appendChild(style);
}


// ===================================================================
// PC VISUALIZATION SYSTEM (merged from pc visualaztions.js)
// ===================================================================
// PC Visualization System
class PCVisualization {
    constructor() {
        this.components = {
            case: null,
            motherboard: null,
            cpu: null,
            gpu: null,
            ram: null,
            storage: null,
            cooling: null,
            psu: null
        };
        
        this.currentView = 'isometric';
        this.currentStage = 'case';
        this.apiBaseUrl = 'https://api.placeholder.com/pc-components'; // Replace with your API
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDefaultComponents();
        this.initialize3DView();
    }
    
    setupEventListeners() {
        // View controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setView(e.target.dataset.view);
            });
        });
        
        // Progress steps
        document.querySelectorAll('.progress-step').forEach(step => {
            step.addEventListener('click', (e) => {
                this.setStage(e.target.dataset.step);
            });
        });
        
        // Component selection listeners (will be connected from main configurator)
    }
    
    async loadDefaultComponents() {
        // Load some default component images
        const defaultComponents = {
            case: {
                id: 'default-case',
                name: 'Default ATX Case',
                brand: 'Generic',
                image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop',
                price: 0,
                specs: 'ATX Mid Tower'
            },
            motherboard: {
                id: 'default-motherboard',
                name: 'ATX Motherboard',
                brand: 'Generic',
                image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
                price: 0,
                specs: 'ATX Form Factor'
            }
        };
        
        // You can load from API here
        try {
            // const response = await fetch(`${this.apiBaseUrl}/default`);
            // const data = await response.json();
            // this.displayComponent('case', data.case);
        } catch (error) {
            console.log('Using default components');
            this.displayComponent('case', defaultComponents.case);
            this.displayComponent('motherboard', defaultComponents.motherboard);
        }
    }
    
    initialize3DView() {
        const pcCase3D = document.getElementById('pcCase3D');
        if (!pcCase3D) return;
        
        // Create 3D component slots
        this.create3DSlots();
        
        // Start subtle rotation animation
        this.animate3DView();
    }
    
    create3DSlots() {
        const slots = [
            { type: 'motherboard', className: 'motherboard-slot-3d' },
            { type: 'cpu', className: 'cpu-slot-3d' },
            { type: 'gpu', className: 'gpu-slot-3d' },
            { type: 'ram', className: 'ram-slot-3d' },
            { type: 'psu', className: 'psu-slot-3d' },
            { type: 'storage', className: 'storage-slot-3d' },
            { type: 'cooling', className: 'cooling-slot-3d' }
        ];
        
        slots.forEach(slot => {
            const div = document.createElement('div');
            div.className = `component-slot-3d ${slot.className}`;
            div.dataset.component = slot.type;
            div.innerHTML = `<div class="slot-label">${slot.type.toUpperCase()}</div>`;
            document.getElementById('pcCase3D').appendChild(div);
        });
    }
    
    animate3DView() {
        const pcCase3D = document.getElementById('pcCase3D');
        let rotation = 0;
        
        const animate = () => {
            if (this.currentView === 'isometric') {
                rotation += 0.2;
                pcCase3D.style.transform = `rotateY(${rotation}deg)`;
            }
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    setView(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update 3D view
        const pcCase3D = document.getElementById('pcCase3D');
        switch(view) {
            case 'front':
                pcCase3D.style.transform = 'rotateY(0deg)';
                break;
            case 'side':
                pcCase3D.style.transform = 'rotateY(90deg)';
                break;
            case 'isometric':
                // Auto-rotation handled by animation
                break;
            case 'exploded':
                this.showExplodedView();
                break;
        }
    }
    
    setStage(stage) {
        this.currentStage = stage;
        
        // Update progress steps
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.toggle('active', step.dataset.step === stage);
        });
        
        // Update build stages
        document.querySelectorAll('.build-stage').forEach(stageDiv => {
            stageDiv.classList.toggle('active', stageDiv.id === `${stage}-stage`);
        });
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        const steps = ['case', 'motherboard', 'cpu', 'ram', 'gpu', 'storage', 'cooling', 'psu'];
        const progress = ((steps.indexOf(stage) + 1) / steps.length) * 100;
        progressFill.style.width = `${progress}%`;
        
        // Scroll to component selection
        this.scrollToComponent(stage);
    }
    
    async displayComponent(type, component) {
        this.components[type] = component;
        
        // Update component slot
        const slot = document.querySelector(`.${type}-slot`);
        if (slot) {
            slot.classList.add('filled');
            slot.innerHTML = `
                <img src="${component.image}" alt="${component.name}" class="component-image">
                <div class="component-details">
                    <h5>${component.brand} ${component.name}</h5>
                    <p>${component.specs}</p>
                    <p class="price">RM ${component.price}</p>
                </div>
            `;
        }
        
        // Update 3D slot
        const slot3D = document.querySelector(`.${type}-slot-3d`);
        if (slot3D) {
            slot3D.classList.add('filled');
            slot3D.innerHTML = `<img src="${component.image}" alt="${component.name}" class="component-image-3d">`;
        }
        
        // Update spec preview
        this.updateSpecPreview(type, component);
        
        // Animate component addition
        this.animateComponentAddition(type);
        
        // Update compatibility check
        this.checkCompatibility();
    }
    
    animateComponentAddition(type) {
        const slot = document.querySelector(`.${type}-slot`);
        if (slot) {
            slot.style.animation = 'none';
            setTimeout(() => {
                slot.style.animation = 'componentAppear 0.5s ease';
            }, 10);
        }
    }
    
    updateSpecPreview(type, component) {
        const specElement = document.getElementById(`preview-${type}`);
        if (specElement) {
            specElement.querySelector('.spec-value').textContent = `${component.brand} ${component.name}`;
        }
    }
    
    checkCompatibility() {
        // Implement compatibility checking logic here
        // This is a simplified example
        const checks = document.querySelectorAll('.compatibility-item');
        
        // Update compatibility status based on selected components
        if (this.components.cpu && this.components.motherboard) {
            // Check CPU-Motherboard compatibility
            const isCompatible = this.checkCPUCompatibility();
            checks[0].className = `compatibility-item ${isCompatible ? 'success' : 'warning'}`;
            checks[0].querySelector('span').textContent = 
                `CPU-Motherboard: ${isCompatible ? 'Compatible' : 'Check Compatibility'}`;
        }
        
        if (this.components.psu && this.components.gpu) {
            // Check PSU wattage
            const hasEnoughPower = this.checkPSUWattage();
            checks[1].className = `compatibility-item ${hasEnoughPower ? 'success' : 'warning'}`;
        }
    }
    
    checkCPUCompatibility() {
        // Implement actual CPU-Motherboard compatibility check
        return true;
    }
    
    checkPSUWattage() {
        // Implement PSU wattage calculation
        return true;
    }
    
    scrollToComponent(type) {
        const categoryTab = document.querySelector(`[data-category="${type}"]`);
        if (categoryTab) {
            categoryTab.click();
            
            // Scroll to component list
            const componentList = document.getElementById(`${type}-components`);
            if (componentList) {
                componentList.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
    
    showExplodedView() {
        // Create exploded view effect
        const slots = document.querySelectorAll('.component-slot-3d');
        slots.forEach((slot, index) => {
            const angle = (index / slots.length) * Math.PI * 2;
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            slot.style.transform = `translate(${x}px, ${y}px) scale(1.2)`;
            slot.style.transition = 'transform 1s ease';
            slot.style.zIndex = '100';
        });
    }
    
    resetView() {
        // Reset all components
        this.components = {
            case: null,
            motherboard: null,
            cpu: null,
            gpu: null,
            ram: null,
            storage: null,
            cooling: null,
            psu: null
        };
        
        // Clear all slots
        document.querySelectorAll('.component-slot, .component-slot-3d').forEach(slot => {
            slot.classList.remove('filled');
            slot.innerHTML = '<div class="slot-label">' + slot.dataset.component.toUpperCase() + '</div>';
        });
        
        // Reset spec preview
        document.querySelectorAll('.spec-value').forEach(span => {
            span.textContent = 'Not selected';
        });
        
        // Reset to first stage
        this.setStage('case');
    }
    
    // API method to fetch component images
    async fetchComponentImage(componentType, brand, model) {
        try {
            // You would replace this with your actual API call
            const response = await fetch(`${this.apiBaseUrl}/search?type=${componentType}&brand=${brand}&model=${model}`);
            const data = await response.json();
            return data.imageUrl;
        } catch (error) {
            // Fallback to placeholder
            return this.getPlaceholderImage(componentType);
        }
    }
    
    getPlaceholderImage(type) {
        const placeholders = {
            case: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=400&fit=crop',
            cpu: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&h=400&fit=crop',
            gpu: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop',
            ram: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop',
            motherboard: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
            storage: 'https://images.unsplash.com/photo-1591485890346-e6d36bcd1808?w=400&h=400&fit=crop',
            cooling: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
            psu: 'https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?w=400&h=400&fit=crop'
        };
        return placeholders[type] || placeholders.case;
    }
}

// PC Visualization Enhancement with Real Photos
document.addEventListener('DOMContentLoaded', function() {
    const realPhotoContainer = document.getElementById('realPhotoContainer');
    const pc3DView = document.getElementById('pc3DView');
    const realPCImage = document.getElementById('realPCImage');
    const componentHighlights = document.querySelector('.component-highlights');
    const viewBtns = document.querySelectorAll('.view-btn');
    const refreshBtn = document.getElementById('refreshPhoto');
    
    // Component image mapping (URLs from Unsplash or your own images)
    const componentImages = {
        'case': {
            'NZXT H510': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=450&fit=crop',
            'Lian Li O11': 'https://images.unsplash.com/photo-1585771724684-382b1b0f2c8e?w=800&h=450&fit=crop',
            'Fractal Design North': 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=450&fit=crop',
            'Corsair 4000D': 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=450&fit=crop',
            'default': 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=450&fit=crop'
        },
        'gpu': {
            'RTX 4090': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w-400&h=300&fit=crop',
            'RTX 4070': 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=300&fit=crop',
            'RX 7900 XT': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop'
        },
        'rgb': 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=450&fit=crop',
        'minimalist': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&h=450&fit=crop',
        'performance': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=450&fit=crop'
    };
    
    // Component highlight positions (x%, y%)
    const highlightPositions = {
        'case': { x: 50, y: 50, title: 'PC Case' },
        'motherboard': { x: 50, y: 40, title: 'Motherboard' },
        'cpu': { x: 50, y: 35, title: 'CPU & Cooler' },
        'gpu': { x: 65, y: 45, title: 'Graphics Card' },
        'ram': { x: 35, y: 30, title: 'RAM' },
        'storage': { x: 40, y: 60, title: 'Storage' },
        'psu': { x: 25, y: 75, title: 'Power Supply' },
        'cooling': { x: 75, y: 25, title: 'Cooling' }
    };
    
    // Current build configuration
    let currentBuild = {
        case: null,
        motherboard: null,
        cpu: null,
        gpu: null,
        ram: null,
        storage: null,
        cooling: null,
        psu: null
    };
    
    // View control
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            
            // Update active button
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide appropriate view
            if (view === 'real') {
                realPhotoContainer.classList.add('active');
                pc3DView.classList.remove('active');
                updateRealPhoto();
            } else {
                realPhotoContainer.classList.remove('active');
                pc3DView.classList.add('active');
                // You can add 3D view logic here
            }
        });
    });
    
    // Refresh photo
    refreshBtn.addEventListener('click', updateRealPhoto);
    
    // Update build from component selection
    function updateBuild(componentType, component) {
        currentBuild[componentType] = component;
        updateRealPhoto();
        updateProgress();
        updateHighlights();
    }
    
    // Update real photo based on build
    function updateRealPhoto() {
        // Determine which image to show
        let imageUrl = componentImages.case.default;
        
        if (currentBuild.case && componentImages.case[currentBuild.case.name]) {
            imageUrl = componentImages.case[currentBuild.case.name];
        } else if (currentBuild.gpu && componentImages.gpu[currentBuild.gpu.name]) {
            imageUrl = componentImages.gpu[currentBuild.gpu.name];
        }
        
        realPCImage.src = imageUrl;
        realPCImage.alt = currentBuild.case ? currentBuild.case.name : 'Custom Gaming PC';
    }
    
    // Update component highlights
    function updateHighlights() {
        componentHighlights.innerHTML = '';
        
        Object.keys(currentBuild).forEach(componentType => {
            if (currentBuild[componentType]) {
                const pos = highlightPositions[componentType];
                if (pos) {
                    const highlight = document.createElement('div');
                    highlight.className = 'component-highlight';
                    highlight.style.left = `${pos.x}%`;
                    highlight.style.top = `${pos.y}%`;
                    highlight.innerHTML = `
                        <strong>${pos.title}</strong><br>
                        <small>${currentBuild[componentType].name}</small>
                    `;
                    
                    highlight.addEventListener('mouseenter', function() {
                        showAnnotation(this, currentBuild[componentType]);
                    });
                    
                    highlight.addEventListener('mouseleave', hideAnnotation);
                    
                    componentHighlights.appendChild(highlight);
                }
            }
        });
    }
    
    // Show annotation
    let currentAnnotation = null;
    
    function showAnnotation(element, component) {
        hideAnnotation();
        
        const annotation = document.createElement('div');
        annotation.className = 'annotation show';
        annotation.innerHTML = `
            <h4>${component.name}</h4>
            <p>${component.category}</p>
            <p><strong>Specs:</strong> ${component.specs || 'High-performance component'}</p>
            <p><strong>Price:</strong> ${component.price || 'RM 0'}</p>
        `;
        
        const rect = element.getBoundingClientRect();
        const containerRect = realPhotoContainer.getBoundingClientRect();
        
        annotation.style.left = `${rect.left - containerRect.left + rect.width/2}px`;
        annotation.style.top = `${rect.top - containerRect.top - 10}px`;
        annotation.style.transform = 'translate(-50%, -100%)';
        
        realPhotoContainer.appendChild(annotation);
        currentAnnotation = annotation;
    }
    
    function hideAnnotation() {
        if (currentAnnotation) {
            currentAnnotation.remove();
            currentAnnotation = null;
        }
    }
    
    // Update progress bar
    function updateProgress() {
        const steps = document.querySelectorAll('.progress-step');
        const progressFill = document.querySelector('.progress-fill');
        const selectedCount = Object.values(currentBuild).filter(Boolean).length;
        const totalSteps = Object.keys(currentBuild).length;
        
        // Update step completion
        steps.forEach((step, index) => {
            const stepType = step.dataset.step;
            if (currentBuild[stepType]) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Update progress bar
        const progress = (selectedCount / totalSteps) * 100;
        progressFill.style.width = `${progress}%`;
    }
    
    // Gallery build application
    document.querySelectorAll('.btn-apply-build').forEach(btn => {
        btn.addEventListener('click', function() {
            const buildType = this.dataset.build;
            applyGalleryBuild(buildType);
        });
    });
    
    function applyGalleryBuild(buildType) {
        // Example build configurations
        const galleryBuilds = {
            'rgb': {
                case: { name: 'Lian Li O11 Dynamic', category: 'case', specs: 'Tempered glass RGB case' },
                motherboard: { name: 'ASUS ROG Strix Z790', category: 'motherboard', specs: 'Intel Z790 chipset' },
                cpu: { name: 'Intel Core i7-13700K', category: 'cpu', specs: '16 cores, 5.4GHz boost' },
                gpu: { name: 'NVIDIA RTX 4070 Ti', category: 'gpu', specs: '12GB GDDR6X' },
                ram: { name: '32GB RGB DDR5', category: 'ram', specs: '6000MHz CL36' },
                storage: { name: '2TB NVMe SSD', category: 'storage', specs: 'Gen4 PCIe' },
                cooling: { name: '360mm AIO Liquid Cooler', category: 'cooling', specs: 'RGB fans' },
                psu: { name: '850W 80+ Gold', category: 'psu', specs: 'Fully modular' }
            },
            'minimalist': {
                case: { name: 'Fractal Design North', category: 'case', specs: 'Walnut front panel' },
                motherboard: { name: 'Gigabyte B650 AORUS', category: 'motherboard', specs: 'AMD AM5' },
                cpu: { name: 'AMD Ryzen 7 7800X3D', category: 'cpu', specs: '8 cores, 3D V-Cache' },
                gpu: { name: 'AMD RX 7800 XT', category: 'gpu', specs: '16GB GDDR6' },
                ram: { name: '32GB White DDR5', category: 'ram', specs: '5600MHz' },
                storage: { name: '1TB NVMe SSD', category: 'storage', specs: 'Gen4 PCIe' },
                cooling: { name: 'Air Cooler', category: 'cooling', specs: 'Dual tower' },
                psu: { name: '750W 80+ Gold', category: 'psu', specs: 'White cables' }
            }
        };
        
        const build = galleryBuilds[buildType];
        if (build) {
            currentBuild = { ...build };
            updateRealPhoto();
            updateHighlights();
            updateProgress();
            
            // Update preview specs
            Object.keys(build).forEach(componentType => {
                const previewElement = document.getElementById(`preview-${componentType}`);
                if (previewElement) {
                    const specValue = previewElement.querySelector('.spec-value');
                    if (specValue) {
                        specValue.textContent = build[componentType].name;
                    }
                }
            });
            
            // Show success message
            showNotification(`Applied "${buildType}" build configuration!`, 'success');
        }
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Initialize
    updateRealPhoto();
    updateProgress();
    
    // Expose updateBuild for use in configurator.js
    window.updatePCVisualization = updateBuild;
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pcVisualizer = new PCVisualization();
});


// ===================================================================
// 3D PC VISUALIZATION SYSTEM (merged from pc-visualization-3d.js)
// ===================================================================
// ===== 3D PC VISUALIZATION SYSTEM =====
// Using Three.js for interactive 3D preview

class PC3DVisualization {
    constructor() {
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.pcCase = null;
        this.components = {};
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isInitialized = false;
        this.autoRotate = false;

        // Component colors
        this.colors = {
            case: 0x1a1a2e,
            motherboard: 0x2a4a2a,
            cpu: 0x4a4a2a,
            gpu: 0xff416c,
            ram: 0xffc107,
            storage: 0x4caf50,
            cooling: 0x2196f3,
            psu: 0x9c27b0,
            glass: 0x00dbde
        };
    }

    // Initialize the 3D scene
    init(containerId) {
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.error('3D container not found');
            return false;
        }

        // Check WebGL support
        if (!this.checkWebGLSupport()) {
            this.showWebGLError();
            return false;
        }

        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupControls();
        this.createPCCase();
        this.setupEventListeners();
        this.animate();

        this.isInitialized = true;
        return true;
    }

    // Check if WebGL is supported
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    // Show WebGL not supported error
    showWebGLError() {
        this.container.innerHTML = `
            <div class="webgl-not-supported">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>WebGL Not Supported</h4>
                <p>Your browser doesn't support WebGL, which is required for 3D visualization. 
                Please use the photo views instead or update your browser.</p>
            </div>
        `;
    }

    // Setup the Three.js scene
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x2a2a3e); // Lighter background for visibility

        // Add fog for depth
        this.scene.fog = new THREE.Fog(0x2a2a3e, 10, 50);
    }

    // Setup camera
    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000); // Wider FOV
        this.camera.position.set(4, 3, 5); // Better viewing angle
        this.camera.lookAt(0, 2, 0);
    }

    // Setup renderer
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }

    // Setup lights
    setupLights() {
        // Ambient light - BRIGHTER for visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Main directional light - BRIGHTER
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);

        // Fill light - BRIGHTER
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        // Accent light (cyan glow) - BRIGHTER
        const accentLight = new THREE.PointLight(0x00dbde, 2, 15);
        accentLight.position.set(2, 3, 3);
        this.scene.add(accentLight);

        // Pink accent - BRIGHTER
        const pinkLight = new THREE.PointLight(0xff416c, 1, 10);
        pinkLight.position.set(-2, 2, -2);
        this.scene.add(pinkLight);
    }

    // Setup orbit controls
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 4;
        this.controls.maxDistance = 15;
        this.controls.maxPolarAngle = Math.PI / 2 + 0.2;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 1.0;
        this.controls.target.set(0, 2, 0);
    }

    // Create PC case and base structure
    createPCCase() {
        const caseGroup = new THREE.Group();

        // Main case body - LIGHTER COLOR
        const caseGeometry = new THREE.BoxGeometry(2, 4, 2);
        const caseMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a5e, // Lighter, more visible color
            metalness: 0.7,
            roughness: 0.3
        });
        const caseBody = new THREE.Mesh(caseGeometry, caseMaterial);
        caseBody.castShadow = true;
        caseBody.receiveShadow = true;
        caseBody.position.y = 2;
        caseGroup.add(caseBody);

        // Glass side panel (transparent)
        const glassGeometry = new THREE.PlaneGeometry(1.95, 3.9);
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: this.colors.glass,
            transparent: true,
            opacity: 0.15,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.9,
            thickness: 0.5
        });
        const glassPanel = new THREE.Mesh(glassGeometry, glassMaterial);
        glassPanel.position.set(1.01, 2, 0);
        glassPanel.rotation.y = Math.PI / 2;
        caseGroup.add(glassPanel);

        // Front panel accents
        const accentGeometry = new THREE.BoxGeometry(2.1, 0.1, 0.1);
        const accentMaterial = new THREE.MeshStandardMaterial({
            color: this.colors.glass,
            emissive: this.colors.glass,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });

        const topAccent = new THREE.Mesh(accentGeometry, accentMaterial);
        topAccent.position.set(0, 3.9, 1.05);
        caseGroup.add(topAccent);

        const bottomAccent = new THREE.Mesh(accentGeometry, accentMaterial);
        bottomAccent.position.set(0, 0.1, 1.05);
        caseGroup.add(bottomAccent);

        // Base/feet
        const baseGeometry = new THREE.BoxGeometry(2.2, 0.1, 2.2);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.9,
            roughness: 0.1
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.05;
        base.receiveShadow = true;
        caseGroup.add(base);

        this.pcCase = caseGroup;
        this.scene.add(caseGroup);

        // Add ground plane
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add grid helper for depth perception
        const gridHelper = new THREE.GridHelper(20, 20, 0x00dbde, 0x444444);
        this.scene.add(gridHelper);
    }

    // Add or update a component in the 3D scene
    addComponent(type, data) {
        // Remove existing component if present
        if (this.components[type]) {
            this.pcCase.remove(this.components[type]);
        }

        let component;

        switch (type) {
            case 'motherboard':
                component = this.createMotherboard();
                break;
            case 'cpu':
                component = this.createCPU();
                break;
            case 'gpu':
                component = this.createGPU();
                break;
            case 'ram':
                component = this.createRAM();
                break;
            case 'storage':
                component = this.createStorage();
                break;
            case 'cooling':
                component = this.createCooling();
                break;
            case 'psu':
                component = this.createPSU();
                break;
        }

        if (component) {
            component.userData = { type, data };
            this.components[type] = component;
            this.pcCase.add(component);
        }
    }

    // Create motherboard
    createMotherboard() {
        const geometry = new THREE.BoxGeometry(1.5, 0.05, 1.8);
        const material = new THREE.MeshStandardMaterial({
            color: this.colors.motherboard,
            metalness: 0.3,
            roughness: 0.7
        });
        const motherboard = new THREE.Mesh(geometry, material);
        motherboard.position.set(0.2, 1.5, 0);
        motherboard.castShadow = true;

        // Add PCIe slots
        for (let i = 0; i < 3; i++) {
            const slotGeometry = new THREE.BoxGeometry(1.2, 0.06, 0.1);
            const slotMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const slot = new THREE.Mesh(slotGeometry, slotMaterial);
            slot.position.set(0.2, 1.53, -0.5 + i * 0.4);
            motherboard.add(slot);
        }

        return motherboard;
    }

    // Create CPU
    createCPU() {
        const geometry = new THREE.BoxGeometry(0.4, 0.1, 0.4);
        const material = new THREE.MeshStandardMaterial({
            color: this.colors.cpu,
            metalness: 0.8,
            roughness: 0.2
        });
        const cpu = new THREE.Mesh(geometry, material);
        cpu.position.set(0.2, 1.6, 0.3);
        cpu.castShadow = true;
        return cpu;
    }

    // Create GPU
    createGPU() {
        const group = new THREE.Group();

        // Main GPU body
        const bodyGeometry = new THREE.BoxGeometry(1.2, 0.3, 0.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.colors.gpu,
            metalness: 0.6,
            roughness: 0.4
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);

        // GPU fans
        for (let i = 0; i < 2; i++) {
            const fanGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
            const fanMaterial = new THREE.MeshStandardMaterial({
                color: 0x333333,
                metalness: 0.5,
                roughness: 0.5
            });
            const fan = new THREE.Mesh(fanGeometry, fanMaterial);
            fan.rotation.x = Math.PI / 2;
            fan.position.set(-0.3 + i * 0.6, 0.18, 0);
            fan.userData.rotating = true;
            group.add(fan);
        }

        group.position.set(0.2, 1.2, -0.3);
        return group;
    }

    // Create RAM
    createRAM() {
        const group = new THREE.Group();

        for (let i = 0; i < 2; i++) {
            const geometry = new THREE.BoxGeometry(0.15, 0.6, 0.05);
            const material = new THREE.MeshStandardMaterial({
                color: this.colors.ram,
                metalness: 0.4,
                roughness: 0.6
            });
            const stick = new THREE.Mesh(geometry, material);
            stick.position.set(0, 0, i * 0.2);
            stick.castShadow = true;
            group.add(stick);

            // RGB strip on top
            const rgbGeometry = new THREE.BoxGeometry(0.15, 0.05, 0.05);
            const rgbMaterial = new THREE.MeshStandardMaterial({
                color: 0x00dbde,
                emissive: 0x00dbde,
                emissiveIntensity: 0.5
            });
            const rgb = new THREE.Mesh(rgbGeometry, rgbMaterial);
            rgb.position.set(0, 0.32, i * 0.2);
            group.add(rgb);
        }

        group.position.set(0.7, 1.8, 0.4);
        return group;
    }

    // Create Storage
    createStorage() {
        const geometry = new THREE.BoxGeometry(0.6, 0.1, 0.4);
        const material = new THREE.MeshStandardMaterial({
            color: this.colors.storage,
            metalness: 0.7,
            roughness: 0.3
        });
        const storage = new THREE.Mesh(geometry, material);
        storage.position.set(0.2, 0.8, 0.5);
        storage.castShadow = true;
        return storage;
    }

    // Create Cooling (CPU cooler/AIO)
    createCooling() {
        const group = new THREE.Group();

        // Radiator/Heatsink
        const radiatorGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.2);
        const radiatorMaterial = new THREE.MeshStandardMaterial({
            color: this.colors.cooling,
            metalness: 0.8,
            roughness: 0.2
        });
        const radiator = new THREE.Mesh(radiatorGeometry, radiatorMaterial);
        radiator.castShadow = true;
        group.add(radiator);

        // Fan
        const fanGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
        const fanMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.5,
            roughness: 0.5
        });
        const fan = new THREE.Mesh(fanGeometry, fanMaterial);
        fan.rotation.x = Math.PI / 2;
        fan.position.z = 0.15;
        fan.userData.rotating = true;
        group.add(fan);

        group.position.set(0.2, 2.2, 0.3);
        return group;
    }

    // Create PSU
    createPSU() {
        const geometry = new THREE.BoxGeometry(0.8, 0.4, 0.6);
        const material = new THREE.MeshStandardMaterial({
            color: this.colors.psu,
            metalness: 0.7,
            roughness: 0.3
        });
        const psu = new THREE.Mesh(geometry, material);
        psu.position.set(0.2, 0.3, -0.5);
        psu.castShadow = true;

        // Fan grill
        const fanGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
        const fanMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.5,
            roughness: 0.5
        });
        const fan = new THREE.Mesh(fanGeometry, fanMaterial);
        fan.rotation.x = Math.PI / 2;
        fan.position.set(0.2, 0.3, -0.2);
        psu.add(fan);

        return psu;
    }

    // Setup event listeners
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Mouse move for raycasting
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e), false);

        // Click for component info
        this.renderer.domElement.addEventListener('click', (e) => this.onClick(e), false);
    }

    // Handle window resize
    onWindowResize() {
        if (!this.container || !this.camera || !this.renderer) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // Handle mouse move
    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    // Handle click
    onClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.pcCase.children, true);

        if (intersects.length > 0) {
            let object = intersects[0].object;

            // Traverse up to find component with userData
            while (object && !object.userData.type) {
                object = object.parent;
            }

            if (object && object.userData.type) {
                this.highlightComponent(object);
                this.showComponentInfo(object, event);
            }
        }
    }

    // Highlight component
    highlightComponent(component) {
        // Reset all components
        Object.values(this.components).forEach(comp => {
            comp.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.emissive = new THREE.Color(0x000000);
                    child.material.emissiveIntensity = 0;
                }
            });
        });

        // Highlight selected
        component.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.emissive = new THREE.Color(0x00dbde);
                child.material.emissiveIntensity = 0.3;
            }
        });

        // Reset after delay
        setTimeout(() => {
            component.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.emissive = new THREE.Color(0x000000);
                    child.material.emissiveIntensity = 0;
                }
            });
        }, 2000);
    }

    // Show component info tooltip
    showComponentInfo(component, event) {
        const data = component.userData.data || {};
        const type = component.userData.type;

        console.log(`Component clicked: ${type}`, data);

        // You can create a tooltip here if needed
        // For now, just log to console
    }

    // Toggle auto-rotation
    toggleAutoRotate() {
        this.autoRotate = !this.autoRotate;
        if (this.controls) {
            this.controls.autoRotate = this.autoRotate;
        }
        return this.autoRotate;
    }

    // Reset camera position
    resetCamera() {
        if (this.camera && this.controls) {
            this.camera.position.set(4, 3, 5); // Match new default position
            this.controls.target.set(0, 2, 0);
            this.controls.update();
        }
    }

    // Animation loop
    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.controls) {
            this.controls.update();
        }

        // Rotate fans
        Object.values(this.components).forEach(component => {
            component.traverse(child => {
                if (child.userData.rotating) {
                    child.rotation.z += 0.05;
                }
            });
        });

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Dispose of resources
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.controls) {
            this.controls.dispose();
        }

        // Dispose geometries and materials
        this.scene.traverse(object => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}

// ===== INTEGRATION WITH EXISTING SYSTEM =====

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Create 3D visualization instance
    window.pc3DVisualizer = new PC3DVisualization();

    // View button controls
    const viewBtns = document.querySelectorAll('.view-btn');
    const realPhotoViews = document.getElementById('realPhotoViews');
    const threejsContainer = document.getElementById('threejsContainer');

    let is3DInitialized = false;

    viewBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const view = this.dataset.view;

            // Update active button
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            if (view === '3d-simple') {
                // Show 3D view
                if (realPhotoViews) realPhotoViews.classList.remove('active');
                if (threejsContainer) {
                    threejsContainer.classList.add('active');

                    // Initialize 3D scene on first view
                    if (!is3DInitialized) {
                        const success = window.pc3DVisualizer.init('threejsContainer');
                        if (success) {
                            is3DInitialized = true;
                            // Add any existing components
                            loadExistingComponents();
                        }
                    }
                }
            } else {
                // Show photo views
                if (threejsContainer) threejsContainer.classList.remove('active');
                if (realPhotoViews) {
                    realPhotoViews.classList.add('active');

                    // Switch photo view
                    const photoViews = document.querySelectorAll('.photo-view');
                    photoViews.forEach(pv => pv.classList.remove('active'));

                    const targetView = document.getElementById(`photo-${view.replace('real-', '')}`);
                    if (targetView) targetView.classList.add('active');
                }
            }
        });
    });

    // Auto-rotate toggle
    const autoRotateBtn = document.getElementById('autoRotateBtn');
    if (autoRotateBtn) {
        autoRotateBtn.addEventListener('click', function () {
            const isActive = window.pc3DVisualizer.toggleAutoRotate();
            this.classList.toggle('active', isActive);
        });
    }

    // Reset camera button
    const resetCameraBtn = document.getElementById('resetCameraBtn');
    if (resetCameraBtn) {
        resetCameraBtn.addEventListener('click', function () {
            window.pc3DVisualizer.resetCamera();
        });
    }

    // Load existing components into 3D view
    function loadExistingComponents() {
        // This will be called from the main configurator when components are selected
        // For now, add some default components for demonstration
        if (window.pcVisualizer && window.pcVisualizer.components) {
            Object.keys(window.pcVisualizer.components).forEach(type => {
                const component = window.pcVisualizer.components[type];
                if (component) {
                    window.pc3DVisualizer.addComponent(type, component);
                }
            });
        }
    }

    // Expose function to add components from configurator
    window.update3DComponent = function (type, data) {
        if (window.pc3DVisualizer && window.pc3DVisualizer.isInitialized) {
            window.pc3DVisualizer.addComponent(type, data);
        }
    };
});


// ===================================================================
// PC VISUALIZATION BRIDGE (merged from pc-visualization.js)
// ===================================================================
// Bridge file to ensure pc-visualization.js exists
// This file provides compatibility and integration between the configurator and 3D visualization

// Export function to update 3D visualization when components are selected
window.updateVisualizationComponent = function (type, component) {
    // Update 3D view if initialized
    if (window.update3DComponent) {
        window.update3DComponent(type, component);
    }

    // Update spec preview
    const previewElement = document.getElementById(`preview-${type}`);
    if (previewElement) {
        const specValue = previewElement.querySelector('.spec-value');
        if (specValue && component) {
            specValue.textContent = component.name || 'Selected';
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('PC Visualization bridge loaded');

    // Hide loading indicator once 3D is ready
    setTimeout(() => {
        const loadingEl = document.getElementById('threejsLoading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }, 2000);
});


// ===================================================================
// ABOUT PAGE HANDLERS (merged from about.js)
// ===================================================================
// about.js - SHIRO IT About Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // ========== VIDEO BACKGROUND HANDLER ==========
    const videoHandler = (function() {
        const video = document.getElementById('bgVideo');
        const videoContainer = document.querySelector('.video-background');
        
        if (!video) {
            console.error('Video element not found!');
            return;
        }
        
        console.log('Video element found, initializing...');
        
        // Force video to play - NO FALLBACKS, JUST MAKE IT WORK
        const forceVideoPlay = () => {
            console.log('Attempting to play video...');
            
            // Reset video and force play
            video.pause();
            video.currentTime = 0;
            
            // Add a small delay to ensure DOM is ready
            setTimeout(() => {
                const playPromise = video.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('âœ… Video is playing!');
                        video.style.opacity = '1';
                        videoContainer.classList.remove('loading');
                    }).catch(error => {
                        console.warn('Autoplay prevented:', error);
                        
                        // Nuclear option - try multiple times
                        let attempts = 0;
                        const maxAttempts = 10;
                        
                        const tryAgain = () => {
                            attempts++;
                            console.log(`Attempt ${attempts} to play video...`);
                            
                            video.play().then(() => {
                                console.log(`âœ… Video started on attempt ${attempts}`);
                                video.style.opacity = '1';
                                videoContainer.classList.remove('loading');
                            }).catch(e => {
                                if (attempts < maxAttempts) {
                                    setTimeout(tryAgain, 500);
                                } else {
                                    console.error('âŒ Failed to play video after', maxAttempts, 'attempts');
                                    
                                    // Last resort - enable sound and try again
                                    video.muted = false;
                                    video.play().catch(() => {
                                        console.log('Even with sound enabled, video wont play');
                                    });
                                }
                            });
                        };
                        
                        // Start retry attempts
                        setTimeout(tryAgain, 1000);
                    });
                }
            }, 500);
        };
        
        // Add error event listener for debugging
        video.addEventListener('error', function(e) {
            console.error('âŒ Video error occurred!');
            console.error('Error details:', {
                code: video.error ? video.error.code : 'unknown',
                message: video.error ? video.error.message : 'unknown',
                src: video.currentSrc || video.src,
                networkState: video.networkState,
                readyState: video.readyState
            });
            
            // Check if file exists
            fetch(video.src)
                .then(response => {
                    if (!response.ok) {
                        console.error(`âŒ Video file not found (HTTP ${response.status})`);
                        console.error(`ðŸ’¡ Check if this file exists: ${video.src}`);
                        console.error('ðŸ’¡ Make sure the "video" folder is in the same directory as your HTML file');
                    }
                })
                .catch(err => {
                    console.error('âŒ Cannot check video file:', err);
                });
        });
        
        // Add event listeners for video states
        video.addEventListener('loadeddata', function() {
            console.log('âœ… Video data loaded');
            videoContainer.classList.remove('loading');
        });
        
        video.addEventListener('canplay', function() {
            console.log('âœ… Video can play');
            videoContainer.classList.remove('loading');
        });
        
        video.addEventListener('play', function() {
            console.log('âœ… Video playback started');
            videoContainer.classList.remove('loading');
        });
        
        video.addEventListener('waiting', function() {
            console.log('â³ Video is buffering...');
            videoContainer.classList.add('loading');
        });
        
        video.addEventListener('playing', function() {
            console.log('â–¶ï¸ Video is playing');
            videoContainer.classList.remove('loading');
        });
        
        // Initial load
        video.load();
        
        // Try to play immediately
        forceVideoPlay();
        
        // Try again after a few seconds (in case of slow connections)
        setTimeout(forceVideoPlay, 2000);
        
        // Add click handler to document to trigger video play on user interaction
        document.addEventListener('click', function playOnFirstClick() {
            forceVideoPlay();
            document.removeEventListener('click', playOnFirstClick);
        }, { once: true });
        
        // Return public methods
        return {
            forcePlay: forceVideoPlay,
            restart: () => {
                video.currentTime = 0;
                forceVideoPlay();
            }
        };
    })();
    
    // ========== SMOOTH SCROLLING FOR ANCHOR LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update URL hash without scrolling
                history.pushState(null, null, targetId);
            }
        });
    });
    
    // ========== ANIMATION ON SCROLL ==========
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.timeline-item, .mission-card, .values-card, .vision-card, .team-member, .certification-item, .community-card, .testimonial-card');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial state for animated elements
    document.querySelectorAll('.timeline-item, .mission-card, .values-card, .vision-card, .team-member, .certification-item, .community-card, .testimonial-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Run on load and scroll
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
    
    // ========== STATS COUNTER ANIMATION ==========
    const animateStats = () => {
        const statsSection = document.querySelector('.about-stats-overlay');
        if (!statsSection) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stats = entry.target.querySelectorAll('.stat h3');
                    
                    stats.forEach(stat => {
                        const finalValue = parseInt(stat.textContent);
                        const suffix = stat.textContent.replace(/[0-9]/g, '').replace('+', '');
                        let currentValue = 0;
                        
                        const increment = Math.ceil(finalValue / 50);
                        const timer = setInterval(() => {
                            currentValue += increment;
                            if (currentValue >= finalValue) {
                                currentValue = finalValue;
                                clearInterval(timer);
                            }
                            stat.textContent = currentValue + suffix;
                        }, 30);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    };
    
    // Initialize stats animation
    animateStats();
    
    // ========== TEAM MEMBER HOVER EFFECTS ==========
    document.querySelectorAll('.team-member').forEach(member => {
        member.addEventListener('mouseenter', function() {
            const socialIcons = this.querySelector('.member-social');
            if (socialIcons) {
                socialIcons.style.opacity = '1';
                socialIcons.style.transform = 'translateY(0)';
            }
        });
        
        member.addEventListener('mouseleave', function() {
            const socialIcons = this.querySelector('.member-social');
            if (socialIcons) {
                socialIcons.style.opacity = '0.8';
                socialIcons.style.transform = 'translateY(5px)';
            }
        });
    });
    
    // ========== TESTIMONIAL CAROUSEL (Optional) ==========
    const initTestimonials = () => {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        if (testimonialCards.length === 0) return;
        
        let currentIndex = 0;
        
        // Add navigation dots if you want a carousel
        // For now, just add hover effects
        testimonialCards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-15px) scale(1.03)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(-10px) scale(1)';
            });
            
            // Alternate animation delays
            card.style.animationDelay = `${index * 0.1}s`;
        });
    };
    
    initTestimonials();
    
    // ========== VIDEO CONTROLS (Optional) ==========
    const addVideoControls = () => {
        const video = document.getElementById('bgVideo');
        if (!video) return;
        
        // Create video control button (optional, hidden by default)
        const controlBtn = document.createElement('button');
        controlBtn.innerHTML = '<i class="fas fa-video"></i>';
        controlBtn.className = 'video-control-btn';
        controlBtn.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: rgba(74, 144, 226, 0.8);
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            opacity: 0.3;
        `;
        
        controlBtn.addEventListener('mouseenter', () => {
            controlBtn.style.opacity = '1';
            controlBtn.style.transform = 'scale(1.1)';
        });
        
        controlBtn.addEventListener('mouseleave', () => {
            controlBtn.style.opacity = '0.3';
            controlBtn.style.transform = 'scale(1)';
        });
        
        controlBtn.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                controlBtn.innerHTML = '<i class="fas fa-video"></i>';
            } else {
                video.pause();
                controlBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
        
        document.body.appendChild(controlBtn);
        
        // Update button based on video state
        video.addEventListener('play', () => {
            controlBtn.innerHTML = '<i class="fas fa-video"></i>';
        });
        
        video.addEventListener('pause', () => {
            controlBtn.innerHTML = '<i class="fas fa-play"></i>';
        });
    };
    
    // Uncomment if you want video controls
    // addVideoControls();
    
    // ========== PERFORMANCE OPTIMIZATION ==========
    // Throttle scroll events for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                animateOnScroll();
                scrollTimeout = null;
            }, 100);
        }
    });
    
    // ========== DEBUG MODE (Remove in production) ==========
    // Add a debug mode to check video status
    const enableDebugMode = () => {
        const debugBtn = document.createElement('button');
        debugBtn.textContent = 'Debug Video';
        debugBtn.style.cssText = `
            position: fixed;
            bottom: 160px;
            right: 20px;
            background: rgba(255, 59, 48, 0.8);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
            font-size: 12px;
            opacity: 0.5;
        `;
        
        debugBtn.addEventListener('click', () => {
            const video = document.getElementById('bgVideo');
            if (video) {
                alert(`Video Status:\n\n` +
                      `Playing: ${!video.paused}\n` +
                      `Paused: ${video.paused}\n` +
                      `Current Time: ${video.currentTime.toFixed(2)}s\n` +
                      `Duration: ${video.duration.toFixed(2)}s\n` +
                      `Ready State: ${video.readyState}\n` +
                      `Network State: ${video.networkState}\n` +
                      `Error: ${video.error ? video.error.message : 'None'}\n` +
                      `Source: ${video.currentSrc || video.src}`);
            }
        });
        
        document.body.appendChild(debugBtn);
    };
    
    // Uncomment to enable debug button
    // enableDebugMode();
    
    // ========== FALLBACK FOR VIDEO FAILURE ==========
    // Even though you don't want fallbacks, this ensures the page still works
    const videoFallbackCheck = () => {
        setTimeout(() => {
            const video = document.getElementById('bgVideo');
            if (video && (video.readyState < 2 || video.error)) {
                console.warn('Video may not be loading properly');
                console.warn('Suggested fixes:');
                console.warn('1. Check if video/PC 2 video.mp4 exists');
                console.warn('2. Rename file to remove spaces: PC2-video.mp4');
                console.warn('3. Convert video to MP4 with H.264 codec');
                console.warn('4. Reduce video file size (<10MB recommended)');
                
                // Try alternative approach
                videoHandler.forcePlay();
            }
        }, 5000);
    };
    
    videoFallbackCheck();
    
    // ========== INITIALIZE EVERYTHING ==========
    console.log('SHIRO IT About Page JavaScript loaded successfully');
    console.log('Video handler initialized');
    
    // Export video handler for manual control (optional)
    window.videoHandler = videoHandler;
});

// Add this CSS via JavaScript for video loading state
const style = document.createElement('style');
style.textContent = `
    .video-background.loading video {
        opacity: 0;
    }
    
    .video-background:not(.loading) video {
        opacity: 1;
        transition: opacity 1s ease;
    }
    
    .video-background.loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top: 3px solid #4a90e2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        z-index: 10;
    }
    
    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
`;
document.head.appendChild(style);

// about.js - NUCLEAR FIX
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('bgVideo');
    const videoContainer = document.querySelector('.video-background');
    
    if (video) {
        // Force video to be visible and properly positioned
        setTimeout(() => {
            video.style.cssText += `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                object-fit: cover !important;
                z-index: -9999 !important;
                opacity: 1 !important;
                visibility: visible !important;
                display: block !important;
            `;
            
            if (videoContainer) {
                videoContainer.style.cssText += `
                    z-index: -10000 !important;
                    background: transparent !important;
                `;
            }
            
            // Remove dark overlay if too dark
            const videoOverlay = document.querySelector('.video-background::after');
            if (videoOverlay) {
                videoOverlay.style.background = 'rgba(0,0,0,0.3) !important';
            }
            
            // Force play
            video.play().catch(e => {
                video.muted = true;
                video.play();
            });
            
            console.log('Nuclear video fix applied');
        }, 1000);
    }
});
