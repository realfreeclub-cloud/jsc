import Notification from '../models/Notification';
import * as factory from './factory';

export const getAll = factory.getAll(Notification, ['title', 'content']);
export const getOne = factory.getOne(Notification);
export const createOne = factory.createOne(Notification);
export const updateOne = factory.updateOne(Notification);
export const deleteOne = factory.deleteOne(Notification);
