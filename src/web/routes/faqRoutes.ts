import { validate } from './../../middlewares/validate';
import { protect, restrictTo } from './../../admin/controllers/authController';
import { Router } from 'express';
import {
  createFaq,
  getAllFaqs,
  getFaq,
  updateFaq,
  deleteFaq,
} from '../controllers/faqController';
import { createFaqSchema, updateFaqSchema } from '../../validators/faq.schema';

const router = Router();

router
  .route('/')
  .get(getAllFaqs)
  .post(validate(createFaqSchema), protect, restrictTo('ADMIN'), createFaq);

router
  .route('/:id')
  .get(getFaq)
  .patch(validate(updateFaqSchema), protect, restrictTo('ADMIN'), updateFaq)
  .delete(protect, restrictTo('ADMIN'), deleteFaq);

export default router;
