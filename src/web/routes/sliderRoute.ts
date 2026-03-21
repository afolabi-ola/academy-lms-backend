import { validate } from './../../middlewares/validate';

import { protect, restrictTo } from './../../admin/controllers/authController';
import { Router } from 'express';
import {
  createSlider,
  deleteSlider,
  getAllSliders,
  getSlider,
  updateSlider,
} from '../controllers/sliderController';
import {
  createSliderSchema,
  updateSliderSchema,
} from '../../validators/slider.schema';
import uploadSingleImage, {
  ImageResource,
} from '../../middlewares/uploadImage';

const router = Router();

router
  .route('/')
  .get(getAllSliders)
  .post(
    protect,
    restrictTo('ADMIN'),
    ...uploadSingleImage('image', ImageResource.SLIDER),
    validate(createSliderSchema),
    createSlider,
  );

router
  .route('/:id')
  .get(getSlider)
  .patch(
    protect,
    restrictTo('ADMIN'),
    ...uploadSingleImage('image', ImageResource.SLIDER),
    validate(updateSliderSchema),
    updateSlider,
  )
  .delete(protect, restrictTo('ADMIN'), deleteSlider);

export default router;
