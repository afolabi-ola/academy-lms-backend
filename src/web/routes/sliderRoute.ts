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
  CreateSliderSchema,
  UpdateSliderSchema,
} from '../../validators/slider.schema';

const router = Router();

router
  .route('/')
  .get(getAllSliders)
  .post(
    validate(CreateSliderSchema),
    protect,
    restrictTo('ADMIN'),
    createSlider,
  );

router
  .route('/:id')
  .get(getSlider)
  .patch(
    validate(UpdateSliderSchema),
    protect,
    restrictTo('ADMIN'),
    updateSlider,
  )
  .delete(protect, restrictTo('ADMIN'), deleteSlider);

export default router;
