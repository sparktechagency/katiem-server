import { z } from 'zod';
import { sectionTypeEnum } from './page.data.interface';

// Enum helper
const SectionTypeEnum = z.enum([
  sectionTypeEnum.HERO,
  sectionTypeEnum.HOW_IT_WORKS,
  sectionTypeEnum.HOW_IT_WORKS_WORKER,
  sectionTypeEnum.JOB_RESPONSE,
  sectionTypeEnum.WHY_US,
  sectionTypeEnum.WHO_WE_ARE,
  sectionTypeEnum.OUR_MISSION,
  sectionTypeEnum.OUR_VISION,
  sectionTypeEnum.WHERE_WE_OPERATE,
  sectionTypeEnum.ABOUT_HERO,
  sectionTypeEnum.ABOUT_WHY_US,
  sectionTypeEnum.CONTACT_US,
  sectionTypeEnum.CUSTOM,
]);

// =====================
// Page validation schema
// =====================
export const createPageSchema = z.object({
  body: z.object({
    slug: z.string().min(3, 'Slug must be at least 3 characters'),
    name: z.string().min(1, 'Page name is required'),
    sections: z.array(z.string()).optional(), // Optional: section IDs
  }),
});

export const updatePageSchema = z.object({
  body: z.object({
    slug: z.string().min(3).optional(),
    name: z.string().optional(),
    sections: z.array(z.string()).optional(),
  }),
});

// ========================
// Section validation schema
// ========================
export const createSectionSchema = z.object({
  body: z.object({
    pageSlug: z.string().min(3, 'Page slug is required'), // must exist in your DB (check in controller)
    sectionType: SectionTypeEnum,
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    content: z.any().optional(),
    order: z.number().min(0).optional(),
  }),
});

export const updateSectionSchema = z.object({
  body: z.object({
    pageSlug: z.string().min(3).optional(), // optional during update
    sectionType: SectionTypeEnum.optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    content: z.any().optional(),
    order: z.number().min(0).optional(),
  }),
});
