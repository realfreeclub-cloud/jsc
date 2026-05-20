import Module from '../models/Module';
import * as factory from './factory';

export const getAll = factory.getAll(Module, ['title', 'description']);
export const getOne = factory.getOne(Module);
export const createOne = factory.createOne(Module);
export const updateOne = factory.updateOne(Module);
export const deleteOne = factory.deleteOne(Module);
