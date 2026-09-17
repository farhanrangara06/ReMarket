import express from 'express';
import {
  getDashboard,
  getUsers,
  updateUserStatus,
  getAdminProducts,
  deleteAdminProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/products', getAdminProducts);
router.delete('/products/:id', deleteAdminProduct);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
