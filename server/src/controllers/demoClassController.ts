import DemoClass from '../models/DemoClass';
import * as factory from './factory';

export const getAll = factory.getAll(DemoClass, ['name', 'email', 'phone', 'courseInterest']);
export const getOne = factory.getOne(DemoClass);
export const createOne = factory.createOne(DemoClass);
export const updateOne = factory.updateOne(DemoClass);
export const deleteOne = factory.deleteOne(DemoClass);
