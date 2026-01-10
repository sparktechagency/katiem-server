import { Request, Response } from 'express';
import { JobServices } from './job.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { jobFilterables } from './job.constants';
import { paginationFields } from '../../../interfaces/pagination';

const createJob = catchAsync(async (req: Request, res: Response) => {
  const { images, media, ...jobData } = req.body;

  if (images && images.length > 0) {
    jobData.images = images;
  }


  console.log(jobData, "images")

  const result = await JobServices.createJob(
    req.user!,
    jobData
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Job created successfully',
    data: result,
  });
});

const updateJob = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { images, ...jobData } = req.body;
  if (images && images.length > 0) {
    jobData.images = images;
  }

  console.log(jobData)

  const result = await JobServices.updateJob(
    req.user!,
    id,
    jobData
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job updated successfully',
    data: result,
  });
});

const getSingleJob = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await JobServices.getSingleJob(req.user!, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job retrieved successfully',
    data: result,
  });
});

const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  console.log(req.query)
  const filterables = pick(req.query, jobFilterables);
  const pagination = pick(req.query, paginationFields);

  const result = await JobServices.getAllJobs(
    filterables,
    pagination
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Jobs retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await JobServices.deleteJob(
    req.user!,
    id
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job deleted successfully',
    data: result,
  });
});

const applyJob = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await JobServices.applyJob(
    req.user!,
    id
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job applied successfully',
    data: result,
  });
});

const getMyPostedJobs = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, jobFilterables);
  const pagination = pick(req.query, paginationFields);

  const result = await JobServices.getMyPostedJobs(
    req.user!,
    filterables,
    pagination
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'My posted jobs retrieved successfully',
    data: result,
  });
});

const boostAJob = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await JobServices.boostAJob(
    req.user!,
    id
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job boosted successfully',
    data: result,
  });
});



export const JobController = {
  createJob,
  updateJob,
  getSingleJob,
  getAllJobs,
  deleteJob,
  applyJob,
  getMyPostedJobs,
  boostAJob,
};