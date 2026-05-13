import HeroSlider from '../models/HeroSlider';
import * as factory from './factory';

export const getAll = factory.getAll(HeroSlider, ['title', 'subtitle']);
export const getOne = factory.getOne(HeroSlider);
export const createOne = factory.createOne(HeroSlider);
export const updateOne = factory.updateOne(HeroSlider);
export const deleteOne = factory.deleteOne(HeroSlider);
