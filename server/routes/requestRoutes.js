import express from 'express';
import {
  createRequest,
  getSentRequests,
  getReceivedRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  completeRequest,
} from '../controllers/requestController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createRequest);
router.get('/sent', getSentRequests);
router.get('/received', getReceivedRequests);
router.patch('/:id/accept', acceptRequest);
router.patch('/:id/reject', rejectRequest);
router.patch('/:id/cancel', cancelRequest);
router.patch('/:id/complete', completeRequest);

export default router;
