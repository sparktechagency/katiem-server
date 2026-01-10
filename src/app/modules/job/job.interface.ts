import { Model, Types } from 'mongoose';
import { AVAILABILITY, SALARY_TYPE } from '../user/user.interface';

export interface IJobFilterables {
  searchTerm?: string;
  companyName?: string;
  category?: string;
  subCategory?: string;
  latitude?: number;
  longitude?: number;
  minSalary?: number;
  maxSalary?: number;
  address?: string;
  minRating?: number;
  maxRating?: number;
  salaryType?: string;
  radius?: number;
  postDuration?: string;
  overview?: string;
}


export type ISalaryType = {
  salaryType: string;
  amount: number;
}

export type Availability = AVAILABILITY.FULL_TIME | AVAILABILITY.PART_TIME | AVAILABILITY.FLEXIBLE | AVAILABILITY.ONE_DAY | AVAILABILITY.WEEKLY | AVAILABILITY.MONTHLY | AVAILABILITY.YEARLY;

export type Point = {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
}

export interface IJob {
  _id: Types.ObjectId;
  title: string;
  companyName: string;
  createdBy: Types.ObjectId;
  category: string;
  subCategory: string;
  address: string;
  postDuration: number;
  availability: AVAILABILITY[];
  images: string[];
  salary: number;
  salaryType: SALARY_TYPE;
  boostWeight: number;
  overview: string;
  responsibilities: string[];
  skillRequirements: string[];
  benefits: string[];
  location: Point
  isExpired: boolean;
  chatId?: Types.ObjectId | string
  isApplied?: boolean
  applicationStatus: string
  isReviewed?: boolean
  createdAt: Date;
  updatedAt: Date;
}

export type JobModel = Model<IJob, {}, {}>;
