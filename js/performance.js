// Performance optimizations
(function() {
    'use strict';
    
    // Lazy loading for images
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        img.setAttribute('data-loaded', 'true');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.setAttribute('data-loaded', 'true');
            });
        }
    }
    
    // Preload critical resources
    function preloadCriticalResources() {
        const criticalImages = [
            'images/webp/logo_192.webp',
            'images/webp/bg.webp'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
    
    // Defer non-critical CSS
    function loadDeferredCSS() {
        const deferredStyles = document.querySelectorAll('link[media="print"]');
        deferredStyles.forEach(link => {
            if (link.onload === null) {
                link.onload = function() {
                    this.media = 'all';
                };
            }
        });
    }
    
    // Font loading optimization
    function optimizeFontLoading() {
        // Add font-loading class to body
        document.documentElement.classList.add('font-loading');
        
        // Check if fonts are loaded
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                document.documentElement.classList.remove('font-loading');
                document.documentElement.classList.add('font-loaded');
            });
        } else {
            // Fallback for browsers without Font Loading API
            setTimeout(() => {
                document.documentElement.classList.remove('font-loading');
                document.documentElement.classList.add('font-loaded');
            }, 3000);
        }
    }

    // Initialize performance optimizations
    function init() {
        // Run immediately
        preloadCriticalResources();
        loadDeferredCSS();
        optimizeFontLoading();
        
        // Run when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', lazyLoadImages);
        } else {
            lazyLoadImages();
        }
    }
    
    init();
})();
// Keep the footer year current without shipping the whole footer in JS. The
// markup carries a correct year already, so this is a refresh, not a build step.
(function () {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
})();

// Mobile navigation toggle.
//
// This is the only implementation: the site ships no Bootstrap JavaScript. It
// used to, and that is worth knowing before anyone adds it back - the bundled
// css/bootstrap.css is v4.3.1 and hides the menu with `.collapse:not(.show)`,
// while the JS that shipped alongside it was v3.4.1 and toggled the v3 class
// `in`, which no stylesheet here defines. The menu was dead on every page for
// exactly that reason. Reintroducing Bootstrap's JS without matching its major
// version to the CSS would break it again, silently.
//
// scripts/check_pages.py fails if this toggle or its target id goes missing.
(function () {
    const button = document.querySelector('.navbar-toggler');
    const menu = document.getElementById('navbarSupportedContent');
    if (!button || !menu) return;

    button.addEventListener('click', function () {
        const open = menu.classList.toggle('show');
        button.setAttribute('aria-expanded', String(open));
    });

    // Following a link should not leave the menu open behind the new page.
    menu.addEventListener('click', function (event) {
        if (event.target.closest('a') && menu.classList.contains('show')) {
            menu.classList.remove('show');
            button.setAttribute('aria-expanded', 'false');
        }
    });
})();
