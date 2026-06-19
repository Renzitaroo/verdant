// JavaScript untuk Verdant Landing Page

document.addEventListener('DOMContentLoaded', function () {
    
    // 1. Inisialisasi AOS (Animate On Scroll) - ENHANCED CONFIG
    AOS.init({
        duration: 1200,
        easing: 'ease-out-quart',
        once: false,
        mirror: true,
        offset: 80,
        anchorPlacement: 'top-bottom',
    });

    // 1b. Animasi Angka Naik (Counter Animation) untuk Hero Stats
    function animateCounter(element, target, suffix = '') {
        let current = 0;
        const increment = target / 60; // 60 frames
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + suffix;
        }, 25);
    }

    // Trigger counter saat Hero section visible
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

    // 1c. Parallax Tilt Effect pada Hero Image (Mouse Move)
    const heroImg = document.querySelector('.hero-image-wrapper');
    if (heroImg) {
        document.querySelector('.hero-section').addEventListener('mousemove', (e) => {
            const rect = heroImg.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
            const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
            heroImg.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
        });
        document.querySelector('.hero-section').addEventListener('mouseleave', () => {
            heroImg.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
            heroImg.style.transition = 'transform 0.6s ease-out';
        });
    }

    // 2. Navbar Scroll Effect (Berubah warna background saat di-scroll)
    const navbar = document.getElementById('mainNav');
    
    function checkScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // Jalankan saat load pertama & setiap scroll
    checkScroll();
    window.addEventListener('scroll', checkScroll);

    // 3. Active Link Highlight berdasarkan Section Viewport (Scrollspy Kustom)
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            // Memberikan sedikit offset (150px) agar navigasi aktif tepat waktu
            if (window.scrollY >= (sectionTop - 150)) {
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

    // 4. Tutup Menu Collapsible secara otomatis setelah link diklik (di Tampilan Mobile)
    const navItems = document.querySelectorAll('.navbar-nav .nav-link:not(.btn)');
    const menuToggle = document.getElementById('navbarNav');
    const bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                bsCollapse.hide();
            }
        });
    });

    // 5. Interaksi Submit Form Newsletter (Pre-order / Langganan)
    const form = document.getElementById('subscribeForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const button = form.querySelector('button');
            const originalText = button.innerHTML;
            
            // Efek Loading Sederhana
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Memproses...';

            setTimeout(() => {
                // Simpan ke localStorage untuk dashboard admin
                let orders = JSON.parse(localStorage.getItem('verdant_orders')) || [];
                const newOrder = {
                    id: 'VRD-' + Math.floor(1000 + Math.random() * 9000),
                    email: emailInput.value,
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

                // Tampilkan sukses
                button.classList.remove('btn-white', 'text-emerald');
                button.classList.add('btn-success', 'text-white');
                button.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Berhasil Terdaftar!';
                
                // Alert sukses popup sederhana
                alert(`Terima kasih! Email Anda (${emailInput.value}) telah terdaftar untuk pre-order diskon 15%. Kami akan segera menghubungi Anda saat produk siap dikirim.`);
                
                emailInput.value = '';
                
                // Reset setelah beberapa detik
                setTimeout(() => {
                    button.disabled = false;
                    button.classList.remove('btn-success', 'text-white');
                    button.classList.add('btn-white', 'text-emerald');
                    button.innerHTML = originalText;
                }, 3000);
            }, 1500);
        });
    }
});
