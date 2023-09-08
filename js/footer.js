const footer = document.createElement('template');
footer.innerHTML = `
    <section class="container-fluid footer_section" id="contact">
    <div class="container">
    <h3 class="custom_heading_2">
        Contacto
    </h3>
    <div class="info_items">
        <a target="_blank" href="https://twitter.com/ps_svqtriana1">
        <div class="item ">
            <div class="img-box box-1">
            </div>
            <div class="detail-box">
            <p>
                @PS_SVQTRIANA1
            </p>
            </div>
        </div>
        </a>
        <a target="_blank"
        href="https://www.instagram.com/ps_svqtriana/">
        <div class="item ">
            <div class="img-box box-2">
            </div>
            <div class="detail-box">
            <p>
                @PS_SVQTRIANA
            </p>
            </div>
        </div>
        </a>
        <a href="mailto:svqtriana@gmail.com?subject=[WEB]">
        <div class="item ">
            <div class="img-box box-3">
            </div>
            <div class="detail-box">
            <p>
                svqtriana@gmail.com
            </p>
            </div>
        </div>
        </a>
    </div>
    </div>
    <p>
    © PS SVQ Triana - Todos los derechos reservados
    </p>
    </section>
    `
document.body.appendChild(footer.content);