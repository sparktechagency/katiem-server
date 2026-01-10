import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import { NotificationController } from './notifications.controller'

const router = express.Router()
router.get(
  '/',
  auth(USER_ROLES.WORKER, USER_ROLES.EMPLOYER, USER_ROLES.ADMIN),
  NotificationController.getMyNotifications,
)
router.get('/all', auth(USER_ROLES.WORKER, USER_ROLES.EMPLOYER, USER_ROLES.ADMIN), NotificationController.updateAllNotifications)
router.get('/:id', auth(USER_ROLES.WORKER, USER_ROLES.EMPLOYER, USER_ROLES.ADMIN), NotificationController.updateNotification)
export const NotificationRoutes = router
