import Course from '../models/Course';
import * as factory from './factory';

export const getAll = factory.getAll(Course, ['title', 'slug', 'about']);
export const getOne = factory.getOne(Course);
export const createOne = factory.createOne(Course);
export const updateOne = factory.updateOne(Course);
export const deleteOne = factory.deleteOne(Course);
