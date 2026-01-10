import { model, Schema } from "mongoose";
import { IPageData, ISection, PageDataModel, SectionModel, sectionTypeEnum } from "./page.data.interface";

const pageSchema = new Schema<IPageData, PageDataModel>(
    {
        slug: { type: String, required: true, unique: true, index: true },
        name: { type: String, default: '' },
        sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
    },
    { timestamps: true }
)

const sectionSchema = new Schema<ISection, SectionModel>(
    {
        pageSlug: { type: String, required: true, index: true },
        sectionType: { type: String, enum: Object.values(sectionTypeEnum), default: 'custom' },
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        images: { type: [String], default: [] },
        content: { type: Schema.Types.Mixed, default: {} },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
)

export const PageData = model<IPageData, PageDataModel>('PageData', pageSchema)
export const Section = model<ISection, SectionModel>('Section', sectionSchema)