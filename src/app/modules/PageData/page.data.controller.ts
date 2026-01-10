import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SectionService } from './page.data.service';

export const SectionController = {
  createSection: catchAsync(async (req: Request, res: Response) => {
    const section = await SectionService.createSection(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Section created successfully',
      data: section,
    });
  }),

  getSectionsByPage: catchAsync(async (req: Request, res: Response) => {
    const sections = await SectionService.getSectionsByPage(req.params.pageSlug);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Sections retrieved successfully',
      data: sections,
    });
  }),

  updateSection: catchAsync(async (req: Request, res: Response) => {
    const section = await SectionService.updateSection(req.params.id, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Section updated successfully',
      data: section,
    });
  }),

  deleteSection: catchAsync(async (req: Request, res: Response) => {
    const message = await SectionService.deleteSection(req.params.id);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Section deleted successfully',
      data: message,
    });
  }),

  getSectionBySlug: catchAsync(async (req: Request, res: Response) => {
    const section = await SectionService.getSectionBySlug(req.params.slug);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Section retrieved successfully',
      data: section,
    });
  }),
};



