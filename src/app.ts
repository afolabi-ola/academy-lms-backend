import express from 'express';
import dashboardRouter from './admin/routes/dashboardRoutes';
import sliderRouter from './web/routes/sliderRoute';
import faqRouter from './web/routes/faqRoutes';
import courseRouter from './admin/routes/courseRoutes';
import studentRouter from './admin/routes/studentRoutes';
import paymentRouter from './admin/routes/paymentRoutes';
import userRouter from './admin/routes/userRoutes';
import enrollmentRouter from './admin/routes/enrollmentRoutes';
import AppError from './utils/appError';
import errorController from './middlewares/errorController';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { parse } from 'qs';


const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
  }),
);

app.use(cookieParser());
app.set('query parser', (str: string) => parse(str));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to app',
  });
});

app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/sliders', sliderRouter);
app.use('/api/v1/faqs', faqRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/students', studentRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/enrollments', enrollmentRouter);

// Handle undefined routes (404)
app.all('/{*splat}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware (must be last)
app.use(errorController);

export default app;
