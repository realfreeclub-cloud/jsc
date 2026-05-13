import StudyMaterial from '../models/StudyMaterial';
import * as factory from './factory';

export const getAll = factory.getAll(StudyMaterial, ['title', 'description', 'category']);
export const getOne = factory.getOne(StudyMaterial);
export const createOne = factory.createOne(StudyMaterial);
export const updateOne = factory.updateOne(StudyMaterial);
export const deleteOne = factory.deleteOne(StudyMaterial);
