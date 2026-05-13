import { Request, Response, NextFunction } from 'express';
import APIFeatures from '../utils/apiFeatures';

export const getAll = (Model: any, searchFields: string[] = ['title', 'name']) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const features = new APIFeatures(Model.find(), req.query)
      .search(searchFields)
      .filter()
      .sort()
      .paginate();

    const doc = await features.query;
    
    const totalFeatures = new APIFeatures(Model.find(), req.query).search(searchFields).filter();
    const totalCount = await totalFeatures.query.countDocuments();

    res.status(200).json({
      status: 'success',
      results: doc.length,
      totalCount,
      data: doc
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};

export const getOne = (Model: any, popOptions?: string) => async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return res.status(404).json({ status: 'fail', message: 'No document found with that ID' });
    }

    res.status(200).json({ status: 'success', data: doc });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};

export const createOne = (Model: any) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: 'success', data: doc });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};

export const updateOne = (Model: any) => async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return res.status(404).json({ status: 'fail', message: 'No document found with that ID' });
    }

    res.status(200).json({ status: 'success', data: doc });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};

export const deleteOne = (Model: any) => async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({ status: 'fail', message: 'No document found with that ID' });
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};
