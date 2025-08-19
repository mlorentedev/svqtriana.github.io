// Secure footer creation without innerHTML injection
const footerSection = document.createElement('section');
footerSection.className = 'container-fluid footer_section';
footerSection.id = 'contact';
footerSection.style.padding = '8px 15px';

const container = document.createElement('div');
container.className = 'container';

const heading = document.createElement('h3');
heading.className = 'custom_heading_2';
heading.textContent = 'Contacto';
heading.style.marginBottom = '8px';

const infoItems = document.createElement('div');
infoItems.className = 'info_items';

// Contact items data
const contactData = [
    {
        href: 'https://twitter.com/ps_svqtriana1',
        label: 'Contactar por Twitter',
        boxClass: 'box-1',
        iconLabel: 'Icono de Twitter',
        text: '@PS_SVQTRIANA1'
    },
    {
        href: 'https://www.instagram.com/ps_svqtriana/',
        label: 'Contactar por Instagram',
        boxClass: 'box-2',
        iconLabel: 'Icono de Instagram',
        text: '@PS_SVQTRIANA'
    },
    {
        href: 'mailto:svqtriana@gmail.com?subject=[WEB]',
        label: 'Enviar email',
        boxClass: 'box-3',
        iconLabel: 'Icono de email',
        text: 'svqtriana@gmail.com'
    }
];

// Create contact items securely
contactData.forEach(contact => {
    const link = document.createElement('a');
    if (contact.href.startsWith('https://')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    }
    link.href = contact.href;
    link.setAttribute('aria-label', contact.label);
    
    const item = document.createElement('div');
    item.className = 'item';
    
    const imgBox = document.createElement('div');
    imgBox.className = `img-box ${contact.boxClass}`;
    imgBox.setAttribute('role', 'img');
    imgBox.setAttribute('aria-label', contact.iconLabel);
    
    const detailBox = document.createElement('div');
    detailBox.className = 'detail-box';
    
    const p = document.createElement('p');
    p.textContent = contact.text;
    
    detailBox.appendChild(p);
    item.appendChild(imgBox);
    item.appendChild(detailBox);
    link.appendChild(item);
    infoItems.appendChild(link);
});

const copyright = document.createElement('p');
const currentYear = new Date().getFullYear();
copyright.innerHTML = `© ${currentYear} PS SVQ Triana - Todos los derechos reservados<br>
<small style="font-size: 0.8em; opacity: 0.7;">Desarrollado por <a href="https://github.com/mlorentedev" target="_blank" rel="noopener noreferrer" style="text-decoration: none; font-weight: bold; transition: color 0.3s ease;" onmouseover="this.style.color='#df0606'" onmouseout="this.style.color='#fbfcfd'">@mlorentedev</a></small>`;
copyright.style.marginTop = '8px';
copyright.style.marginBottom = '0';

container.appendChild(heading);
container.appendChild(infoItems);
footerSection.appendChild(container);
footerSection.appendChild(copyright);

document.body.appendChild(footerSection);