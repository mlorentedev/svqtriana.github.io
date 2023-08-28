const header = document.createElement('template');
header.innerHTML = `
    <div class="hero_area">
    <header class="header_section" id="home">
        <div class="container-fluid">
        <nav class="navbar navbar-expand-lg custom_nav-container pt-3">
            <a class="navbar-brand" href="index.html">
            <img src="images/logo_192.png" alt="" class="" />
            </a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <div class="d-flex ml-auto flex-column flex-lg-row align-items-center">
                <ul class="navbar-nav  ">
                <li class="nav-item">
                    <a class="nav-link" href="index.html#home">INICIO</a>
                </li>                
                <li class="nav-item">
                    <a class="nav-link" href="nosotros.html">NUESTRA HISTORIA</a>
                </li>  
                <li class="nav-item">
                    <a class="nav-link" href="encuentro.html">DÓNDE NOS VEMOS</a>
                </li>  
                <li class="nav-item">
                    <a class="nav-link" href="productos.html">MATERIAL</a>
                </li>
                <li class="nav-item">
                <a class="nav-link" href="media.html">GALERÍA</a>
                </li>
                <li class="nav-item">
                    <div class="social">
                    <a href="https://www.instagram.com/ps_svqtriana/" class="fa fa-instagram"></a>
                    <a href="https://www.facebook.com/PS-SVQ-Triana-110014627020914" class="fa fa-facebook"></a>
                    <a href="https://twitter.com/ps_svqtriana" class="fa fa-twitter"></a>
                    </div>
                </li>
                </ul>
            </div>
            </div>
        </nav>
        </div>
    </header>
    </div>
    `
document.body.appendChild(header.content);