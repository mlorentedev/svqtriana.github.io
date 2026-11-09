import type { ImageMetadata } from 'astro';
import bufanda from '../assets/productos/bufanda.jpg';
import bandera from '../assets/productos/bandera.jpeg';
import pulsera2 from '../assets/productos/pulsera2.jpg';
import pulsera from '../assets/productos/pulsera.jpg';
import pegatinaEscudo from '../assets/productos/pegatina_escudo.jpg';
import pegatinaOrilla from '../assets/productos/pegatina_orilla.jpg';
import pegatinaSpencer from '../assets/productos/pegatina_spencer.jpg';
import pegatinaPancarta from '../assets/productos/pegatina_pancarta.jpg';

export type ProductImage = { src: ImageMetadata; alt: string };

export type ProductPrice =
  | { tipo: 'doble'; socio: number; noSocio: number }
  | { tipo: 'unico'; valor: number };

export type Product = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: ProductPrice;
  lote?: string;
  imagenes: ProductImage[];
};

export const productos: Product[] = [
  {
    id: 'bufanda',
    nombre: 'Bufanda oficial roja y negra',
    descripcion: 'Bufanda oficial roja y negra de la peña sevillista',
    precio: { tipo: 'doble', socio: 10, noSocio: 12 },
    imagenes: [{ src: bufanda, alt: 'Bufanda oficial roja y negra' }],
  },
  {
    id: 'bandera',
    nombre: 'Bandera oficial',
    descripcion: 'Bandera oficial de la peña sevillista',
    precio: { tipo: 'doble', socio: 10, noSocio: 12 },
    imagenes: [{ src: bandera, alt: 'Bandera oficial de PS SVQ Triana' }],
  },
  {
    id: 'pulsera',
    nombre: 'Pulsera oficial',
    precio: { tipo: 'unico', valor: 1 },
    imagenes: [
      { src: pulsera2, alt: 'Pulsera oficial de la peña' },
      { src: pulsera, alt: 'Pulsera oficial vista alternativa' },
    ],
  },
  {
    id: 'pegatinas',
    nombre: 'Pegatinas',
    descripcion: 'Lote de 6 pegatinas de la peña sevillista',
    precio: { tipo: 'unico', valor: 1 },
    lote: '6 unidades',
    imagenes: [
      { src: pegatinaEscudo, alt: 'Pegatina del escudo' },
      { src: pegatinaOrilla, alt: 'Pegatina de la orilla del río' },
      { src: pegatinaSpencer, alt: 'Pegatina de Spencer' },
      { src: pegatinaPancarta, alt: 'Pegatina de pancarta' },
    ],
  },
];
