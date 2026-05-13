import Faculty from '../models/Faculty';
import * as factory from './factory';

export const getAll = factory.getAll(Faculty, ['name', 'designation', 'bio']);
export const getOne = factory.getOne(Faculty);
export const createOne = factory.createOne(Faculty);
export const updateOne = factory.updateOne(Faculty);
export const deleteOne = factory.deleteOne(Faculty);
