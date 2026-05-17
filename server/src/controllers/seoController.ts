import SEOSetting from '../models/SEOSetting';
import * as factory from './factory';

export const getAll = factory.getAll(SEOSetting, ['pageUrl', 'metaTitle']);
export const getOne = factory.getOne(SEOSetting);
export const createOne = factory.createOne(SEOSetting);
export const updateOne = factory.updateOne(SEOSetting);
export const deleteOne = factory.deleteOne(SEOSetting);
