import cartel from '../assets/carteles/cartel-27.jpg';
import { cartelAlt, cartelOg, cartelOgSize } from './cartel';

export const temporada = {
  etiqueta: '26/27',
  etiquetaLarga: '2026/2027',
  cartel,
  cartelOg,
  cartelOgSize,
  cartelAlt,
  formularioUrl:
    'https://docs.google.com/forms/d/e/1FAIpQLSdJ7KOc7hi-vBmWrmMwsD1zKJmmoM0TmtUd1IQ3cx_eS69azA/viewform',
  precios: {
    renovacion: { base: 20, conCamiseta: 28 },
    nuevaAlta: { base: 25, conCamiseta: 35 },
  },
} as const;
