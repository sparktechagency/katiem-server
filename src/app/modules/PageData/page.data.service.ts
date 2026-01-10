import mongoose from 'mongoose'
import { ISection, sectionTypeEnum } from './page.data.interface'
import { PageData, Section } from './page.data.model'
import ApiError from '../../../errors/ApiError'
import { StatusCodes } from 'http-status-codes'

import removeFile from '../../../helpers/image/remove'

export const SectionService = {
  createSection: async (payload: Partial<ISection>) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      if (!payload.pageSlug) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'pageSlug is required')
      }

      // 1️⃣ Check if page exists
      let page = await PageData.findOne({ slug: payload.pageSlug }).session(
        session,
      )

      // 2️⃣ Create page automatically if it doesn't exist
      if (!page) {
        const [createdPage] = await PageData.create(
          [
            {
              slug: payload.pageSlug,
              name: payload.pageSlug,
              sections: [],
            },
          ],
          { session },
        )
        page = createdPage // create returns array when using session
      }

      // 3️⃣ Create section
      const section = await Section.create([payload], { session })
      const createdSection = section[0]

      // 4️⃣ Add section reference to page
      page.sections.push(createdSection._id)
      await page.save({ session })

      // Commit transaction
      await session.commitTransaction()

      return createdSection
    } catch (error) {
      // Rollback transaction
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  },

  deleteSection: async (id: string) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const section = await Section.findByIdAndDelete(id).session(session)
      if (!section)
        throw new ApiError(StatusCodes.NOT_FOUND, 'Section not found')

      // Remove reference from page
      await PageData.updateMany(
        { sections: id },
        { $pull: { sections: id } },
        { session },
      )

      await session.commitTransaction()

      //remove images also 
      if(section.images && section.images.length > 0){
        section.images.forEach(async (image) => {
          await removeFile(image)
        })
      }
      return 'Section deleted successfully'
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  },


  getSectionsByPage: async (pageSlug: string) => {
    const sections = await PageData.findOne({ slug: pageSlug })
      .populate('sections')
      .lean()
    return sections?.sections || []
  },

  updateSection: async (id: string, payload: Partial<ISection>) => {
    // ... existing code
    const section = await Section.findByIdAndUpdate(id, payload, {
      // new: true,
      runValidators: true,
    })
    if (!section) throw new ApiError(StatusCodes.NOT_FOUND, 'Section not found')
    
      return 'Section updated successfully'
  },

  getSectionBySlug: async (slug: string) => {
    const section = await Section.findOne({ sectionType: slug }).lean()

    return section || {}
  },


}
