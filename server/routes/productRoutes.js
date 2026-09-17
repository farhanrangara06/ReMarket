import express from 'express';
import {
  getProducts,
  getMyProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  markAsSold,
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { productImageUpload } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/security.js';
import { processProductUploads } from '../middleware/processUpload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/mine', protect, getMyProducts);
router.get('/:id', getProduct);
router.post('/', protect, uploadLimiter, productImageUpload, processProductUploads, createProduct);
router.put('/:id', protect, uploadLimiter, productImageUpload, processProductUploads, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.patch('/:id/sold', protect, markAsSold);

export default router;
