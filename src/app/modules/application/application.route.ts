import express from 'express';
import { ApplicationController } from './application.controller';
import { ApplicationValidations } from './application.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';


const router = express.Router();


router.get('/my-applications',
  auth(
    USER_ROLES.WORKER,
  ),
  ApplicationController.getApplicationListForWorker,
)


router.get('/my-applications-details',
  auth(
    USER_ROLES.WORKER,
  ),
  ApplicationController.getApplicationListForWorkerWithDetails,
)
router.get(
  '/:jobId',
  auth(
    USER_ROLES.WORKER,
    USER_ROLES.EMPLOYER,
  ),
  ApplicationController.getAllApplications
);

router.get(
  '/single/:id',
  auth(

    USER_ROLES.EMPLOYER,
    USER_ROLES.WORKER,

  ),
  ApplicationController.getSingleApplication
);

router.post(
  '/:jobId',
  auth(
    USER_ROLES.WORKER
  ),

  validateRequest(ApplicationValidations.create),
  ApplicationController.createApplication
);

router.patch(
  '/:id',
  auth(
    USER_ROLES.EMPLOYER,
  ),
  validateRequest(ApplicationValidations.update),
  ApplicationController.updateApplication
);

router.delete(
  '/:id',
  auth(

    USER_ROLES.WORKER
  ),
  ApplicationController.deleteApplication
);

export const ApplicationRoutes = router;