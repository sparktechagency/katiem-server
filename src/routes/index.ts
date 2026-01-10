import { UserRoutes } from '../app/modules/user/user.route'
import { AuthRoutes } from '../app/modules/auth/auth.route'
import express, { Router } from 'express'
import { NotificationRoutes } from '../app/modules/notifications/notifications.route'
import { PublicRoutes } from '../app/modules/public/public.route'
import { CategoryRoutes } from '../app/modules/category/category.route'
import { JobRoutes } from '../app/modules/job/job.route'
import { BookingRoutes } from '../app/modules/booking/booking.route'
import { ApplicationRoutes } from '../app/modules/application/application.route'
import { ChatRoutes } from '../app/modules/chat/chat.route'
import { MessageRoutes } from '../app/modules/message/message.route'
import { ContentRoutes } from '../app/modules/PageData/page.data.route'
import { ReviewRoutes } from '../app/modules/review/review.route'
import { DashboardRoutes } from '../app/modules/dashboard/dashboard.route'
import { PackageRoutes } from '../app/modules/package/package.route'
import { SubscriptionRoutes } from '../app/modules/subscription/subscription.route'
import { ClientreviewRoutes } from '../app/modules/clientReview/clientReview.route'

const router = express.Router()

const apiRoutes: { path: string; route: Router }[] = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/notifications', route: NotificationRoutes },
  { path: '/public', route: PublicRoutes },
  { path: '/category', route: CategoryRoutes },
  { path: '/job', route: JobRoutes },
  { path: '/booking', route: BookingRoutes },
  { path: '/application', route: ApplicationRoutes },
  { path: '/content', route: ContentRoutes },
  { path: '/chat', route: ChatRoutes },
  { path: '/review', route: ReviewRoutes },
  { path: '/dashboard', route: DashboardRoutes },
  { path: '/message', route: MessageRoutes },
  { path: '/package', route: PackageRoutes },
  { path: '/subscription', route: SubscriptionRoutes },
  { path: '/clientreview', route: ClientreviewRoutes },
]

apiRoutes.forEach(route => {
  router.use(route.path, route.route)
})

export default router
