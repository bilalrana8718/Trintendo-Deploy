import { Router } from 'express';
import { body } from "express-validator";
import * as ownerController from '../controllers/owner.controller.js';
import { authOwner } from '../middlewares/ownerAuth.middleware.js';

const router = Router();

router.post(
    '/register',
    [
      body('email').trim().isEmail().withMessage('Please enter a valid email'),
      body('password').trim().isLength({ min: 3 }).withMessage('Please enter a valid password'),
    ],
    ownerController.createOwnerController
);

router.post(
    '/login',
    [
      body('email').trim().isEmail().withMessage('Please enter a valid email'),
      body('password').trim().isLength({ min: 3 }).withMessage('Please enter a valid password'),
    ],
    ownerController.loginOwnerController);
  
router.get('/profile', authOwner, ownerController.getOwnerProfileController);
  
router.get('/logout', authOwner, ownerController.logoutOwnerController);

export default router;