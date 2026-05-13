import LatestUpdate from '../models/LatestUpdate';
import * as factory from './factory';

export const getAll = factory.getAll(LatestUpdate, ['text']);
export const getOne = factory.getOne(LatestUpdate);
export const createOne = factory.createOne(LatestUpdate);
export const updateOne = factory.updateOne(LatestUpdate);
export const deleteOne = factory.deleteOne(LatestUpdate);
