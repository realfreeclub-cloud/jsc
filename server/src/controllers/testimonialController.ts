import Testimonial from '../models/Testimonial';
import * as factory from './factory';

export const getAll = factory.getAll(Testimonial, ['studentName', 'courseName', 'content']);
export const getOne = factory.getOne(Testimonial);
export const createOne = factory.createOne(Testimonial);
export const updateOne = factory.updateOne(Testimonial);
export const deleteOne = factory.deleteOne(Testimonial);
