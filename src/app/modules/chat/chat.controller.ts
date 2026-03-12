import { Request, Response } from 'express';
import { ChatServices } from './chat.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { chatFilterables } from './chat.constants';
import { paginationFields } from '../../../interfaces/pagination';
import { Types } from 'mongoose';

const createChat = catchAsync(async (req: Request, res: Response) => {
  const participant = new Types.ObjectId(req.params.participant as string);
  const result = await ChatServices.createChat(
    req.user!,
    participant
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Chat created successfully',
    data: result,
  });
});


const getAllChats = catchAsync(async (req: Request, res: Response) => {


  const filterables = pick(req.query, chatFilterables);
  const result = await ChatServices.getAllChats(
    req.user!,
    filterables
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Chats retrieved successfully',
    data: result,
  });
});

const getSingleChat = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ChatServices.getSingleChat(id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Chat retrieved successfully',
    data: result,
  });
});

const deleteChat = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ChatServices.deleteChat(id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Chat deleted successfully',
    data: result,
  });
});

export const ChatController = {
  createChat,
  getAllChats,
  getSingleChat,
  deleteChat,
};