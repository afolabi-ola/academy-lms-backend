import express from 'express';
import {
  deleteUser,
  getAllUsers,
  login,
  protect,
  register,
  restrictTo,
  updateUser,
  getUser,
  updateProfile,
  getProfile,
  changePassword,
  logout,
  checkIsDemoUser,
} from '../controllers/authController';
import { validate } from '../../middlewares/validate';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
  updateUserSchema,
} from '../../validators/auth.schema';

const router = express.Router();

router
  .route('/register')
  .post(
    validate(registerSchema),
    protect,
    restrictTo('SUPER_ADMIN', 'ADMIN'),
    register,
  );
router.route('/login').post(validate(loginSchema), login);
router.post('/logout', logout);
router
  .route('/profile')
  .get(protect, getProfile)
  .patch(
    protect,
    checkIsDemoUser,
    validate(updateProfileSchema),
    updateProfile,
  );

router
  .route('/update-password')
  .patch(
    protect,
    checkIsDemoUser,
    validate(changePasswordSchema),
    changePassword,
  );

router.route('/').get(protect, restrictTo('SUPER_ADMIN', 'ADMIN'), getAllUsers);
router
  .route('/:id')
  .get(protect, restrictTo('SUPER_ADMIN', 'ADMIN'), getUser)
  .patch(
    protect,
    restrictTo('SUPER_ADMIN', 'ADMIN'),
    validate(updateUserSchema),
    updateUser,
  )
  .delete(protect, restrictTo('SUPER_ADMIN', 'ADMIN'), deleteUser);
export default router;