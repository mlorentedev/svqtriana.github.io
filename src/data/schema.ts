import { site, socials } from './site';
import { temporada } from './temporada';
import { productos } from './productos';
import { videos } from './videos';

const absolute = (src: string) => (src.startsWith('http') ? src : `${site.url}${src}`);

export const sportsClubSchema = {
  '@context': 'https://schema.org',
  '@type': 'SportsClub',
  name: 'PS SVQ Triana - Peña Sevillista',
  alternateName: 'SVQ Triana',
  description:
    'Peña sevillista fundada en 2019 en el barrio de Triana, Sevilla. Somos una comunidad de aficionados del Sevilla FC unidos por la pasión sevillista.',
  url: site.url,
  logo: `${site.url}/images/webp/logo_192.webp`,
  image: `${site.url}${temporada.cartelOg}`,
  foundingDate: site.foundingDate,
  foundingLocation: { '@type': 'Place', name: site.foundingPlace },
  location: {
    '@type': 'Place',
    name: 'Triana, Sevilla',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sevilla',
      addressRegion: 'Andalucía',
      addressCountry: 'ES',
    },
  },
  sameAs: [
    socials.instagram.url,
    socials.facebook.url,
    socials.x.url,
    socials.tiktok.url,
    socials.youtube.url,
  ],
  sport: 'Football',
  memberOf: { '@type': 'SportsTeam', name: 'Sevilla FC' },
  offers: [
    {
      '@type': 'Offer',
      name: 'Membresía de Peña',
      description: 'Hazte socio de la peña sevillista',
      url: site.formUrl,
    },
  ],
};

export const productsSchema = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'Material PS SVQ Triana',
  description: 'Material oficial de la peña sevillista PS SVQ Triana',
  url: `${site.url}/productos`,
  parentOrganization: { '@type': 'SportsClub', name: 'PS SVQ Triana' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Material Sevillista',
    itemListElement: productos.map((producto) => {
      const itemOffered = {
        '@type': 'Product',
        name: producto.nombre,
        ...(producto.descripcion ? { description: producto.descripcion } : {}),
        image: absolute(producto.imagenes[0].src.src),
      };

      if (producto.precio.tipo === 'doble') {
        return {
          '@type': 'AggregateOffer',
          lowPrice: String(producto.precio.socio),
          highPrice: String(producto.precio.noSocio),
          priceCurrency: 'EUR',
          itemOffered,
        };
      }

      return {
        '@type': 'Offer',
        price: String(producto.precio.valor),
        priceCurrency: 'EUR',
        itemOffered,
      };
    }),
  },
};

export const videosSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Galería de vídeos de PS SVQ Triana',
  itemListElement: videos.map((video, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'VideoObject',
      name: `${video.titulo} - ${video.temporada}`,
      description: `Vídeo de la peña sevillista PS SVQ Triana: ${video.titulo} (${video.temporada}).`,
      thumbnailUrl: absolute(video.miniatura.src),
      uploadDate: video.publicado,
      contentUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
      embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
      publisher: {
        '@type': 'Organization',
        name: 'PS SVQ Triana',
        url: site.url,
      },
    },
  })),
};
