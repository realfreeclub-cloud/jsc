import Blog from '../models/Blog';
import * as factory from './factory';

export const getAll = factory.getAll(Blog, ['title', 'content', 'slug', 'tags']);
export const getOne = factory.getOne(Blog);
export const createOne = factory.createOne(Blog);
export const updateOne = factory.updateOne(Blog);
export const deleteOne = factory.deleteOne(Blog);
