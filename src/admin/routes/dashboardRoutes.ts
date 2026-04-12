import { protect } from './../controllers/authController';
import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { validate } from '../../middlewares/validate';
import { getDashboardSchema } from '../../validators/dashboard.schema';

const router = Router();

router.route('/').get(protect, validate(getDashboardSchema), getDashboard);

export default router;
