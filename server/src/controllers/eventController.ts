import Event from '../models/Event';
import * as factory from './factory';

export const getAll = factory.getAll(Event, ['title', 'description', 'location']);
export const getOne = factory.getOne(Event);
export const createOne = factory.createOne(Event);
export const updateOne = factory.updateOne(Event);
export const deleteOne = factory.deleteOne(Event);
