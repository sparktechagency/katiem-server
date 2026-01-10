import { JwtPayload } from "jsonwebtoken";
import { IJob } from "../app/modules/job/job.interface";

import { APPLICATION_STATUS, BOOKING_STATUS } from "../enum/status";

export const hideUserSensitiveInformation = (item: any) => {
  const userFields = ["applicant", "employer", "worker"];

  for (const field of userFields) {
    const user = item[field];
    if (!user || typeof user !== "object" || !user._id) continue;

    user.phone =  "";
    user.email =  "";
  }

  return item;
};



export const getNotificationMessage = (from:JwtPayload, type:"booking" | "application", job?:IJob, status?:APPLICATION_STATUS | BOOKING_STATUS):string =>{
    if(type === "booking"){
        if(status === BOOKING_STATUS.APPROVED){
            return `Your booking request to ${from?.name} has been approved. You can now contact the worker.`
        }
        if(status === BOOKING_STATUS.DECLINED){
            return `Your booking request to ${from?.name} has been declined. Please try booking with a different worker.`
        }
        return ``
    }
    if(type === "application"){
        if(status === APPLICATION_STATUS.APPROVED){
            return `Your job application for ${job?.title} has been approved. You can now contact the employer.`
        }
        if(status === APPLICATION_STATUS.DECLINED){
            return `Your job application for ${job?.title} has been declined. Please try applying for a different job.`
        }
        return `You have a new job application request from ${from?.name} for ${job?.title}`
    }
    return ''
}


