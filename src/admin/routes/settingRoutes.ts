import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController';
import { protect, restrictTo } from '../controllers/authController';
import uploadSingleImage, {
  ImageResource,
  uploadSettingsImages,
} from '../../middlewares/uploadImage';
import { updateSettingsSchema } from '../../validators/setting.schema';
import { validate } from '../../middlewares/validate';

const router = Router();

router.get('/', getSettings);
router.patch(
  '/',
  protect,
  restrictTo('ADMIN'),
  uploadSettingsImages(),
  validate(updateSettingsSchema),
  updateSettings,
);

export default router;
