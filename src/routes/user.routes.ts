import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import {authenticate} from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest.middlewire';
import { createUserSchema } from '../validators/user.validator';

const router = Router();

router.post('/', validateRequest(createUserSchema), userController.createUser);
router.get('/:id', authenticate, userController.getUser);
router.put('/:id', authenticate, userController.updateUserProfile);
router.get('', authenticate, userController.getUsersPaginated);

export default router;
