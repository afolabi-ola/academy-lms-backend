import { Router } from 'express';
import { searchAll } from '../controllers/searchController';
import { searchQuerySchema } from '../../validators/search.schema';
import { validate } from '../../middlewares/validate';
import { protect } from '../controllers/authController';

const router = Router();

router.get('/', protect, validate(searchQuerySchema), searchAll);

export default router;
