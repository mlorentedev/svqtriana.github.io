// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Secure DOM creation without innerHTML injection
    const heroArea = document.createElement('div');
    heroArea.className = 'hero_area';
    
    const headerSection = document.createElement('header');
    headerSection.className = 'header_section';
    headerSection.id = 'home';
    
    const containerFluid = document.createElement('div');
    containerFluid.className = 'container-fluid';
    
    const nav = document.createElement('nav');
    nav.className = 'navbar navbar-expand-lg custom_nav-container pt-3';
    
    // Brand link
    const brandLink = document.createElement('a');
    brandLink.className = 'navbar-brand';
    brandLink.href = 'index.html';
    
    const brandImg = document.createElement('img');
    brandImg.src = 'images/webp/logo_192.webp';
    brandImg.alt = 'PS SVQ Triana Logo';
    brandLink.appendChild(brandImg);
    
    // Navbar toggler
    const togglerButton = document.createElement('button');
    togglerButton.className = 'navbar-toggler';
    togglerButton.type = 'button';
    togglerButton.setAttribute('data-toggle', 'collapse');
    togglerButton.setAttribute('data-target', '#navbarSupportedContent');
    togglerButton.setAttribute('aria-controls', 'navbarSupportedContent');
    togglerButton.setAttribute('aria-expanded', 'false');
    togglerButton.setAttribute('aria-label', 'Toggle navigation');
    
    const togglerIcon = document.createElement('span');
    togglerIcon.className = 'navbar-toggler-icon';
    togglerButton.appendChild(togglerIcon);
    
    // Navbar collapse
    const navbarCollapse = document.createElement('div');
    navbarCollapse.className = 'collapse navbar-collapse';
    navbarCollapse.id = 'navbarSupportedContent';
    
    const navContainer = document.createElement('div');
    navContainer.className = 'd-flex ml-auto flex-column flex-lg-row align-items-center';
    
    const navList = document.createElement('ul');
    navList.className = 'navbar-nav';
    
    // Navigation items - secure creation
    const navItems = [
        { href: 'index.html#home', text: 'INICIO' },
        { href: 'nosotros.html', text: 'NUESTRA HISTORIA' },
        { href: 'productos.html', text: 'MATERIAL' },
        { href: 'media.html', text: 'GALERÍA' }
    ];
    
    navItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        const a = document.createElement('a');
        a.className = 'nav-link';
        a.href = item.href;
        a.textContent = item.text;
        li.appendChild(a);
        navList.appendChild(li);
    });
    
    // Social media links - secure creation
    const socialLi = document.createElement('li');
    socialLi.className = 'nav-item';
    const socialDiv = document.createElement('div');
    socialDiv.className = 'social';
    
    const socialLinks = [
        { href: 'https://www.instagram.com/ps_svqtriana/', class: 'fa fa-instagram', label: 'Seguir en Instagram' },
        { href: 'https://www.facebook.com/PS-SVQ-Triana-110014627020914', class: 'fa fa-facebook', label: 'Seguir en Facebook' },
        { href: 'https://twitter.com/ps_svqtriana', class: 'fa fa-twitter', label: 'Seguir en Twitter' }
    ];
    
    socialLinks.forEach(social => {
        const a = document.createElement('a');
        a.href = social.href;
        a.className = social.class;
        a.setAttribute('aria-label', social.label);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        socialDiv.appendChild(a);
    });
    
    socialLi.appendChild(socialDiv);
    navList.appendChild(socialLi);
    
    // Assemble the structure
    navContainer.appendChild(navList);
    navbarCollapse.appendChild(navContainer);
    nav.appendChild(brandLink);
    nav.appendChild(togglerButton);
    nav.appendChild(navbarCollapse);
    containerFluid.appendChild(nav);
    headerSection.appendChild(containerFluid);
    heroArea.appendChild(headerSection);
    
    document.body.prepend(heroArea);
    
    // Initialize Bootstrap collapse manually for the dynamically added content
    setTimeout(function() {
        const toggleButton = document.querySelector('.navbar-toggler');
        const collapseTarget = document.querySelector('#navbarSupportedContent');
        
        if (toggleButton && collapseTarget) {
            toggleButton.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                
                if (isExpanded) {
                    collapseTarget.classList.remove('show');
                    this.setAttribute('aria-expanded', 'false');
                } else {
                    collapseTarget.classList.add('show');
                    this.setAttribute('aria-expanded', 'true');
                }
            });
        }
        
        // Also try Bootstrap's native method if available
        if (typeof $ !== 'undefined' && $.fn.collapse) {
            $('#navbarSupportedContent').collapse({
                toggle: false
            });
        }
    }, 100);
});