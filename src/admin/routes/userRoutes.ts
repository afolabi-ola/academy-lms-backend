import express from 'express';
import {
  login,
  protect,
  register,
  restrictTo,
} from '../controllers/authController';
import { validate } from '../../middlewares/validate';
import { loginSchema, registerSchema } from '../../validators/auth.schema';

const router = express.Router();

router.route('/register').post(
  validate(registerSchema),
  // protect,
  // restrictTo('ADMIN'),
  register,
);
router.route('/login').post(validate(loginSchema), login);

export default router;
