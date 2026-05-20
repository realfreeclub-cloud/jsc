import { Request, Response, NextFunction } from 'express';
import Gallery from '../models/Gallery';
import * as factory from './factory';
import APIFeatures from '../utils/apiFeatures';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filterObj: any = {};
    // If not admin, only show public images
    if ((req as any).user?.role !== 'admin') {
      filterObj.isPrivate = false;
    }

    const features = new APIFeatures(Gallery.find(filterObj), req.query)
      .search(['title', 'category'])
      .filter()
      .sort()
      .paginate();

    const doc = await features.query;

    const totalFeatures = new APIFeatures(Gallery.find(filterObj), req.query)
      .search(['title', 'category'])
      .filter();
    const totalCount = await totalFeatures.query.countDocuments();

    res.status(200).json({
      status: 'success',
      results: doc.length,
      totalCount,
      data: doc
    });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const getOne = factory.getOne(Gallery);
export const createOne = factory.createOne(Gallery);
export const updateOne = factory.updateOne(Gallery);
export const deleteOne = factory.deleteOne(Gallery);
