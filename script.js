// Álbum Fotográfico Móvil
(function() {
    'use strict';
    
    const app = {
        container: document.getElementById('albumContainer'),
        musicBtn: document.getElementById('musicBtn'),
        music: document.getElementById('backgroundMusic'),
        currentPageEl: document.getElementById('currentPage'),
        progressFill: document.getElementById('progressFill'),
        restartBtn: document.getElementById('restartBtn'),
        slides: document.querySelectorAll('.photo-slide'),
        canvas: document.getElementById('particlesCanvas'),
        
        currentSlide: 0,
        isScrolling: false,
        musicPlaying: false,
        touchStart: { x: 0, y: 0 },
        touchEnd: { x: 0, y: 0 }
    };
    
    function init() {
        setupSwipe();
        setupMusic();
        setupParticles();
        setupImages();
        updateUI();
        
        if (app.restartBtn) {
            app.restartBtn.addEventListener('click', () => goToSlide(0));
        }
        
        document.addEventListener('keydown', handleKeyboard);
        window.addEventListener('orientationchange', handleOrientation);
        preventDoubleTapZoom();
    }
    
    function setupSwipe() {
        app.container.addEventListener('touchstart', e => {
            app.touchStart.x = e.touches[0].clientX;
            app.touchStart.y = e.touches[0].clientY;
        }, { passive: true });
        
        app.container.addEventListener('touchmove', e => {
            if (app.isScrolling) return;
            const deltaX = Math.abs(e.touches[0].clientX - app.touchStart.x);
            const deltaY = Math.abs(e.touches[0].clientY - app.touchStart.y);
            if (deltaX > deltaY) e.preventDefault();
        }, { passive: false });
        
        app.container.addEventListener('touchend', e => {
            if (app.isScrolling) return;
            app.touchEnd.x = e.changedTouches[0].clientX;
            app.touchEnd.y = e.changedTouches[0].clientY;
            handleSwipe();
        }, { passive: true });
    }
    
    function handleSwipe() {
        const deltaX = app.touchStart.x - app.touchEnd.x;
        const deltaY = Math.abs(app.touchStart.y - app.touchEnd.y);
        const minSwipe = 50;
        
        if (Math.abs(deltaX) > minSwipe && Math.abs(deltaX) > deltaY) {
            deltaX > 0 ? nextSlide() : prevSlide();
        }
    }
    
    function handleKeyboard(e) {
        if (app.isScrolling) return;
        const actions = {
            'ArrowLeft': prevSlide,
            'ArrowRight': nextSlide,
            'ArrowUp': prevSlide,
            'ArrowDown': nextSlide,
            ' ': nextSlide,
            'Home': () => goToSlide(0),
            'End': () => goToSlide(app.slides.length - 1)
        };
        if (actions[e.key]) {
            e.preventDefault();
            actions[e.key]();
        }
    }
    
    function nextSlide() {
        if (app.currentSlide < app.slides.length - 1) {
            goToSlide(app.currentSlide + 1);
        }
    }
    
    function prevSlide() {
        if (app.currentSlide > 0) {
            goToSlide(app.currentSlide - 1);
        }
    }
    
    function goToSlide(index) {
        if (app.isScrolling || index < 0 || index >= app.slides.length) return;
        
        app.isScrolling = true;
        app.currentSlide = index;
        
        app.container.scrollTo({
            left: window.innerWidth * index,
            behavior: 'smooth'
        });
        
        updateUI();
        preloadNearby(index);
        
        if (index > 0 && !app.musicPlaying) playMusic();
        if (index === 0) createHearts();
        if (index === app.slides.length - 1) createConfetti();
        
        vibrate(10);
        setTimeout(() => app.isScrolling = false, 600);
    }
    
    function updateUI() {
        app.currentPageEl.textContent = app.currentSlide + 1;
        const progress = ((app.currentSlide + 1) / app.slides.length) * 100;
        app.progressFill.style.width = progress + '%';
        
        app.currentPageEl.style.transform = 'scale(1.2)';
        setTimeout(() => app.currentPageEl.style.transform = 'scale(1)', 200);
    }
    
    function setupMusic() {
        if (!app.music) return;
        app.music.volume = 0.3;
        app.musicBtn.addEventListener('click', toggleMusic);
        document.addEventListener('click', () => !app.musicPlaying && playMusic(), { once: true });
    }
    
    function toggleMusic() {
        app.musicPlaying ? pauseMusic() : playMusic();
    }
    
    function playMusic() {
        if (!app.music) return;
        app.music.play().then(() => {
            app.musicPlaying = true;
            app.musicBtn.classList.add('playing');
        }).catch(() => {});
    }
    
    function pauseMusic() {
        if (!app.music) return;
        app.music.pause();
        app.musicPlaying = false;
        app.musicBtn.classList.remove('playing');
    }
    
    function setupImages() {
        const images = document.querySelectorAll('.slide-img, .cover-img');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '200px' });
        
        images.forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', () => img.classList.add('loaded'));
                observer.observe(img);
            }
        });
        
        for (let i = 0; i < Math.min(3, app.slides.length); i++) {
            const img = app.slides[i].querySelector('.slide-img, .cover-img');
            if (img && !img.complete) new Image().src = img.src;
        }
    }
    
    function preloadNearby(index) {
        [index - 1, index, index + 1].forEach(i => {
            if (i >= 0 && i < app.slides.length) {
                const img = app.slides[i].querySelector('.slide-img, .cover-img');
                if (img && !img.complete) new Image().src = img.src;
            }
        });
    }
    
    function setupParticles() {
        if (!app.canvas) return;
        const ctx = app.canvas.getContext('2d');
        app.canvas.width = window.innerWidth;
        app.canvas.height = window.innerHeight;
        
        const particles = Array.from({ length: 30 }, () => ({
            x: Math.random() * app.canvas.width,
            y: Math.random() * app.canvas.height,
            radius: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2
        }));
        
        function animate() {
            ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0 || p.x > app.canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > app.canvas.height) p.speedY *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();
            });
            requestAnimationFrame(animate);
        }
        animate();
        
        window.addEventListener('resize', () => {
            app.canvas.width = window.innerWidth;
            app.canvas.height = window.innerHeight;
        });
    }
    
    function createHearts() {
        const hearts = ['💖', '💕', '💗', '💓', '💝'];
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createFloatingElement(hearts, 'floatUp'), i * 200);
        }
    }
    
    function createConfetti() {
        const confetti = ['✨', '⭐', '💫', '🌟', '💖'];
        for (let i = 0; i < 20; i++) {
            setTimeout(() => createFloatingElement(confetti, 'fall'), i * 100);
        }
    }
    
    function createFloatingElement(items, animName) {
        const el = document.createElement('div');
        el.textContent = items[Math.floor(Math.random() * items.length)];
        el.style.cssText = `
            position: fixed;
            left: ${Math.random() * window.innerWidth}px;
            top: ${animName === 'floatUp' ? window.innerHeight : -50}px;
            font-size: ${Math.random() * 20 + 15}px;
            z-index: 999;
            pointer-events: none;
            animation: ${animName} ${2 + Math.random() * 2}s ease-out forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            to { transform: translateY(-${window.innerHeight + 100}px) rotate(360deg); opacity: 0; }
        }
        @keyframes fall {
            to { transform: translateY(${window.innerHeight + 100}px) rotate(720deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    function handleOrientation() {
        setTimeout(() => {
            app.canvas.width = window.innerWidth;
            app.canvas.height = window.innerHeight;
            app.container.scrollLeft = window.innerWidth * app.currentSlide;
        }, 100);
    }
    
    function vibrate(duration) {
        if ('vibrate' in navigator) navigator.vibrate(duration);
    }
    
    function preventDoubleTapZoom() {
        let lastTouch = 0;
        document.addEventListener('touchend', e => {
            const now = Date.now();
            if (now - lastTouch <= 300) e.preventDefault();
            lastTouch = now;
        }, { passive: false });
    }
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && app.musicPlaying && app.music) {
            app.music.pause();
        } else if (!document.hidden && app.musicPlaying && app.music) {
            app.music.play();
        }
    });
    
    document.addEventListener('DOMContentLoaded', init);
    
    console.log('✅ Álbum móvil listo - Desliza para navegar 👆');
})();

