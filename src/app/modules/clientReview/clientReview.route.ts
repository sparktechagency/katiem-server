import express from 'express'

import validateRequest from '../../middleware/validateRequest'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody'
import { ClientreviewController } from './clientReview.controller'
import { ClientreviewValidations } from './clientReview.validation'

const router = express.Router()

router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.GUEST, USER_ROLES.EMPLOYER, USER_ROLES.WORKER),
  ClientreviewController.getAllClientreviews,
)

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(ClientreviewValidations.create),
  ClientreviewController.createClientreview,
)

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(ClientreviewValidations.update),
  ClientreviewController.updateClientreview,
)

export const ClientreviewRoutes = router
