import { Request, Response } from 'express'

import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'

import { ClientreviewServices } from './clientReview.service'


const createClientreview = catchAsync(async (req: Request, res: Response) => {
  const { images, media, ...clientreviewData } = req.body

  if (images && images.length > 0) {
    clientreviewData.images = images[0]
  }

  const result = await ClientreviewServices.createClientreview(clientreviewData)

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Clientreview created successfully',
    data: result,
  })
})

const updateClientreview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const clientreviewData = req.body
  if (clientreviewData.images && clientreviewData.images.length > 0) {
    clientreviewData.image = clientreviewData.images[0]
  }
  const result = await ClientreviewServices.updateClientreview(
    id,
    clientreviewData,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Clientreview updated successfully',
    data: result,
  })
})

const getAllClientreviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ClientreviewServices.getAllClientreviews()

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Clientreviews retrieved successfully',
    data: result,
  })
})

export const ClientreviewController = {
  createClientreview,
  updateClientreview,
  getAllClientreviews,
}
