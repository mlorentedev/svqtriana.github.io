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