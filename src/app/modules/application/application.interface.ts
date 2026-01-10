import { Model, Types } from 'mongoose';
import { APPLICATION_STATUS } from '../../../enum/status';
import { IUser } from '../user/user.interface';
import { IJob } from '../job/job.interface';



export interface IApplication {
  _id: Types.ObjectId;
  job: Types.ObjectId | IJob | string;
  employer: Types.ObjectId | IUser;
  applicant: Types.ObjectId | IUser;
  status: APPLICATION_STATUS;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationModel = Model<IApplication, {}, {}>;


export type IApplicationFilterables = {
  searchTerm?: string;
  job?: Types.ObjectId;
  employer?: Types.ObjectId;
  applicant?: Types.ObjectId;
  status?: APPLICATION_STATUS;
};


export type IApplicationCreate = {
  job: string | Types.ObjectId;
  applicant: Types.ObjectId;
  employer: Types.ObjectId;
}