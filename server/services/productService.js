import { resolveImageUrl, deleteImages } from './imageService.js';

const formatSeller = (seller) => {
  if (!seller || typeof seller !== 'object') return seller;
  const s = seller.toObject ? seller.toObject() : { ...seller };
  s.profileImage = resolveImageUrl(s.profileImage, 'profiles');
  return s;
};

export const formatProduct = (product) => {
  const p = product.toObject ? product.toObject() : { ...product };

  if (p.images?.length) {
    p.images = p.images.map((img) => resolveImageUrl(img, 'products'));
  }

  if (p.seller) {
    p.seller = formatSeller(p.seller);
  }

  return p;
};

export const formatProducts = (products) => products.map(formatProduct);

export const deleteProductImages = async (images) => {
  await deleteImages(images, 'products');
};
