import CourseCategory from '../models/CourseCategory';
import * as factory from './factory';

export const getAll = factory.getAll(CourseCategory, ['name', 'slug']);
export const getOne = factory.getOne(CourseCategory);
export const createOne = factory.createOne(CourseCategory);
export const updateOne = factory.updateOne(CourseCategory);
export const deleteOne = factory.deleteOne(CourseCategory);
