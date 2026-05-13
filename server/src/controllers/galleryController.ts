import Gallery from '../models/Gallery';
import * as factory from './factory';

export const getAll = factory.getAll(Gallery, ['title', 'category']);
export const getOne = factory.getOne(Gallery);
export const createOne = factory.createOne(Gallery);
export const updateOne = factory.updateOne(Gallery);
export const deleteOne = factory.deleteOne(Gallery);
