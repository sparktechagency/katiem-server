import { Model } from "mongoose";


export interface IPackage extends Document {
       
    type:string;
    regularPrice:number;
    discountPercent:number;
    stripeProductId:string;
    stripePriceId:string;
    stripeCouponId?:string;
    description?:string;
    isInstantBooking?:boolean;
    interval?: 'month' | 'year';
    limits:{
        jobPostLimit?:number;
        bookingLimit?:number;
        boostLimit?:number;
    }
    currency?:string;
    features?: string[];
    isActive?:boolean;
    createdAt?:Date;
    updatedAt?:Date;
}


export type IPackageModel = Model<IPackage, {}, {}>;

export interface ICoupon extends Document {
    _id?: string;
    stripeCouponId: string;
    description?: string;
    percent_off: number;
    isActive:boolean
}

export type ICouponModel = Model<ICoupon, {}, {}>;