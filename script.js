// JavaScript untuk Verdant Landing Page & Interaktivitas Canggih

document.addEventListener('DOMContentLoaded', function () {
    
    // =========================================================================
    // 1. INISIALISASI AOS (ANIMATE ON SCROLL)
    // =========================================================================
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1200,
            easing: 'ease-out-quart',
            once: false,
            mirror: true,
            offset: 80,
            anchorPlacement: 'top-bottom',
        });
    }

    // =========================================================================
    // 2. HERO STATS COUNTER & IMAGE TILT
    // =========================================================================
    function animateCounter(element, target, suffix = '') {
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + suffix;
        }, 25);
    }

    const heroStats = document.querySelectorAll('.hero-section .col-4 h3');
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (heroStats[0] && !heroStats[0].dataset.animated) {
                    animateCounter(heroStats[0], 10, 'k+');
                    heroStats[0].dataset.animated = 'true';
                }
                if (heroStats[1] && !heroStats[1].dataset.animated) {
                    animateCounter(heroStats[1], 99, '%');
                    heroStats[1].dataset.animated = 'true';
                }
                if (heroStats[2] && !heroStats[2].dataset.animated) {
                    heroStats[2].textContent = 'A+';
                    heroStats[2].style.animation = 'popIn 0.6s ease-out forwards';
                    heroStats[2].dataset.animated = 'true';
                }
            }
        });
    }, { threshold: 0.5 });

    const heroSection = document.getElementById('home');
    if (heroSection) heroObserver.observe(heroSection);

    const heroImg = document.querySelector('.hero-image-wrapper');
    if (heroImg && heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroImg.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
            const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
            heroImg.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
        });
        heroSection.addEventListener('mouseleave', () => {
            heroImg.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
            heroImg.style.transition = 'transform 0.6s ease-out';
        });
    }

    // =========================================================================
    // 3. CANVAS ECO-PARTICLES SYSTEM
    // =========================================================================
    const canvas = document.getElementById('eco-particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 45;

        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class EcoParticle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1.2;
                this.speedX = (Math.random() - 0.5) * 0.8;
                this.speedY = -Math.random() * 0.9 - 0.2; // Float upwards
                this.alpha = Math.random() * 0.5 + 0.2;
                this.decay = Math.random() * 0.003 + 0.001;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.alpha -= this.decay;
                if (this.alpha <= 0 || this.y < -10) {
                    this.reset();
                    this.y = canvas.height + 10;
                }
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#34d399' : '#198754';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new EcoParticle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // =========================================================================
    // 4. DARK / BIOLUMINESCENT MODE SWITCHER
    // =========================================================================
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeToggleIcon = document.getElementById('themeToggleIcon');

    // Load saved preference
    const savedTheme = localStorage.getItem('verdant_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggleIcon) {
            themeToggleIcon.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('verdant_theme', isDark ? 'dark' : 'light');

            if (themeToggleIcon) {
                if (isDark) {
                    themeToggleIcon.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
                } else {
                    themeToggleIcon.classList.replace('bi-sun-fill', 'bi-moon-stars-fill');
                }
            }
        });
    }

    // =========================================================================
    // 5. WEB AUDIO API ZEN AMBIENCE ENGINE (Pure Synth, Zero Dependency)
    // =========================================================================
    const zenAudioBtn = document.getElementById('zenAudioBtn');
    let audioCtx = null;
    let isZenPlaying = false;
    let rainSource = null;
    let windOsc = null;
    let zenGainNode = null;

    function startZenAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();

            // 1. Generate soothing white noise for gentle rain/water
            const bufferSize = audioCtx.sampleRate * 2;
            const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            rainSource = audioCtx.createBufferSource();
            rainSource.buffer = noiseBuffer;
            rainSource.loop = true;

            // Low-pass filter to make it sound like gentle rain in garden
            const rainFilter = audioCtx.createBiquadFilter();
            rainFilter.type = 'lowpass';
            rainFilter.frequency.value = 650;

            // Master gain
            zenGainNode = audioCtx.createGain();
            zenGainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

            // 2. Harmonic warm drone (nature tone)
            windOsc = audioCtx.createOscillator();
            windOsc.type = 'sine';
            windOsc.frequency.setValueAtTime(144, audioCtx.currentTime); // Calming D drone
            const windGain = audioCtx.createGain();
            windGain.gain.setValueAtTime(0.015, audioCtx.currentTime);

            rainSource.connect(rainFilter);
            rainFilter.connect(zenGainNode);

            windOsc.connect(windGain);
            windGain.connect(zenGainNode);

            zenGainNode.connect(audioCtx.destination);

            rainSource.start();
            windOsc.start();
            isZenPlaying = true;

            zenAudioBtn.classList.add('active');
            zenAudioBtn.innerHTML = `
                <div class="zen-playing-waves">
                    <span></span><span></span><span></span>
                </div>
            `;
        } catch (e) {
            console.warn('Web Audio API not allowed without user gesture:', e);
        }
    }

    function stopZenAudio() {
        if (audioCtx) {
            try {
                if (rainSource) rainSource.stop();
                if (windOsc) windOsc.stop();
                audioCtx.close();
            } catch (err) {}
            audioCtx = null;
        }
        isZenPlaying = false;
        zenAudioBtn.classList.remove('active');
        zenAudioBtn.innerHTML = '<i class="bi bi-volume-up-fill" id="zenAudioIcon"></i>';
    }

    if (zenAudioBtn) {
        zenAudioBtn.addEventListener('click', () => {
            if (!isZenPlaying) {
                startZenAudio();
            } else {
                stopZenAudio();
            }
        });
    }

    // Play subtle water droplet sound on mist pump
    function playWaterDropletSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const clickCtx = new AudioContext();
            const osc = clickCtx.createOscillator();
            const gain = clickCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, clickCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, clickCtx.currentTime + 0.15);

            gain.gain.setValueAtTime(0.12, clickCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, clickCtx.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(clickCtx.destination);

            osc.start();
            osc.stop(clickCtx.currentTime + 0.16);
        } catch (e) {}
    }

    // =========================================================================
    // 6. NAVBAR SCROLL & SCROLLSPY
    // =========================================================================
    const navbar = document.getElementById('mainNav');
    function checkScroll() {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }
    checkScroll();
    window.addEventListener('scroll', checkScroll);

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 180)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Mobile nav auto close
    const navItems = document.querySelectorAll('.navbar-nav .nav-link:not(.btn)');
    const menuToggle = document.getElementById('navbarNav');
    if (menuToggle && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false });
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    bsCollapse.hide();
                }
            });
        });
    }

    // =========================================================================
    // 7. VERDANT DIGITAL TWIN (IoT LIVE SIMULATOR)
    // =========================================================================
    const simLightBeam = document.getElementById('simLightBeam');
    const simLampEmitter = document.getElementById('simLampEmitter');
    const spectrumButtons = document.querySelectorAll('.spectrum-btn');
    const btnWaterSpray = document.getElementById('btnWaterSpray');
    const simMistOverlay = document.getElementById('simMistOverlay');
    const simWaterFill = document.getElementById('simWaterFill');
    const sensorSoilMoist = document.getElementById('sensorSoilMoist');
    const sensorWaterTank = document.getElementById('sensorWaterTank');
    const plantMoodText = document.getElementById('plantMoodText');
    const plantMoodIcon = document.getElementById('plantMoodIcon');
    const growthTimeSlider = document.getElementById('growthTimeSlider');
    const growthDayBadge = document.getElementById('growthDayBadge');
    const growthDescription = document.getElementById('growthDescription');
    const simPlantSvg = document.getElementById('simPlantSvg');
    const plantFlowers = document.getElementById('plantFlowers');

    // 7a. Spectrum Mode Switcher
    const spectrumConfig = {
        sun: {
            className: 'spectrum-sun',
            emitterColor: '#fffae0',
            glow: '0 0 16px #f59e0b',
            label: 'Spektrum Alami Matahari (Fotosintesis Standar)'
        },
        veggie: {
            className: 'spectrum-veggie',
            emitterColor: '#93c5fd',
            glow: '0 0 20px #3b82f6',
            label: 'Spektrum Vegetatif Biru (Akselerasi Daun Lebat)'
        },
        bloom: {
            className: 'spectrum-bloom',
            emitterColor: '#f472b6',
            glow: '0 0 20px #ec4899',
            label: 'Spektrum Berbunga & Buah (Pemicu Buah Ceri/Aroma)'
        },
        night: {
            className: 'spectrum-night',
            emitterColor: '#6ee7b7',
            glow: '0 0 16px #10b981',
            label: 'Spektrum Malam Bioluminescent (Sirkadian Istirahat)'
        }
    };

    spectrumButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            spectrumButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const mode = this.dataset.spectrum;
            const config = spectrumConfig[mode] || spectrumConfig.sun;

            // Remove all spectrum classes then add selected
            simLightBeam.className = `sim-light-beam ${config.className}`;
            simLampEmitter.style.background = config.emitterColor;
            simLampEmitter.style.boxShadow = config.glow;
        });
    });

    // 7b. Mist Spray / Watering Action
    let waterLevel = 85;
    let soilMoisture = 78;

    if (btnWaterSpray) {
        btnWaterSpray.addEventListener('click', () => {
            playWaterDropletSound();
            
            // Mist animation
            simMistOverlay.classList.remove('active');
            void simMistOverlay.offsetWidth; // trigger reflow
            simMistOverlay.classList.add('active');

            // Increase soil moisture
            soilMoisture = Math.min(95, soilMoisture + 8);
            waterLevel = Math.max(15, waterLevel - 2);

            sensorSoilMoist.textContent = `${soilMoisture}%`;
            sensorWaterTank.textContent = `${waterLevel}%`;
            simWaterFill.style.height = `${waterLevel}%`;

            plantMoodIcon.className = 'bi bi-emoji-heart-eyes-fill fs-5 text-emerald';
            plantMoodText.textContent = 'Status: Disiram! Kelembaban Optimal 100%';

            setTimeout(() => {
                simMistOverlay.classList.remove('active');
            }, 1200);
        });
    }

    // 7c. Time-Lapse Growth Simulator Slider
    if (growthTimeSlider) {
        growthTimeSlider.addEventListener('input', function () {
            const day = parseInt(this.value);
            growthDayBadge.textContent = `Hari ke-${day}`;

            if (day <= 3) {
                // Stage 1: Sprout
                simPlantSvg.style.transform = 'scale(0.5) translateY(40px)';
                if (plantFlowers) plantFlowers.setAttribute('opacity', '0');
                growthDescription.textContent = '🌱 Hari 1-3: Bibit mulai berkecambah menembus media spons nutrisi organik.';
                plantMoodText.textContent = 'Status: Tunas Segar Baru Muncul!';
            } else if (day <= 10) {
                // Stage 2: Seedling
                simPlantSvg.style.transform = 'scale(0.75) translateY(20px)';
                if (plantFlowers) plantFlowers.setAttribute('opacity', '0');
                growthDescription.textContent = '🌿 Hari 7-10: Daun sejati terbentuk, sistem akar berkembang menyerap nutrisi.';
                plantMoodText.textContent = 'Status: Tumbuh Cepat & Kuat';
            } else if (day <= 22) {
                // Stage 3: Lush Herb
                simPlantSvg.style.transform = 'scale(1) translateY(0px)';
                if (plantFlowers) plantFlowers.setAttribute('opacity', '0');
                growthDescription.textContent = '🍃 Hari 18-22: Tanaman rimbun beraroma pekat, siap dipetik segar untuk bumbu masakan!';
                plantMoodText.textContent = 'Status: Sangat Subur & Siap Petik';
            } else {
                // Stage 4: Flowering & Mature Harvest
                simPlantSvg.style.transform = 'scale(1.15) translateY(-5px)';
                if (plantFlowers) plantFlowers.setAttribute('opacity', '1');
                growthDescription.textContent = '🥗 Hari 25-30: Panen raya maksimal! Bunga dan buah bermekaran sempurna.';
                plantMoodText.textContent = 'Status: Waktu Panen Penuh! 🎉';
            }
        });
    }

    // Subtle sensor telemetry jitter to make it feel genuinely live
    setInterval(() => {
        const tempEl = document.getElementById('sensorTemp');
        const humidEl = document.getElementById('sensorHumidity');
        if (tempEl && humidEl) {
            const randomTemp = (24.0 + (Math.random() * 0.8)).toFixed(1);
            const randomHumid = Math.floor(62 + Math.random() * 5);
            tempEl.textContent = `${randomTemp}°C`;
            humidEl.textContent = `${randomHumid}%`;
        }
    }, 4000);

    // =========================================================================
    // 8. INTERACTIVE POD CUSTOMIZER & BUNDLE BUILDER
    // =========================================================================
    const colorSwatches = document.querySelectorAll('.color-swatch-btn');
    const podPreviewGraphic = document.getElementById('podPreviewGraphic');
    const podColorBadge = document.getElementById('podColorBadge');
    const podPreviewWrapper = document.getElementById('podPreviewWrapper');
    const bundleSelectionSummaryText = document.getElementById('bundleSelectionSummaryText');
    const summaryPodColor = document.getElementById('summaryPodColor');
    const summarySeedList = document.getElementById('summarySeedList');
    let selectedColorName = 'Sage Emerald';

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', function () {
            colorSwatches.forEach(s => s.classList.remove('active'));
            this.classList.add('active');

            const colorHex = this.dataset.color;
            const colorName = this.dataset.name;
            const bgGrad = this.dataset.bg;
            selectedColorName = colorName;

            if (podPreviewGraphic) {
                podPreviewGraphic.style.backgroundColor = colorHex;
                // Add texture for bamboo wood
                if (colorName.includes('Bamboo')) {
                    podPreviewGraphic.style.backgroundImage = 'repeating-linear-gradient(45deg, #b45309, #b45309 10px, #92400e 10px, #92400e 20px)';
                } else {
                    podPreviewGraphic.style.backgroundImage = 'none';
                }
            }
            if (podColorBadge) podColorBadge.textContent = colorName;
            if (podPreviewWrapper) podPreviewWrapper.style.background = bgGrad;
            if (summaryPodColor) summaryPodColor.textContent = colorName;

            updateBundleSummary();
        });
    });

    // 8b. Seed Selection Logic (Select 3 Seeds)
    const seedCards = document.querySelectorAll('.seed-pod-card');
    const selectedCountEl = document.getElementById('selectedCount');

    seedCards.forEach(card => {
        card.addEventListener('click', function () {
            this.classList.toggle('selected');
            const selectedCards = document.querySelectorAll('.seed-pod-card.selected');
            const count = selectedCards.length;

            if (selectedCountEl) selectedCountEl.textContent = count;

            updateBundleSummary();
        });
    });

    function updateBundleSummary() {
        const selectedCards = document.querySelectorAll('.seed-pod-card.selected');
        const seedNames = Array.from(selectedCards).map(c => c.dataset.seed);

        if (bundleSelectionSummaryText) {
            const seedsStr = seedNames.length > 0 ? seedNames.join(', ') : 'Belum memilih benih';
            bundleSelectionSummaryText.innerHTML = `Warna: <strong>${selectedColorName}</strong> | Benih: <strong>${seedsStr}</strong>`;
        }

        if (summarySeedList) {
            summarySeedList.innerHTML = seedNames.map(s => `<li>• ${s}</li>`).join('');
        }
    }

    // =========================================================================
    // 9. ECO-ROI & SAVINGS CALCULATOR
    // =========================================================================
    const calcSpendSlider = document.getElementById('calcSpendSlider');
    const calcSpendDisplay = document.getElementById('calcSpendDisplay');
    const calcSavedAnnual = document.getElementById('calcSavedAnnual');
    const calcPlasticPcs = document.getElementById('calcPlasticPcs');
    const calcCarbonKg = document.getElementById('calcCarbonKg');

    function formatRupiah(num) {
        return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    if (calcSpendSlider) {
        calcSpendSlider.addEventListener('input', function () {
            const monthlySpend = parseInt(this.value);
            calcSpendDisplay.textContent = formatRupiah(monthlySpend);

            // Annual calculations
            const annualSpend = monthlySpend * 12;
            const estimatedAnnualCostSelf = 240000; // Refill nutrient & low power
            const netAnnualSavings = Math.max(0, annualSpend - estimatedAnnualCostSelf);

            // Plastic packaging avoided (average 1 plastic box per Rp 15.000 of herbs)
            const plasticBoxes = Math.round((monthlySpend / 16000) * 12);

            // Carbon avoided: ~0.25 kg CO2 per plastic container & supply chain
            const co2Kg = (plasticBoxes * 0.25).toFixed(1);

            calcSavedAnnual.textContent = formatRupiah(netAnnualSavings);
            calcPlasticPcs.textContent = `${plasticBoxes} Pcs`;
            calcCarbonKg.textContent = `${co2Kg} kg`;
        });
    }

    // =========================================================================
    // 10. PLANT MATCHER WIZARD (QUIZ LOGIC)
    // =========================================================================
    let quizAnswers = { room: 'kitchen', goal: 'herbs', exp: 'beginner' };

    document.querySelectorAll('.quiz-option-card').forEach(card => {
        card.addEventListener('click', function () {
            const questionType = this.dataset.q;
            const parentStep = this.closest('.quiz-step');
            parentStep.querySelectorAll(`[data-q="${questionType}"]`).forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            quizAnswers[questionType] = this.dataset.val;
        });
    });

    window.nextQuizStep = function (step) {
        document.querySelectorAll('.quiz-step').forEach(s => s.classList.add('d-none'));
        const targetStep = document.getElementById(`quizStep${step}`);
        if (targetStep) targetStep.classList.remove('d-none');

        const progressBar = document.getElementById('quizProgressBar');
        if (progressBar) {
            progressBar.style.width = `${(step / 3) * 100}%`;
        }
    };

    window.calculateQuizResult = function () {
        document.querySelectorAll('.quiz-step').forEach(s => s.classList.add('d-none'));
        const resultScreen = document.getElementById('quizResultScreen');
        if (resultScreen) resultScreen.classList.remove('d-none');

        const matchTitle = document.getElementById('quizMatchTitle');
        const matchDesc = document.getElementById('quizMatchDesc');

        // Smart recommendation matrix
        if (quizAnswers.goal === 'herbs') {
            matchTitle.textContent = '🌱 Kemangi Italia (Genovese Basil)';
            matchDesc.textContent = 'Paling cocok untuk dapur Anda! Daunnya harum pekat, tumbuh dalam 21 hari, dan sangat lezat untuk hidangan pasta, saus pesto, atau telur dadar segar.';
        } else if (quizAnswers.goal === 'tea') {
            matchTitle.textContent = '🍃 Peppermint Dingin (Crisp Mint)';
            matchDesc.textContent = 'Sempurna untuk ruang kerja atau kamar tidur! Sensasi aroma mentol segarnya meredakan penat dan bisa diseduh langsung menjadi teh herbal panas yang menenangkan.';
        } else if (quizAnswers.goal === 'veggie') {
            matchTitle.textContent = '🥗 Selada Romaine Hijau (Crisp Romaine)';
            matchDesc.textContent = 'Pilihan terbaik untuk konsumsi serat harian! Tekstur renyah manis dan 100% bebas pestisida untuk salad sehat keluarga Anda.';
        } else {
            matchTitle.textContent = '🪻 Lavender Relaksasi (English Lavender)';
            matchDesc.textContent = 'Menghadirkan pesona bunga ungu dan aromaterapi alami yang membuat suasana rumah Anda damai dan elegan.';
        }
    };

    window.resetQuiz = function () {
        window.nextQuizStep(1);
    };

    const btnApplyQuizToBundle = document.getElementById('btnApplyQuizToBundle');
    if (btnApplyQuizToBundle) {
        btnApplyQuizToBundle.addEventListener('click', () => {
            // Close modal
            const quizModalEl = document.getElementById('quizModal');
            if (quizModalEl && typeof bootstrap !== 'undefined') {
                const modal = bootstrap.Modal.getInstance(quizModalEl);
                if (modal) modal.hide();
            }

            // Scroll to bundle builder
            const bundleSection = document.getElementById('bundle-builder');
            if (bundleSection) {
                bundleSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // =========================================================================
    // 11. CHECKOUT, WHATSAPP GENERATOR & DIGITAL RECEIPT
    // =========================================================================
    const checkoutForm = document.getElementById('checkoutForm');
    const btnGenerateDigitalSlip = document.getElementById('btnGenerateDigitalSlip');

    function createOrderData() {
        const name = document.getElementById('custName').value || 'Pelanggan Verdant';
        const phone = document.getElementById('custWhatsapp').value || '-';
        const email = document.getElementById('custEmail').value || '-';
        const city = document.getElementById('custCity').value || 'Indonesia';

        const selectedCards = document.querySelectorAll('.seed-pod-card.selected');
        const seedNames = Array.from(selectedCards).map(c => c.dataset.seed);

        const newOrder = {
            id: 'VRD-' + Math.floor(1000 + Math.random() * 9000),
            name: name,
            whatsapp: phone,
            email: email,
            city: city,
            podColor: selectedColorName,
            seeds: seedNames,
            date: new Date().toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            price: 1487500,
            status: 'Pending'
        };

        // Save to localStorage for Admin Portal
        let orders = JSON.parse(localStorage.getItem('verdant_orders')) || [];
        orders.unshift(newOrder);
        localStorage.setItem('verdant_orders', JSON.stringify(orders));

        return newOrder;
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const order = createOrderData();

            // Populate Digital Receipt Modal
            showDigitalSlip(order);

            // Construct WhatsApp URL
            const seedListStr = order.seeds.join(', ');
            const message = `Halo Verdant Indonesia! Saya ingin konfirmasi Pre-order Verdant Pod:
- ID Pesanan: ${order.id}
- Nama: ${order.name}
- Kota: ${order.city}
- Warna Pod: ${order.podColor}
- 3 Seed Pods Gratis: ${seedListStr}
- Total Pre-order: Rp 1.487.500 (Diskon 15%)
Mohon diproses untuk pengiriman gelombang prioritas pertama. Terima kasih!`;

            const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;

            // Open WhatsApp in new tab
            window.open(waUrl, '_blank');

            // Hide checkout modal and open receipt modal
            const checkoutModalEl = document.getElementById('orderCheckoutModal');
            if (checkoutModalEl && typeof bootstrap !== 'undefined') {
                const mCheckout = bootstrap.Modal.getInstance(checkoutModalEl);
                if (mCheckout) mCheckout.hide();
            }

            const receiptModalEl = document.getElementById('receiptModal');
            if (receiptModalEl && typeof bootstrap !== 'undefined') {
                const mReceipt = new bootstrap.Modal(receiptModalEl);
                mReceipt.show();
            }
        });
    }

    if (btnGenerateDigitalSlip) {
        btnGenerateDigitalSlip.addEventListener('click', () => {
            const name = document.getElementById('custName').value.trim();
            if (!name) {
                alert('Silakan isi Nama dan Nomor WhatsApp terlebih dahulu.');
                return;
            }
            const order = createOrderData();
            showDigitalSlip(order);

            const checkoutModalEl = document.getElementById('orderCheckoutModal');
            if (checkoutModalEl && typeof bootstrap !== 'undefined') {
                const mCheckout = bootstrap.Modal.getInstance(checkoutModalEl);
                if (mCheckout) mCheckout.hide();
            }

            const receiptModalEl = document.getElementById('receiptModal');
            if (receiptModalEl && typeof bootstrap !== 'undefined') {
                const mReceipt = new bootstrap.Modal(receiptModalEl);
                mReceipt.show();
            }
        });
    }

    function showDigitalSlip(order) {
        const orderIdEl = document.getElementById('receiptOrderId');
        const dateEl = document.getElementById('receiptDate');
        const nameEl = document.getElementById('receiptCustName');
        const waEl = document.getElementById('receiptWhatsapp');
        const detailsEl = document.getElementById('receiptDetails');

        if (orderIdEl) orderIdEl.textContent = order.id;
        if (dateEl) dateEl.textContent = order.date;
        if (nameEl) nameEl.textContent = order.name;
        if (waEl) waEl.textContent = order.whatsapp;
        if (detailsEl) {
            detailsEl.textContent = `Verdant Smart Garden Pod (${order.podColor}) + 3 Seed Pods Gratis (${order.seeds.join(', ')}). Pengiriman ke: ${order.city}.`;
        }
    }

    // =========================================================================
    // 12. VERDANT AI GARDEN COPILOT (VIRTUAL AGRONOMIST)
    // =========================================================================
    const aiTrigger = document.getElementById('aiCopilotTrigger');
    const aiBox = document.getElementById('aiCopilotBox');
    const aiClose = document.getElementById('aiCopilotClose');
    const aiInput = document.getElementById('aiInput');
    const aiSendBtn = document.getElementById('aiSendBtn');
    const aiMessagesList = document.getElementById('aiMessagesList');
    const aiChips = document.querySelectorAll('.ai-chip');

    if (aiTrigger && aiBox) {
        aiTrigger.addEventListener('click', () => {
            aiBox.classList.toggle('show');
            if (aiBox.classList.contains('show') && aiInput) {
                setTimeout(() => aiInput.focus(), 300);
            }
        });
    }

    if (aiClose && aiBox) {
        aiClose.addEventListener('click', () => {
            aiBox.classList.remove('show');
        });
    }

    // Multilingual Agronomy Knowledge Base (ID, EN, JA)
    const agronomyKnowledge = {
        id: [
            {
                keywords: ['pemula', 'mudah', 'awal', 'pertama', 'beginner'],
                response: '🌱 Untuk pemula, saya sangat merekomendasikan **Kemangi Italia** atau **Daun Bawang**. Keduanya memiliki daya kecambah di atas 98%, tahan dalam berbagai suhu ruangan, dan daunnya bisa dipetik terus-menerus!'
            },
            {
                keywords: ['lampu', 'jam', 'led', 'cahaya', 'spektrum', 'terang'],
                response: '💡 Lampu LED spektrum fotosintesis Verdant Pod dirancang otomatis menyala **14-16 jam per hari** lalu beristirahat 8 jam. Ini meniru ritme sirkadian matahari di alam bebas agar tanaman tidak stres.'
            },
            {
                keywords: ['panen', 'petik', 'kemangi', 'basil', 'potong'],
                response: '✂️ **Tips panen kemangi terbaik**: Jangan petik daun bagian bawah satu per satu. Guntinglah pucuk batang tepat di atas cabang daun (*node*). Dalam 4-5 hari, cabang tersebut akan membelah menjadi dua cabang baru!'
            },
            {
                keywords: ['kuning', 'menguning', 'layu', 'daun'],
                response: '🍂 Daun menguning biasanya disebabkan dua hal: (1) Daun paling bawah sudah menua secara alami, silakan dipangkas. (2) Kelebihan air atau sirkulasi udara kurang. Cek indikator air di pod Anda agar tidak melebihi garis MAX!'
            },
            {
                keywords: ['resep', 'pesto', 'pasta', 'masak'],
                response: '🍝 **Resep Pesto Segar 5 Menit**: Haluskan 2 cangkir daun kemangi segar Verdant + 2 siung bawang putih + 1/4 cangkir kacang mede sangrai + 1/2 cangkir minyak zaitun extra virgin + keju parmesan dan garam. Aduk bersama pasta hangat!'
            },
            {
                keywords: ['air', 'tangki', 'isi', 'siram', 'penyiraman'],
                response: '💧 Tangki air Verdant Pod berkapasitas 2 Liter. Berkat sistem sirkulasi mikro tertutup kami, Anda hanya perlu mengisi ulang air **setiap 2 hingga 3 minggu sekali**. Praktis bahkan saat Anda liburan ke luar kota!'
            },
            {
                keywords: ['garansi', 'rusak', 'ganti', 'servis'],
                response: '🛡️ Setiap Verdant Pod dilindungi **Garansi Resmi 1 Tahun Ganti Baru**. Jika modul lampu LED atau pompa mikro mengalami kendala teknis, tim kami akan menukarnya langsung tanpa ribet.'
            }
        ],
        en: [
            {
                keywords: ['beginner', 'easy', 'start', 'first', 'recommend'],
                response: '🌱 For beginners, I strongly recommend **Genovese Basil** or **Spring Onion**. Both germinate at 98%+ success rates, adapt wonderfully to indoor temperatures, and yield perpetual cut-and-come-again harvests!'
            },
            {
                keywords: ['light', 'hour', 'led', 'schedule', 'spectrum'],
                response: '💡 The photosynthetic LED array operates on an automated **14-16 hours on / 8 hours off cycle**. This mimics natural solar circadian rhythm so your greens thrive without vegetative stress.'
            },
            {
                keywords: ['harvest', 'prune', 'basil', 'cut'],
                response: '✂️ **Pro Basil Harvesting Tip**: Never harvest lower leaves one by one! Pinch or snip the top stem just above a pair of leaves (*node*). Within 4-5 days, two vigorous new stems will branch out!'
            },
            {
                keywords: ['yellow', 'wilted', 'leaf', 'leaves', 'dry'],
                response: '🍂 Yellowing foliage is typically caused by: (1) Natural aging of bottom foliage, easily pruned away. (2) Excess water or low airflow. Verify that the water level window is not filled above the MAX threshold!'
            },
            {
                keywords: ['recipe', 'pesto', 'pasta', 'cook'],
                response: '🍝 **5-Minute Fresh Pesto**: Blend 2 cups fresh Verdant basil leaves + 2 cloves garlic + 1/4 cup toasted walnuts/pine nuts + 1/2 cup extra virgin olive oil + grated parmesan and sea salt. Toss with warm pasta!'
            },
            {
                keywords: ['water', 'tank', 'refill', 'reservoir'],
                response: '💧 Verdant Pod holds a generous 2L water reservoir. Thanks to our self-circulating passive sub-irrigation system, you only need to refill it **once every 2 to 3 weeks**!'
            },
            {
                keywords: ['warranty', 'defect', 'guarantee', 'support'],
                response: '🛡️ Every Verdant Pod includes a **1-Year Official Replacement Warranty**. If your LED panel or pump encounters any technical fault, we will swap it with a brand new unit.'
            }
        ],
        ja: [
            {
                keywords: ['初心者', '簡単', 'おすすめ', '最初'],
                response: '🌱 初心者の方には**イタリアンバジル**や**葉ネギ**が最もおすすめです！発芽率98%以上で室内温度にも強く、必要な分だけ摘み取っても次々と新しい若葉が育ちます。'
            },
            {
                keywords: ['ライト', '時間', 'led', '照射', '照明'],
                response: '💡 Verdant Podの光合成LEDは、1日**14〜16時間自動点灯／8時間消灯**のサーカディアンリズム（体内時計）を自動再現しています。'
            },
            {
                keywords: ['収穫', '摘芯', 'バジル', '切り方'],
                response: '✂️ **バジルの上手な収穫テクニック**: 下の葉を1枚ずつ取るのではなく、葉の付け根の少し上で主茎を剪定（摘芯）してください。数日でそこから2本の新しい側枝がぐんぐん伸びます！'
            },
            {
                keywords: ['黄色', '枯れ', '葉', '変色'],
                response: '🍂 葉が黄色くなる主な原因は：(1) 下葉の自然な生え替わり（摘み取ってOK）、(2) 水の与えすぎです。水窓のMAXラインを超えないよう注意してください。'
            },
            {
                keywords: ['レシピ', 'ジェノベーゼ', 'パスタ', '料理'],
                response: '🍝 **摘みたてバジルの自家製ジェノベーゼ**: 摘みたてバジル2カップ＋ニンニク2片＋松の実/くるみ1/4カップ＋オリーブオイル1/2カップ＋粉チーズと塩少々をミキサーにかけるだけ！'
            },
            {
                keywords: ['水', 'タンク', '給水', '頻度'],
                response: '💧 Verdant Podのタンク容量はたっぷり2L。循環マイクロ給水システムにより、水の補充は**約2〜3週間に1回**だけでOKです！長期旅行時も安心です。'
            }
        ]
    };

    function addMessage(text, isUser = false) {
        const bubble = document.createElement('div');
        bubble.className = `ai-bubble ${isUser ? 'ai-bubble-user' : 'ai-bubble-bot'}`;
        // Simple markdown parsing for bold text
        bubble.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        aiMessagesList.appendChild(bubble);
        aiMessagesList.scrollTop = aiMessagesList.scrollHeight;
    }

    function handleAiQuery(query) {
        if (!query.trim()) return;

        addMessage(query, true);
        if (aiInput) aiInput.value = '';

        // Show typing indicator
        const typingEl = document.createElement('div');
        typingEl.className = 'ai-bubble ai-bubble-bot ai-typing';
        typingEl.innerHTML = '<span></span><span></span><span></span>';
        aiMessagesList.appendChild(typingEl);
        aiMessagesList.scrollTop = aiMessagesList.scrollHeight;

        setTimeout(() => {
            typingEl.remove();

            const activeLang = localStorage.getItem('verdant_lang') || 'id';
            const kb = agronomyKnowledge[activeLang] || agronomyKnowledge.id;
            const lower = query.toLowerCase();
            let matched = kb.find(item => 
                item.keywords.some(k => lower.includes(k))
            );

            if (matched) {
                addMessage(matched.response);
            } else {
                if (activeLang === 'en') {
                    addMessage(`🌿 Great question about "${query}"! Verdant Pod uses closed-loop mineral sponge hydroponics with precision spectrum LEDs. Your greens are guaranteed optimal hydration and balanced nourishment.`);
                } else if (activeLang === 'ja') {
                    addMessage(`🌿 「${query}」についてのご質問ですね！Verdant Podは特殊ミネラルスポンジと自動スペクトルLEDを採用しており、どなたでも失敗なく豊かな緑をお楽しみいただけます。`);
                } else {
                    addMessage(`🌿 Pertanyaan menarik tentang "${query}"! Verdant Pod menggunakan media hidroponik pasif berspons mineral alami dengan spektrum LED terkontrol. Tanaman herbal Anda dijamin mendapatkan nutrisi seimbang, cukup pastikan tangki air terisi sesuai indikator.`);
                }
            }
        }, 600);
    }

    if (aiSendBtn && aiInput) {
        aiSendBtn.addEventListener('click', () => handleAiQuery(aiInput.value));
        aiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleAiQuery(aiInput.value);
        });
    }

    aiChips.forEach(chip => {
        chip.addEventListener('click', function () {
            handleAiQuery(this.dataset.query);
        });
    });

    // =========================================================================
    // 13. LIVE SOCIAL PROOF TICKER
    // =========================================================================
    const socialToast = document.getElementById('liveSocialToast');
    const toastName = document.getElementById('socialToastName');
    const toastAction = document.getElementById('socialToastAction');
    const closeSocialToast = document.getElementById('closeSocialToast');

    const simulatedCustomers = [
        { name: 'Rian D. dari Bandung', item: 'Pre-order Verdant Pod (Sage Emerald) • 2 mnt lalu' },
        { name: 'Nathania S. dari Jakarta Selatan', item: 'Pre-order Paket 3 Seed Pods • 4 mnt lalu' },
        { name: 'Dr. Hendra dari Surabaya', item: 'Pre-order Verdant Pod (Arctic White) • 6 mnt lalu' },
        { name: 'Maya P. dari Denpasar, Bali', item: 'Pre-order Pod (Scandinavian Bamboo) • 9 mnt lalu' },
        { name: 'Bimo K. dari Yogyakarta', item: 'Pre-order Verdant Pod (Midnight Obsidian) • 12 mnt lalu' }
    ];
    let toastIndex = 0;

    function showNextSocialToast() {
        if (!socialToast) return;
        const cust = simulatedCustomers[toastIndex];
        toastName.textContent = cust.name;
        toastAction.textContent = cust.item;
        socialToast.classList.add('show');

        toastIndex = (toastIndex + 1) % simulatedCustomers.length;

        setTimeout(() => {
            socialToast.classList.remove('show');
        }, 4500);
    }

    // Start ticker after 3 seconds, interval 12 seconds
    setTimeout(() => {
        showNextSocialToast();
        setInterval(showNextSocialToast, 13000);
    }, 3500);

    if (closeSocialToast && socialToast) {
        closeSocialToast.addEventListener('click', () => {
            socialToast.classList.remove('show');
        });
    }

    // =========================================================================
    // 14. FOOTER SUBSCRIBE / NEWSLETTER FORM
    // =========================================================================
    const subForm = document.getElementById('subscribeForm');
    if (subForm) {
        subForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = subForm.querySelector('input[type="email"]');
            const button = subForm.querySelector('button');
            const originalText = button.innerHTML;

            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Memproses...';

            setTimeout(() => {
                let orders = JSON.parse(localStorage.getItem('verdant_orders')) || [];
                const newOrder = {
                    id: 'VRD-' + Math.floor(1000 + Math.random() * 9000),
                    name: 'Newsletter Subscriber',
                    email: emailInput.value,
                    city: 'Indonesia',
                    podColor: 'Sage Emerald',
                    seeds: ['Kemangi Italia', 'Tomat Ceri', 'Peppermint'],
                    date: new Date().toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    status: 'Pending'
                };
                orders.unshift(newOrder);
                localStorage.setItem('verdant_orders', JSON.stringify(orders));

                button.classList.remove('btn-white', 'text-emerald');
                button.classList.add('btn-success', 'text-white');
                button.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Berhasil Terdaftar!';
                
                alert(`Terima kasih! Email Anda (${emailInput.value}) telah terdaftar untuk voucher diskon 15% Verdant Pod.`);
                emailInput.value = '';

                setTimeout(() => {
                    button.disabled = false;
                    button.classList.remove('btn-success', 'text-white');
                    button.classList.add('btn-white', 'text-emerald');
                    button.innerHTML = originalText;
                }, 3000);
            }, 1200);
        });
    }
});

    // Listen for language change events to update interactive dynamic text
    window.addEventListener('languageChanged', (e) => {
        const lang = e.detail.lang;
        const chipsContainer = document.getElementById('aiQuickChips');
        if (chipsContainer) {
            if (lang === 'en') {
                chipsContainer.innerHTML = `
                    <span class="ai-chip" data-query="Which plant is best for absolute beginners?">🌱 Beginner seeds?</span>
                    <span class="ai-chip" data-query="How many hours should the LED grow light stay on?">💡 Light schedule?</span>
                    <span class="ai-chip" data-query="How to properly harvest basil so it keeps growing?">✂️ Pruning basil?</span>
                    <span class="ai-chip" data-query="Why are the leaves turning yellow?">🍂 Yellow leaves?</span>
                    <span class="ai-chip" data-query="What is a quick fresh pesto recipe?">🍝 Pesto recipe?</span>
                `;
            } else if (lang === 'ja') {
                chipsContainer.innerHTML = `
                    <span class="ai-chip" data-query="初心者におすすめの育てやすい植物は？">🌱 初心者向け種子?</span>
                    <span class="ai-chip" data-query="LEDライトは何時間つければいいですか？">💡 LED照射時間?</span>
                    <span class="ai-chip" data-query="バジルの収穫方法と長持ちのコツは？">✂️ 収穫方法?</span>
                    <span class="ai-chip" data-query="葉が黄色くなる原因は何ですか？">🍂 葉の変色?</span>
                    <span class="ai-chip" data-query="バジルの簡単ジェノベーゼパスタのレシピは？">🍝 ジェノベーゼ?</span>
                `;
            } else {
                chipsContainer.innerHTML = `
                    <span class="ai-chip" data-query="Tanaman apa yang paling mudah untuk pemula?">🌱 Bibit pemula?</span>
                    <span class="ai-chip" data-query="Berapa jam lampu LED harus menyala setiap hari?">💡 Jam lampu LED?</span>
                    <span class="ai-chip" data-query="Bagaimana cara panen daun kemangi agar tumbuh terus?">✂️ Tips panen kemangi?</span>
                    <span class="ai-chip" data-query="Kenapa daun tanaman bisa menguning?">🍂 Daun menguning?</span>
                    <span class="ai-chip" data-query="Apa resep saus pesto segar dari kemangi?">🍝 Resep pesto?</span>
                `;
            }

            // Re-attach chip event listeners
            chipsContainer.querySelectorAll('.ai-chip').forEach(chip => {
                chip.addEventListener('click', function () {
                    handleAiQuery(this.dataset.query);
                });
            });
        }
    });
