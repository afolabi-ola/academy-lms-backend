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
import uploadSingleImage, {
  ImageResource,
} from '../../middlewares/uploadImage';

const router = express.Router();

router
  .route('/')
  .get(protect, restrictTo('ADMIN', 'SUB_ADMIN'), getAllStudents)
  .post(
    protect,
    restrictTo('ADMIN', 'SUB_ADMIN'),
    ...uploadSingleImage('photo', ImageResource.STUDENT),

    validate(createStudentSchema),
    createStudent,
  );

router
  .route('/:id')
  .get(protect, restrictTo('ADMIN', 'SUB_ADMIN'), getStudent)
  .patch(
    protect,
    restrictTo('ADMIN', 'SUB_ADMIN'),
    ...uploadSingleImage('photo', ImageResource.STUDENT),
    validate(updateStudentSchema),
    updateStudent,
  )
  .delete(protect, restrictTo('ADMIN', 'SUB_ADMIN'), deleteStudent);

export default router;
