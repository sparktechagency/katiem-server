import { Request, Response } from 'express';
import { MessageServices } from './message.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { messageFilterables } from './message.constants';
import { paginationFields } from '../../../interfaces/pagination';
import { Types } from 'mongoose';

const createMessage = catchAsync(async (req: Request, res: Response) => {
  const messageData = req.body;
  console.log(messageData);
  if(messageData.images && messageData.images.length > 0){
    messageData.files = messageData.images;
  }
  const result = await MessageServices.createMessage(
    req.user!,
    new Types.ObjectId(req.params.chatId),
    messageData
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Message sent successfully.',
    data: result,
  });
});




const getAllMessages = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, messageFilterables);
  const pagination = pick(req.query, paginationFields);
  const chatId = new Types.ObjectId(req.params.chatId);

  const result = await MessageServices.getAllMessages(
    req.user!,
    chatId,
    filterables,
    pagination
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Messages retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});



export const MessageController = {
  createMessage,

  getAllMessages,

};