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
import { CreateFaqSchema, UpdateFaqSchema } from '../../validators/faq.schema';

const router = Router();

router
  .route('/')
  .get(getAllFaqs)
  .post(validate(CreateFaqSchema), protect, restrictTo('ADMIN'), createFaq);

router
  .route('/:id')
  .get(getFaq)
  .patch(validate(UpdateFaqSchema), protect, restrictTo('ADMIN'), updateFaq)
  .delete(protect, deleteFaq);

export default router;
