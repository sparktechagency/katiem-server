import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICategoryFilterables, ICategory } from './category.interface';
import { Category } from './category.model';

import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { categorySearchableFields } from './category.constants';
import { Types } from 'mongoose';
import removeFile from '../../../helpers/image/remove';



const createCategory = async (
  payload: ICategory
): Promise<ICategory> => {

    const result = await Category.create(payload);
    if (!result) {
      
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Category, please try again with valid data.'
      );
    }

    return result;
 
};

const getAllCategorys = async (
  filterables: ICategoryFilterables,
  pagination: IPaginationOptions
) => {
  const { searchTerm, ...filterData } = filterables;
  const { page, skip, limit, sortBy, sortOrder } = paginationHelper.calculatePagination(pagination);

  const andConditions = [];

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: categorySearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  // Filter functionality
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  const whereConditions = andConditions.length ? { $and: andConditions } : {};

  const [result, total] = await Promise.all([
    Category
      .find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder }).populate('subCategories'),
    Category.countDocuments(whereConditions),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getSingleCategory = async (id: string): Promise<ICategory> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Category ID');
  }

  const result = await Category.findById(id).populate('subCategories');
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested category not found, please try again with valid id'
    );
  }

  return result;
};

const updateCategory = async (
  id: string,
  payload: Partial<ICategory>
): Promise<ICategory | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Category ID');
  }

  const result = await Category.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: payload },
    {
      new: false,
      runValidators: true,
    }
  ).lean()


  if(result?.icon !== payload.icon && result?.icon) {
    await removeFile(result?.icon);
  }
  

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested category not found, please try again with valid id'
    );
  }

  return result;
};

const deleteCategory = async (id: string): Promise<ICategory> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Category ID');
  }

  const result = await Category.findByIdAndDelete(id);

  if (result?.icon) {
    await removeFile(result.icon);
  }

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting category, please try again with valid id.'
    );
  }

  return result;
};

export const CategoryServices = {
  createCategory,
  getAllCategorys,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};