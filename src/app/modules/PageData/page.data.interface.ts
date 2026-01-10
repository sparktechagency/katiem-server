import { Model, Types } from "mongoose"

export type ISectionType = 'hero' | 'how-it-works' | 'why-us' | 'custom' | 'who-we-are' | 'our-mission' | 'our-vision' | 'where-we-operate' | 'about-why-us' | 'how-it-works-worker' | 'contact-us' | string
export const sectionTypeEnum ={
 HERO: "hero",
  HOW_IT_WORKS: "how-it-works",
  WHO_WE_ARE: "who-we-are",
  OUR_MISSION: "our-mission",
  OUR_VISION: "our-vision",
  WHERE_WE_OPERATE: "where-we-operate",
  ABOUT_WHY_US: "about-why-us",
  HOW_IT_WORKS_WORKER: "how-it-works-worker",
  WHY_US: "why-us",
  ABOUT_HERO: "about-hero",
  CONTACT_US: "contact-us",
  JOB_RESPONSE: "job-response",
  CUSTOM: "custom",
}

export interface ISection  {
pageSlug: string
sectionType?: ISectionType
title: string
description: string
images?: string[]
content: any // dynamic payload: arrays, key-values, etc.
order: number
createdAt: Date
updatedAt: Date
}


export interface IPageData extends Document {
slug: string
name: string
sections: Types.ObjectId[]
createdAt: Date
updatedAt: Date
}

export type PageDataModel =  Model<IPageData>
export type SectionModel = Model<ISection>