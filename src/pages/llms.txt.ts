import type { APIRoute } from 'astro';
import { site, socials } from '../data/site';
import { temporada } from '../data/temporada';
import { productos } from '../data/productos';

const precio = (producto: (typeof productos)[number]) => {
  if (producto.precio.tipo === 'doble') {
    return `${producto.precio.socio} € para socios y ${producto.precio.noSocio} € para no socios`;
  }
  return `${producto.precio.valor} €`;
};

export const GET: APIRoute = () => {
  const material = productos
    .map((producto) => `- ${producto.nombre}: ${precio(producto)}${producto.lote ? ` (${producto.lote})` : ''}.`)
    .join('\n');

  const body = `# ${site.name}

> Peña sevillista fundada el 27 de julio de 2019 en el barrio de Triana, Sevilla.
> Comunidad de aficionados del Sevilla FC. Web oficial: ${site.url}

## Datos

- Nombre completo: ${site.legalName} (${site.name})
- Fundación: 27 de julio de 2019, Triana, Sevilla, España
- Club: Sevilla FC
- Contacto: ${site.email}
- Instagram: ${socials.instagram.url}
- X/Twitter: ${socials.x.url}
- Facebook: ${socials.facebook.url}
- YouTube: ${socials.youtube.url}

## Temporada ${temporada.etiqueta}

Renovación de socio: ${temporada.precios.renovacion.base} € (${temporada.precios.renovacion.conCamiseta} € con camiseta).
Nueva alta: ${temporada.precios.nuevaAlta.base} € (${temporada.precios.nuevaAlta.conCamiseta} € con camiseta).
Alta y renovación por formulario: ${site.formUrl}

## Material

${material}

## Preguntas frecuentes

- ¿Qué es PS SVQ Triana? Una peña sevillista del barrio de Triana, en Sevilla, fundada el 27 de julio de 2019. Reúne a aficionados del Sevilla FC.
- ¿De qué equipo es? Del Sevilla FC.
- ¿Dónde está? En Triana, Sevilla (España).
- ¿Cómo me hago socio? Rellenando el formulario de alta: ${site.formUrl}
- ¿Cuánto cuesta? Temporada ${temporada.etiquetaLarga}: nueva alta ${temporada.precios.nuevaAlta.base} € (${temporada.precios.nuevaAlta.conCamiseta} € con camiseta); renovación ${temporada.precios.renovacion.base} € (${temporada.precios.renovacion.conCamiseta} € con camiseta).
- ¿Qué material vende? Bufanda, bandera, pulsera y pegatinas; el precio de cada uno está en el apartado Material.
- ¿Cómo se contacta? Por correo en ${site.email} o por redes sociales.
- ¿La web recoge datos personales? No. Es estática, sin backend ni cookies de analítica; el alta se gestiona en un formulario de Google externo.

## Páginas

- [Inicio](${site.url}/): temporada en curso y alta de socios.
- [Nuestra historia](${site.url}/nosotros): cómo nació la peña en 2019, el spot 19/20 que se viralizó, los primeros desplazamientos y el sorteo solidario para el Comedor Social de Triana.
- [Material](${site.url}/productos): bandera, bufanda, pulsera y pegatinas, con precio de socio y de no socio.
- [Galería](${site.url}/media): spots de cada temporada, el I Pregón de 2019 y vídeos de desplazamientos.

## Notas

Web estática, sin backend ni recogida de datos personales. El alta de socios se
gestiona mediante un formulario de Google externo.
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
