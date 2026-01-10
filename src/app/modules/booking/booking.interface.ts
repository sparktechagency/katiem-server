import { Model, Types } from 'mongoose';
import { BOOKING_STATUS } from '../../../enum/status';
import { IUser } from '../user/user.interface';

export interface IBooking {
  _id: Types.ObjectId;
  employer: Types.ObjectId | IUser;
  worker: Types.ObjectId | IUser;
  status: BOOKING_STATUS;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingModel = Model<IBooking, {}, {}>;


export type IBookingCreate = {
  employer: Types.ObjectId | string;
  worker: Types.ObjectId | string;
  
}