import { validate } from './../../middlewares/validate';
import express from 'express';
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourse,
  updateCourse,
} from '../controllers/courseController';
import { protect, restrictTo } from '../controllers/authController';
import {
  CreateCourseSchema,
  UpdateCourseSchema,
} from '../../validators/course.schema';

const router = express.Router();

router
  .route('/')
  .get(getAllCourses)
  .post(validate(CreateCourseSchema), protect, createCourse);

router
  .route('/:id')
  .get(getCourse)
  .patch(validate(UpdateCourseSchema), protect, updateCourse)
  .delete(protect, restrictTo('ADMIN'), deleteCourse);

export default router;
