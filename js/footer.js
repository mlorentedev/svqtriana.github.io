const footer = document.createElement('template');
footer.innerHTML = `
    <section class="container-fluid footer_section" id="contact">
    <div class="container">
    <h3 class="custom_heading_2">
        Contacto
    </h3>
    <div class="info_items">
        <a target="_blank" href="https://maps.google.com/?q=Seville">
        <div class="item ">
            <div class="img-box box-1">
            </div>
            <div class="detail-box">
            <p>
                Sevilla, España
            </p>
            </div>
        </div>
        </a>
        <a target="_blank"
        href="https://api.whatsapp.com/send?phone=+34645728609&amp;text=Hola,%20tengo%20una%20consulta%20a%20traves%20de%20la%20web.">
        <div class="item ">
            <div class="img-box box-2">
            </div>
            <div class="detail-box">
            <p>
                +34 645728609
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