import type { ImageMetadata } from 'astro';
import video1 from '../assets/videos/video1.jpg';
import video2 from '../assets/videos/video2.jpg';
import video3 from '../assets/videos/video3.jpg';
import video4 from '../assets/videos/video4.jpg';
import video5 from '../assets/videos/video5.jpg';
import video6 from '../assets/videos/video6.jpg';

export type Video = {
  id: string;
  titulo: string;
  temporada: string;
  youtubeId: string;
  miniatura: ImageMetadata;
  publicado: string;
  destacado?: boolean;
};

export const videos: Video[] = [
  {
    id: 'el-sevilla-siempre-sera-su-gente',
    titulo: 'El Sevilla siempre será su gente',
    temporada: 'Temporada 26/27',
    youtubeId: 'Nz1E1GyG1EA',
    miniatura: video6,
    publicado: '2026',
    destacado: true,
  },
  {
    id: 'cita-con-nuestra-herencia',
    titulo: 'Cita con nuestra herencia',
    temporada: 'Temporada 21/22',
    youtubeId: 'NZbk3zVNMaY',
    miniatura: video5,
    publicado: '2021',
  },
  {
    id: 'la-brujula-de-mis-sentidos',
    titulo: 'La brújula de mis sentidos',
    temporada: 'Temporada 20/21',
    youtubeId: 'gyamGKXwkMc',
    miniatura: video4,
    publicado: '2020',
  },
  {
    id: 'desplazamientos',
    titulo: 'Desplazamientos',
    temporada: 'Temporada 19/20',
    youtubeId: 'BQ16EOFLZEM',
    miniatura: video3,
    publicado: '2019',
  },
  {
    id: 'ya-estamos-aqui',
    titulo: 'Ya estamos aquí',
    temporada: 'Temporada 19/20',
    youtubeId: '0v1XvikTbIo',
    miniatura: video1,
    publicado: '2019',
  },
  {
    id: 'i-pregon',
    titulo: 'I Pregón',
    temporada: 'Diciembre de 2019',
    youtubeId: 'C85CSoQkVy8',
    miniatura: video2,
    publicado: '2019',
  },
];

export const youtubeWatchUrl = (id: string) => `https://youtu.be/${id}`;
