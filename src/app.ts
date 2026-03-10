import express from 'express';
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

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to app',
  });
});

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
