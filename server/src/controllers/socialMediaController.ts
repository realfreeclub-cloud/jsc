import SocialMedia from '../models/SocialMedia';
import * as factory from './factory';

export const getAll = factory.getAll(SocialMedia, ['platform']);
export const getOne = factory.getOne(SocialMedia);
export const createOne = factory.createOne(SocialMedia);
export const updateOne = factory.updateOne(SocialMedia);
export const deleteOne = factory.deleteOne(SocialMedia);
