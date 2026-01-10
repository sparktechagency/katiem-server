import express from 'express';
import { MessageController } from './message.controller';
import { MessageValidations } from './message.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';


const router = express.Router();

router.get(
  '/:chatId',
  auth(
 
    USER_ROLES.WORKER, USER_ROLES.EMPLOYER
  ),
  MessageController.getAllMessages
);


router.post(
  '/:chatId',
  auth(
 
    USER_ROLES.WORKER, USER_ROLES.EMPLOYER
  ),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(MessageValidations.create),
  MessageController.createMessage
);




export const MessageRoutes = router;