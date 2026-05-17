import Student from '../models/Student';
import * as factory from './factory';

export const getAll = factory.getAll(Student, ['name', 'email', 'phone', 'course']);
export const getOne = factory.getOne(Student);
export const createOne = factory.createOne(Student);
export const updateOne = factory.updateOne(Student);
export const deleteOne = factory.deleteOne(Student);
