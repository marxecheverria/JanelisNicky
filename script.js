// Álbum Fotográfico Móvil con Zoom y FlipBook
(function() {
    'use strict';
    
    const app = {
        container: document.getElementById('albumContainer'),
        musicBtn: document.getElementById('musicBtn'),
        reloadBtn: document.getElementById('reloadBtn'),
        zoomInBtn: document.getElementById('zoomInBtn'),
        zoomOutBtn: document.getElementById('zoomOutBtn'),
        swipeModeBtn: document.getElementById('swipeMode'),
        flipModeBtn: document.getElementById('flipMode'),
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
        touchEnd: { x: 0, y: 0 },
        zoomLevel: 1,
        isFlipbookMode: false,
        
        // Variables para pinch zoom
        pinchDistance: 0,
        lastPinchDistance: 0,
        isPinching: false
    };
    
    function init() {
        setupSwipe();
        setupMusic();
        setupParticles();
        setupImages();
        setupZoom();
        setupReload();
        setupModeSwitch();
        updateUI();
        
        if (app.restartBtn) {
            app.restartBtn.addEventListener('click', () => goToSlide(0));
        }
        
        document.addEventListener('keydown', handleKeyboard);
        window.addEventListener('orientationchange', handleOrientation);
        preventDoubleTapZoom();
    }
    
    // ========================================
    // SISTEMA DE ZOOM
    // ========================================
    
    function setupZoom() {
        // Botones de zoom
        if (app.zoomInBtn) {
            app.zoomInBtn.addEventListener('click', () => zoomIn());
        }
        if (app.zoomOutBtn) {
            app.zoomOutBtn.addEventListener('click', () => zoomOut());
        }
        
        // Pinch to zoom
        app.container.addEventListener('touchstart', handlePinchStart, { passive: false });
        app.container.addEventListener('touchmove', handlePinchMove, { passive: false });
        app.container.addEventListener('touchend', handlePinchEnd, { passive: false });
        
        // Double tap to zoom
        setupDoubleTapZoom();
    }
    
    function handlePinchStart(e) {
        if (e.touches.length === 2) {
            app.isPinching = true;
            app.pinchDistance = getPinchDistance(e.touches);
            app.lastPinchDistance = app.pinchDistance;
            e.preventDefault();
        }
    }
    
    function handlePinchMove(e) {
        if (app.isPinching && e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getPinchDistance(e.touches);
            const delta = currentDistance - app.lastPinchDistance;
            
            // Ajustar zoom basado en el cambio de distancia
            const zoomDelta = delta * 0.01;
            app.zoomLevel = Math.max(1, Math.min(5, app.zoomLevel + zoomDelta));
            
            applyZoom();
            app.lastPinchDistance = currentDistance;
        }
    }
    
    function handlePinchEnd(e) {
        if (app.isPinching) {
            app.isPinching = false;
            app.pinchDistance = 0;
            app.lastPinchDistance = 0;
        }
    }
    
    function getPinchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    function setupDoubleTapZoom() {
        let lastTap = 0;
        app.slides.forEach(slide => {
            slide.addEventListener('touchend', (e) => {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                
                if (tapLength < 300 && tapLength > 0) {
                    // Double tap detectado
                    e.preventDefault();
                    if (app.zoomLevel === 1) {
                        app.zoomLevel = 2;
                    } else {
                        app.zoomLevel = 1;
                    }
                    applyZoom();
                }
                lastTap = currentTime;
            });
        });
    }
    
    function zoomIn() {
        app.zoomLevel = Math.min(5, app.zoomLevel + 0.5);
        applyZoom();
        vibrate(10);
    }
    
    function zoomOut() {
        app.zoomLevel = Math.max(1, app.zoomLevel - 0.5);
        applyZoom();
        vibrate(10);
    }
    
    function applyZoom() {
        const currentSlideEl = app.slides[app.currentSlide];
        if (currentSlideEl) {
            currentSlideEl.style.setProperty('--zoom-level', app.zoomLevel);
            
            if (app.zoomLevel > 1) {
                currentSlideEl.classList.add('zoomed');
            } else {
                currentSlideEl.classList.remove('zoomed');
            }
        }
    }
    
    // ========================================
    // RECARGA DE PÁGINA
    // ========================================
    
    function setupReload() {
        if (app.reloadBtn) {
            app.reloadBtn.addEventListener('click', () => {
                if (confirm('¿Recargar el álbum?')) {
                    location.reload();
                }
            });
        }
    }
    
    // ========================================
    // SWITCH DE MODO
    // ========================================
    
    function setupModeSwitch() {
        if (app.swipeModeBtn) {
            app.swipeModeBtn.addEventListener('click', () => activateSwipeMode());
        }
        if (app.flipModeBtn) {
            app.flipModeBtn.addEventListener('click', () => activateFlipbookMode());
        }
    }
    
    function activateSwipeMode() {
        app.isFlipbookMode = false;
        app.container.classList.remove('flipbook-mode');
        app.swipeModeBtn.classList.add('active');
        app.flipModeBtn.classList.remove('active');
        
        // Destruir flipbook si existe
        if (typeof $ !== 'undefined' && app.container.turn) {
            try {
                $(app.container).turn('destroy');
            } catch(e) {
                console.log('No flipbook to destroy');
            }
        }
        
        vibrate(10);
    }
    
    function activateFlipbookMode() {
        app.isFlipbookMode = true;
        app.container.classList.add('flipbook-mode');
        app.flipModeBtn.classList.add('active');
        app.swipeModeBtn.classList.remove('active');
        
        // Inicializar Turn.js
        if (typeof $ !== 'undefined' && typeof $.fn.turn !== 'undefined') {
            setTimeout(() => {
                try {
                    $(app.container).turn({
                        width: window.innerWidth,
                        height: window.innerHeight,
                        autoCenter: true,
                        acceleration: true,
                        gradients: true,
                        elevation: 50,
                        duration: 1000,
                        pages: app.slides.length,
                        when: {
                            turned: function(e, page) {
                                app.currentSlide = page - 1;
                                updateUI();
                            }
                        }
                    });
                } catch(e) {
                    console.error('Error inicializando flipbook:', e);
                    activateSwipeMode();
                }
            }, 100);
        } else {
            console.error('Turn.js no está disponible');
            activateSwipeMode();
        }
        
        vibrate(10);
    }
    
    // ========================================
    // SISTEMA DE SWIPE (igual que antes)
    // ========================================
    
    function setupSwipe() {
        app.container.addEventListener('touchstart', handleTouchStart, { passive: true });
        app.container.addEventListener('touchmove', handleTouchMove, { passive: false });
        app.container.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        document.addEventListener('keydown', handleKeyboard);
        app.container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    function handleTouchStart(e) {
        if (app.isPinching || e.touches.length > 1) return;
        app.touchStart.x = e.touches[0].clientX;
        app.touchStart.y = e.touches[0].clientY;
    }
    
    function handleTouchMove(e) {
        if (app.isScrolling || app.isPinching || e.touches.length > 1) return;
        
        app.touchEnd.x = e.touches[0].clientX;
        app.touchEnd.y = e.touches[0].clientY;
        
        const deltaX = Math.abs(app.touchEnd.x - app.touchStart.x);
        const deltaY = Math.abs(app.touchEnd.y - app.touchStart.y);
        
        if (deltaX > deltaY && app.zoomLevel === 1) {
            e.preventDefault();
        }
    }
    
    function handleTouchEnd(e) {
        if (app.isScrolling || app.isPinching || app.isFlipbookMode) return;
        
        const deltaX = app.touchStart.x - app.touchEnd.x;
        const deltaY = Math.abs(app.touchStart.y - app.touchEnd.y);
        const minSwipe = 50;
        
        if (Math.abs(deltaX) > minSwipe && Math.abs(deltaX) > deltaY && app.zoomLevel === 1) {
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
    
    function handleWheel(e) {
        if (app.isScrolling || app.isFlipbookMode) return;
        e.preventDefault();
        if (e.deltaY > 0 || e.deltaX > 0) {
            nextSlide();
        } else if (e.deltaY < 0 || e.deltaX < 0) {
            prevSlide();
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
        if (app.isScrolling || index < 0 || index >= app.slides.length || app.isFlipbookMode) return;
        
        app.isScrolling = true;
        app.currentSlide = index;
        app.zoomLevel = 1; // Reset zoom al cambiar de página
        
        app.container.scrollTo({
            left: window.innerWidth * index,
            behavior: 'smooth'
        });
        
        updateUI();
        preloadNearby(index);
        
        if (index > 0 && !app.musicPlaying) playMusic();
        if (index === 0) createHearts();
        if (index === app.slides.length - 1) createConfetti();
        
        applyZoom();
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
    
    // ========================================
    // MÚSICA (igual que antes)
    // ========================================
    
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
    
    // ========================================
    // IMÁGENES, PARTÍCULAS Y EFECTOS
    // ========================================
    
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
            if (!app.isFlipbookMode) {
                app.container.scrollLeft = window.innerWidth * app.currentSlide;
            }
        }, 100);
    }
    
    function vibrate(duration) {
        if ('vibrate' in navigator) navigator.vibrate(duration);
    }
    
    function preventDoubleTapZoom() {
        // Permitir zoom pero prevenir el zoom de doble tap del navegador
        let lastTouch = 0;
        document.addEventListener('touchend', e => {
            const now = Date.now();
            if (now - lastTouch <= 300) {
                // Manejado por nuestro sistema de zoom
            }
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
    
    console.log('✅ Álbum con Zoom y FlipBook listo 📱✨');
})();
