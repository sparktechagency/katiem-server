import express from 'express';
import { ChatController } from './chat.controller';
import { ChatValidations } from './chat.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';


const router = express.Router();

router.get(
  '/',
  auth(

    USER_ROLES.EMPLOYER, USER_ROLES.WORKER
  ),
  ChatController.getAllChats
);



// router.post(
//   '/:participant',
//   auth(

//     USER_ROLES.EMPLOYER,USER_ROLES.WORKER
//   ),

//   validateRequest(ChatValidations.create),
//   ChatController.createChat
// );



// router.delete(
//   '/:id',
//   auth(

//     USER_ROLES.ADMIN
//   ),
//   ChatController.deleteChat
// );

export const ChatRoutes = router;