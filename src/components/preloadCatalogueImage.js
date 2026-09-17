import images from '../data/catalogue-images.json';
const decoded = new Map();
export function preloadCatalogueImage(key, mountedImage) {
  const src = images[key]?.src;
  if (!src) return Promise.reject(new Error('Unknown catalogue image'));
  if (!decoded.has(src)) {
    const image = mountedImage || new Image();
    if (!mountedImage) image.src = src;
    const ready = image.decode().catch(error => { decoded.delete(src); throw error; });
    decoded.set(src, ready);
  }
  return decoded.get(src);
}
