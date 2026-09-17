import path from 'path';
import { fileURLToPath } from 'url';
import { cloudinary, isCloudinaryEnabled } from '../config/cloudinary.js';
import { getImageUrl, deleteFile, saveBufferToDisk } from '../config/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsDir = path.join(__dirname, '..', 'uploads', 'products');
const profilesDir = path.join(__dirname, '..', 'uploads', 'profiles');

const FOLDERS = {
  products: 'remarket/products',
  profiles: 'remarket/profiles',
};

const uploadBufferToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });

export const uploadFiles = async (files, type = 'products') => {
  if (!files?.length) return [];

  if (isCloudinaryEnabled()) {
    const folder = FOLDERS[type] || FOLDERS.products;
    const urls = await Promise.all(files.map((file) => uploadBufferToCloudinary(file, folder)));
    return urls;
  }

  const subfolder = type === 'profiles' ? 'profiles' : 'products';
  return files.map((file) => saveBufferToDisk(file, subfolder));
};

export const uploadSingleFile = async (file, type = 'profiles') => {
  if (!file) return null;

  if (isCloudinaryEnabled()) {
    const folder = FOLDERS[type] || FOLDERS.profiles;
    return uploadBufferToCloudinary(file, folder);
  }

  const subfolder = type === 'profiles' ? 'profiles' : 'products';
  return saveBufferToDisk(file, subfolder);
};

export const resolveImageUrl = (value, subfolder = 'products') => {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/uploads')) return value;
  return getImageUrl(value, subfolder);
};

export const imagesMatch = (stored, reference) => {
  if (!stored || !reference) return false;
  if (stored === reference) return true;

  const normalize = (img) => {
    const withoutQuery = img.split('?')[0];
    return withoutQuery.split('/').pop();
  };

  return normalize(stored) === normalize(reference);
};

const extractCloudinaryPublicId = (url) => {
  try {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    let pathAfterUpload = url.slice(uploadIndex + '/upload/'.length);
    // Remove version prefix v1234567890/
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
    // Remove extension
    const lastDot = pathAfterUpload.lastIndexOf('.');
    if (lastDot > -1) {
      pathAfterUpload = pathAfterUpload.slice(0, lastDot);
    }
    return pathAfterUpload;
  } catch {
    return null;
  }
};

const deleteCloudinaryImage = async (url) => {
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

const deleteLocalImage = (value, subfolder) => {
  const filename = value.includes('/') ? path.basename(value.split('?')[0]) : value;
  const dir = subfolder === 'profiles' ? profilesDir : productsDir;
  deleteFile(path.join(dir, filename));
};

export const deleteImage = async (value, subfolder = 'products') => {
  if (!value) return;

  if (value.startsWith('http://') || value.startsWith('https://')) {
    if (isCloudinaryEnabled() && value.includes('cloudinary.com')) {
      await deleteCloudinaryImage(value);
    }
    return;
  }

  deleteLocalImage(value, subfolder);
};

export const deleteImages = async (images, subfolder = 'products') => {
  if (!images?.length) return;
  await Promise.all(images.map((img) => deleteImage(img, subfolder)));
};
