import express from 'express';
import {
  createPayment,
  getAllPayments,
  getPayment,
} from '../controllers/paymentController';
import { protect } from '../controllers/authController';
import { validate } from '../../middlewares/validate';
import { createPaymentSchema } from '../../validators/payment.schema';

const router = express.Router();

router
  .route('/')
  .get(protect, getAllPayments)
  .post(protect, validate(createPaymentSchema), createPayment);

router.route('/:id').get(protect, getPayment);

export default router;
