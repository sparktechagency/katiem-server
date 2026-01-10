import express from 'express';
import { BookingController } from './booking.controller';
import { BookingValidations } from './booking.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';


const router = express.Router();

router.get(
  '/',
  auth(

    USER_ROLES.WORKER, USER_ROLES.EMPLOYER
  ),
  BookingController.getAllBookings
);

router.patch(
  '/:id',
  auth(
    USER_ROLES.WORKER
  ),

  validateRequest(BookingValidations.update),
  BookingController.updateBooking
);

router.post(
  '/:requestedTo',
  auth(

    USER_ROLES.EMPLOYER
  ),
  validateRequest(BookingValidations.create),
  BookingController.createBooking
);

router.get(
  '/:id',
  auth(

    USER_ROLES.WORKER, USER_ROLES.EMPLOYER, USER_ROLES.WORKER
  ),
  BookingController.getSingleBooking
);





router.delete(
  '/:id',
  auth(
    USER_ROLES.EMPLOYER
  ),
  BookingController.deleteBooking
);

export const BookingRoutes = router;