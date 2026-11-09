import sharp from 'sharp';

// The bracelet master only exists as a 386 px WebP. It is converted to JPEG so
// the <Picture> fallback is not heavier than the original itself.
await sharp('src/assets/productos/pulsera.webp')
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('src/assets/productos/pulsera.jpg');

console.log('generated pulsera.jpg');
