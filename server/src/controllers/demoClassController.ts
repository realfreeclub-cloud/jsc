import { Request, Response, NextFunction } from 'express';
import DemoClass from '../models/DemoClass';
import APIFeatures from '../utils/apiFeatures';
import * as factory from './factory';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryObj: any = {};
    
    // Check if we are filtering by leadType
    if (req.query.leadType === 'lead') {
      queryObj.demoSession = null;
      queryObj.scheduleDate = null;
    } else if (req.query.leadType === 'demo') {
      queryObj.$or = [
        { demoSession: { $ne: null } },
        { scheduleDate: { $ne: null } }
      ];
    }

    // Remove leadType from query so it doesn't get processed by APIFeatures
    delete req.query.leadType;

    const features = new APIFeatures(DemoClass.find(queryObj), req.query)
      .search(['name', 'email', 'phone', 'courseInterest'])
      .filter()
      .sort()
      .paginate();

    const doc = await features.query;
    
    const totalFeatures = new APIFeatures(DemoClass.find(queryObj), req.query)
      .search(['name', 'email', 'phone', 'courseInterest'])
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

export const getOne = factory.getOne(DemoClass);
export const createOne = factory.createOne(DemoClass);
export const updateOne = factory.updateOne(DemoClass);
export const deleteOne = factory.deleteOne(DemoClass);
