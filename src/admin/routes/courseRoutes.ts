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
  createCourseSchema,
  updateCourseSchema,
} from '../../validators/course.schema';
import uploadSingleImage, {
  ImageResource,
} from '../../middlewares/uploadImage';

const router = express.Router();

router
  .route('/')
  .get(getAllCourses)
  .post(
    protect,
    restrictTo('ADMIN'),
    ...uploadSingleImage('image', ImageResource.COURSE),
    validate(createCourseSchema),
    createCourse,
  );

router
  .route('/:id')
  .get(getCourse)
  .patch(
    protect,
    restrictTo('ADMIN'),
    ...uploadSingleImage('image', ImageResource.COURSE),
    validate(updateCourseSchema),
    updateCourse,
  )
  .delete(protect, restrictTo('ADMIN'), deleteCourse);

export default router;
