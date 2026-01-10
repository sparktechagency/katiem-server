import { Request, Response } from 'express';
import { ApplicationServices } from './application.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { applicationFilterables } from './application.constants';
import { paginationFields } from '../../../interfaces/pagination';

const createApplication = catchAsync(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  
  const result = await ApplicationServices.createApplication(
    req.user!,
    jobId
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Application created successfully',
    data: result,
  });
});

const updateApplication = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const applicationData = req.body;

  const result = await ApplicationServices.updateApplication(
    req.user!,
    id,
    applicationData
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Application updated successfully',
    data: result,
  });
});

const getSingleApplication = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ApplicationServices.getSingleApplication(req.user!, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Application retrieved successfully',
    data: result,
  });
});

const getAllApplications = catchAsync(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const filterables = pick(req.query, applicationFilterables);
  const pagination = pick(req.query, paginationFields);

  const result = await ApplicationServices.getAllApplications(
    req.user!,
    filterables,
    pagination,
    jobId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Applications retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const deleteApplication = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ApplicationServices.deleteApplication(req.user!, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Application deleted successfully',
    data: result,
  });
});

const getApplicationListForWorker = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicationServices.getApplicationListForWorker(req.user!)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Application list retrieved successfully',
    data: result,
  })
})


const getApplicationListForWorkerWithDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicationServices.getApplicationListForWorkerWithDetails(req.user!)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Application list with details retrieved successfully',
    data: result,
  })
})

export const ApplicationController = {
  createApplication,
  updateApplication,
  getSingleApplication,
  getAllApplications,
  deleteApplication,
  getApplicationListForWorker,
  getApplicationListForWorkerWithDetails
};