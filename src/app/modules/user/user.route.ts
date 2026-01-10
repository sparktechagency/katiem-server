import express from 'express'
import { UserController } from './user.controller'
import { UserValidations } from './user.validation'
import validateRequest from '../../middleware/validateRequest'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import {
  fileAndBodyProcessorUsingDiskStorage,
} from '../../middleware/processReqBody'

const router = express.Router()


router.patch(
  '/profile',
  auth(
    USER_ROLES.WORKER,
    USER_ROLES.ADMIN,
    USER_ROLES.EMPLOYER,
  ),
  // fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(UserValidations.updateUserZodSchema),
  UserController.updateProfile,
)

router.post(
  '/upload-images',
  auth(
    USER_ROLES.WORKER,
    USER_ROLES.ADMIN,
    USER_ROLES.EMPLOYER,
    // USER_ROLES.GUEST,
  ),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(UserValidations.uploadImagesZodSchema),
  UserController.uploadImages,
)

router.get(
  '/workers',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.EMPLOYER,
    USER_ROLES.GUEST,
  ),
  // validateRequest(UserValidations.getWorkersZodSchema),
  UserController.getWorkers,
)

router.get(
  '/profile',
  auth(
    USER_ROLES.WORKER,
    USER_ROLES.ADMIN,
    USER_ROLES.EMPLOYER,
    USER_ROLES.GUEST,
  ),
  UserController.getUserProfile,
)

router.get(
  '/workers/:workerId',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.EMPLOYER,
    USER_ROLES.GUEST,
  ),
  UserController.getSingleWorker,
)



export const UserRoutes = router
