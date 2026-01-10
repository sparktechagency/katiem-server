import express from 'express';
import { ReviewController } from './review.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import validateRequest from '../../middleware/validateRequest';
import { ReviewValidations } from './review.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.EMPLOYER, USER_ROLES.WORKER), validateRequest(ReviewValidations.create), ReviewController.createReview);
router.get('/:id', auth(USER_ROLES.EMPLOYER, USER_ROLES.WORKER,USER_ROLES.GUEST), validateRequest(ReviewValidations.getReview), ReviewController.getAllReviews);
router.patch('/:id', auth(USER_ROLES.EMPLOYER, USER_ROLES.WORKER), validateRequest(ReviewValidations.update), ReviewController.updateReview);
router.delete('/:id', auth(USER_ROLES.EMPLOYER, USER_ROLES.WORKER), validateRequest(ReviewValidations.deleteReview), ReviewController.deleteReview);

export const ReviewRoutes = router;
