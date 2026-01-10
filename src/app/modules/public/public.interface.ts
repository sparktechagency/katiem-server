import { Model, Types } from 'mongoose'

export type IPublic = {
  content: string
  type: string
}

export interface IContact {
  _id?: Types.ObjectId
  name: string
  email: string
  phone: string
  country?: string
  message: string
  feedback?: string
  isSolved: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface IContactFilter {
  isSolved?: boolean
}

export const contactSearchableFields = ['isSolved']


export type PublicModel = Model<IPublic>

export type IFaq = {
  question: string
  answer: string
  createdAt: Date
  updatedAt: Date
}

export type FaqModel = Model<IFaq>
export type ContactModel = Model<IContact>
