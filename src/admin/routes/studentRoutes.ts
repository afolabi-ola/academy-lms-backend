import express from 'express';
import {
  createStudent,
  deleteStudent,
  getAllStudents,
  getStudent,
  updateStudent,
} from '../controllers/studentController';
import { protect, restrictTo } from '../controllers/authController';
import { validate } from '../../middlewares/validate';
import {
  createStudentSchema,
  updateStudentSchema,
} from '../../validators/student.schema';

const router = express.Router();

router
  .route('/')
  .get(protect, restrictTo('ADMIN', 'SUB_ADMIN'), getAllStudents)
  .post(
    validate(createStudentSchema),
    protect,
    restrictTo('ADMIN', 'SUB_ADMIN'),
    createStudent,
  );

router
  .route('/:id')
  .get(protect, restrictTo('ADMIN', 'SUB_ADMIN'), getStudent)
  .patch(
    validate(updateStudentSchema),
    protect,
    restrictTo('ADMIN', 'SUB_ADMIN'),
    updateStudent,
  )
  .delete(protect, restrictTo('ADMIN', 'SUB_ADMIN'), deleteStudent);

export default router;
