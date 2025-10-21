class AlgorithmPresentation {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 36;
        this.slides = [];
        this.isTransitioning = false;
        
        this.init();
    }

    init() {
        // Get all slides
        this.slides = document.querySelectorAll('.slide');
        
        // Initialize UI elements
        this.initializeElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update initial state
        this.updateUI();
        
        // Handle URL hash for bookmarking
        this.handleInitialHash();
    }

    initializeElements() {
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlideSpan = document.getElementById('currentSlide');
        this.totalSlidesSpan = document.getElementById('totalSlides');
        this.progressBar = document.getElementById('progressBar');
        
        // Set total slides
        if (this.totalSlidesSpan) {
            this.totalSlidesSpan.textContent = this.totalSlides;
        }
    }

    setupEventListeners() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch/swipe support for mobile
        this.setupTouchEvents();
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => this.handlePopState());
    }

    setupTouchEvents() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        const presentationContainer = document.querySelector('.presentation-container');
        
        if (!presentationContainer) return;
        
        presentationContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        presentationContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = Math.abs(endY - startY);
            
            // Only trigger if horizontal swipe is more prominent than vertical
            if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
                if (deltaX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        }, { passive: true });
    }

    handleKeyboard(e) {
        if (this.isTransitioning) return;
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ': // Spacebar
                e.preventDefault();
                this.nextSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
            case 'Escape':
                // Could be used for fullscreen exit or other functionality
                break;
        }
    }

    previousSlide() {
        if (this.currentSlide > 1 && !this.isTransitioning) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides && !this.isTransitioning) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides || slideNumber === this.currentSlide) {
            return;
        }
        
        this.isTransitioning = true;
        
        // Remove active class from current slide
        const currentSlideEl = this.slides[this.currentSlide - 1];
        if (currentSlideEl) {
            currentSlideEl.classList.remove('active');
        }
        
        // Update current slide number
        this.currentSlide = slideNumber;
        
        // Add active class to new slide
        const newSlideEl = this.slides[this.currentSlide - 1];
        if (newSlideEl) {
            // Small delay to ensure smooth transition
            setTimeout(() => {
                newSlideEl.classList.add('active');
                this.isTransitioning = false;
            }, 50);
        } else {
            this.isTransitioning = false;
        }
        
        // Update UI
        this.updateUI();
        
        // Update URL hash for bookmarking
        this.updateURLHash();
    }

    updateUI() {
        // Update slide counter
        if (this.currentSlideSpan) {
            this.currentSlideSpan.textContent = this.currentSlide;
        }
        
        // Update progress bar
        if (this.progressBar) {
            const progress = (this.currentSlide / this.totalSlides) * 100;
            this.progressBar.style.width = `${progress}%`;
        }
        
        // Update navigation buttons
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentSlide === 1;
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentSlide === this.totalSlides;
        }
        
        // Update navigation button titles
        if (this.prevBtn) {
            this.prevBtn.title = this.currentSlide === 1 ? 'Première diapositive' : `Diapositive ${this.currentSlide - 1}`;
        }
        
        if (this.nextBtn) {
            this.nextBtn.title = this.currentSlide === this.totalSlides ? 'Dernière diapositive' : `Diapositive ${this.currentSlide + 1}`;
        }
    }

    updateURLHash() {
        const newHash = `#slide-${this.currentSlide}`;
        if (window.location.hash !== newHash) {
            history.pushState(null, null, newHash);
        }
    }

    handleInitialHash() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#slide-')) {
            const slideNumber = parseInt(hash.replace('#slide-', ''), 10);
            if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
                this.currentSlide = slideNumber;
                
                // Remove active from all slides
                this.slides.forEach(slide => slide.classList.remove('active'));
                
                // Add active to current slide
                const targetSlide = this.slides[this.currentSlide - 1];
                if (targetSlide) {
                    targetSlide.classList.add('active');
                }
                
                this.updateUI();
            }
        }
    }

    handlePopState() {
        this.handleInitialHash();
    }

    // Public methods for external control
    getCurrentSlide() {
        return this.currentSlide;
    }

    getTotalSlides() {
        return this.totalSlides;
    }

    // Jump to specific slide (for potential slide navigator)
    jumpToSlide(slideNumber) {
        this.goToSlide(slideNumber);
    }

    // Get slide information
    getSlideInfo() {
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            progress: (this.currentSlide / this.totalSlides) * 100
        };
    }
}

// Additional utility functions for presentation enhancement
class PresentationEnhancer {
    static init() {
        this.addKeyboardShortcutInfo();
        this.handleFullscreenAPI();
        this.addAccessibilityFeatures();
    }

    static addKeyboardShortcutInfo() {
        // Add keyboard shortcut information (could be toggled with a help key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'h' || e.key === 'H') {
                this.showKeyboardHelp();
            }
        });
    }

    static showKeyboardHelp() {
        // Create and show a modal with keyboard shortcuts
        const helpText = `
Raccourcis clavier :
↑/← : Diapositive précédente
↓/→/Espace : Diapositive suivante
Début : Première diapositive
Fin : Dernière diapositive
H : Afficher cette aide
Échap : Fermer l'aide
        `;
        
        console.log(helpText);
        // In a real implementation, you might show a modal dialog
    }

    static handleFullscreenAPI() {
        // Add fullscreen functionality
        document.addEventListener('keydown', (e) => {
            if (e.key === 'f' || e.key === 'F') {
                this.toggleFullscreen();
            }
        });
    }

    static toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported or denied');
            });
        } else {
            document.exitFullscreen();
        }
    }

    static addAccessibilityFeatures() {
        // Add ARIA labels and roles for better accessibility
        const slides = document.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            slide.setAttribute('role', 'tabpanel');
            slide.setAttribute('aria-label', `Diapositive ${index + 1} sur ${slides.length}`);
        });

        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            navContainer.setAttribute('role', 'navigation');
            navContainer.setAttribute('aria-label', 'Navigation de présentation');
        }
    }
}

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create presentation instance
    const presentation = new AlgorithmPresentation();
    
    // Add enhancements
    PresentationEnhancer.init();
    
    // Make presentation globally available for debugging/external control
    window.algorithmPresentation = presentation;
    
    // Optional: Add some console information
    console.log('🎯 Présentation Algorithmique initialisée');
    console.log('📚 Utilisez les flèches du clavier ou les boutons pour naviguer');
    console.log('⌨️ Appuyez sur "H" pour voir les raccourcis clavier');
    console.log('🔍 Utilisez "F" pour basculer en mode plein écran');
});