import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

export default app;
