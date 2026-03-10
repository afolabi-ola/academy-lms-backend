import { validate } from './../../middlewares/validate';
import { Router } from 'express';
import { protect } from '../controllers/authController';
import {
  createEnrollment,
  getAllEnrollments,
  getEnrollment,
} from '../controllers/enrollmentController';
import { createEnrollmentSchema } from '../../validators/enrollment.schema';

const router = Router();

router
  .route('/')
  .get(protect, getAllEnrollments)
  .post(validate(createEnrollmentSchema), protect, createEnrollment);
router.route('/:id').get(protect, getEnrollment);

export default router;
