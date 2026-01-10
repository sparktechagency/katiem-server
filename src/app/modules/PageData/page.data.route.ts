import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import validateRequest from '../../middleware/validateRequest';
import {  createSectionSchema, updateSectionSchema } from './page.data.validation';
import { SectionController } from './page.data.controller';
import {  fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';


const router = Router();


// Section routes
router.post('/section',auth(USER_ROLES.ADMIN),fileAndBodyProcessorUsingDiskStorage(), validateRequest(createSectionSchema), SectionController.createSection);
router.get('/section/:pageSlug', SectionController.getSectionsByPage);
router.get('/section/slug/:slug', SectionController.getSectionBySlug);
router.patch('/section/:id',auth(USER_ROLES.ADMIN), fileAndBodyProcessorUsingDiskStorage(), validateRequest(updateSectionSchema), SectionController.updateSection);
router.delete('/section/:id',auth(USER_ROLES.ADMIN), SectionController.deleteSection);

export const ContentRoutes = router;
