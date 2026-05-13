const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../src');

// Ensure directories exist
['controllers', 'routes', 'middleware', 'utils'].forEach(dir => {
  const dirPath = path.join(baseDir, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});

const files = {
  'utils/apiFeatures.ts': `export default class APIFeatures {
  query: any;
  queryString: any;

  constructor(query: any, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }

  search(searchFields: string[]) {
    if (this.queryString.search) {
      const regex = new RegExp(this.queryString.search as string, 'i');
      const searchConditions = searchFields.map(field => ({ [field]: regex }));
      this.query = this.query.find({ $or: searchConditions });
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\\b(gte|gt|lte|lt)\\b/g, match => \`$\${match}\`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = (this.queryString.sort as string).split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page as string, 10) || 1;
    const limit = parseInt(this.queryString.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
`,

  'middleware/auth.ts': `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'You are not logged in! Please log in to get access.' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ status: 'fail', message: 'The user belonging to this token does no longer exist.' });
    }

    (req as any).user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ status: 'fail', message: 'Invalid or expired token' });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    if (!roles.includes((req as any).user.role)) {
      return res.status(403).json({ status: 'fail', message: 'You do not have permission to perform this action' });
    }
    next();
  };
};
`,

  'controllers/factory.ts': `import { Request, Response, NextFunction } from 'express';
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
`,

  'controllers/authController.ts': `import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import bcrypt from 'bcryptjs';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey123', {
    expiresIn: '90d'
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone
    });

    const token = signToken(newUser._id as string);

    const userToReturn = newUser.toObject();
    delete userToReturn.password;

    res.status(201).json({
      status: 'success',
      token,
      data: userToReturn
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password!' });
    }

    const user: any = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    const token = signToken(user._id);

    const userToReturn = user.toObject();
    delete userToReturn.password;

    res.status(200).json({
      status: 'success',
      token,
      data: userToReturn
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: (err as any).message });
  }
};
`,

  'routes/authRoutes.ts': `import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;
`,
};

// Generate standard generic resource configurations
const resources = [
  { name: 'Course', searchFields: "['title', 'slug', 'about']" },
  { name: 'Blog', searchFields: "['title', 'content', 'slug', 'tags']" },
  { name: 'Event', searchFields: "['title', 'description', 'location']" },
  { name: 'Notification', searchFields: "['title', 'content']" },
  { name: 'LatestUpdate', searchFields: "['text']" },
  { name: 'Gallery', searchFields: "['title', 'category']" },
  { name: 'StudyMaterial', searchFields: "['title', 'description', 'category']" },
  { name: 'Testimonial', searchFields: "['studentName', 'courseName', 'content']" },
  { name: 'Faculty', searchFields: "['name', 'designation', 'bio']" },
  { name: 'HeroSlider', searchFields: "['title', 'subtitle']" }
];

resources.forEach(r => {
  const routeName = r.name.toLowerCase() + 's';
  const controllerName = r.name.toLowerCase() + 'Controller';

  // Controller
  files['controllers/' + controllerName + '.ts'] = `import ${r.name} from '../models/${r.name}';
import * as factory from './factory';

export const getAll = factory.getAll(${r.name}, ${r.searchFields});
export const getOne = factory.getOne(${r.name});
export const createOne = factory.createOne(${r.name});
export const updateOne = factory.updateOne(${r.name});
export const deleteOne = factory.deleteOne(${r.name});
`;

  // Route
  files['routes/' + routeName + 'Routes.ts'] = `import express from 'express';
import * as controller from '../controllers/${controllerName}';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);

// Protected Admin Routes
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', controller.createOne);
router.patch('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);

export default router;
`;
});

// Central Index.ts Setup snippet
files['index.ts'] = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

// Import Routes
import authRoutes from './routes/authRoutes';
${resources.map(r => `import ${r.name.toLowerCase()}sRoutes from './routes/${r.name.toLowerCase()}sRoutes';`).join('\\n')}

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/auth', authRoutes);
${resources.map(r => `app.use('/api/v1/${r.name.toLowerCase()}s', ${r.name.toLowerCase()}sRoutes);`).join('\\n')}

// Handle undefined routes
app.all('*', (req, res) => {
  res.status(404).json({ status: 'fail', message: \`Can't find \${req.originalUrl} on this server!\` });
});

// Start Server
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/judicial-study';

mongoose.connect(DB_URI).then(() => {
  console.log('DB Connection Successful!');
  app.listen(PORT, () => {
    console.log(\`Server is running on port \${PORT}\`);
  });
}).catch(err => {
  console.log('DB Connection Error:', err);
});
`;

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(baseDir, filepath), content.replace(/\\\\n/g, '\\n'));
  console.log('Created: ' + filepath);
}
