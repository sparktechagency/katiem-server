import express from 'express'
import { JobController } from './job.controller'
import { JobValidations } from './job.validation'
import validateRequest from '../../middleware/validateRequest'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody'

const router = express.Router()

router.get(
  '/',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.EMPLOYER,
    USER_ROLES.WORKER,
    USER_ROLES.GUEST,
  ),
  JobController.getAllJobs,
)

router.get(
  '/:id',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.EMPLOYER,
    USER_ROLES.WORKER,
    USER_ROLES.GUEST,
  ),
  JobController.getSingleJob,
)

router.post(
  '/',
  auth(USER_ROLES.EMPLOYER),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(JobValidations.create),
  JobController.createJob,
)
router.patch(
  '/:id',
  auth(USER_ROLES.EMPLOYER),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(JobValidations.update),
  JobController.updateJob,
)
router.post(
  '/:id/apply',
  auth(USER_ROLES.WORKER),
  validateRequest(JobValidations.apply),
  JobController.applyJob,
)

router.get(
  '/my-posted-jobs',
  auth(USER_ROLES.EMPLOYER),
  validateRequest(JobValidations.getMyPostedJobs),
  JobController.getMyPostedJobs,
)

router.post(
  '/boost/:id',
  auth(USER_ROLES.EMPLOYER),
  validateRequest(JobValidations.boost),
  JobController.boostAJob,
)

router.delete(
  '/:id',
  auth(USER_ROLES.EMPLOYER),
  validateRequest(JobValidations.delete),
  JobController.deleteJob,
)

export const JobRoutes = router
