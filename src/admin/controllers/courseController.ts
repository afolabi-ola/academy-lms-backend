import { NextFunction, Request, Response } from 'express';
import prisma from '../../lib/prisma';
import catchAsync from '../../middlewares/catchAsync';
import AppError from '../../utils/appError';

export const getAllCourses = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courses = await prisma.course.findMany({});

    res.status(200).json({
      results: courses.length,
      status: 'success',
      data: courses,
    });
  },
);

export const createCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const course = await prisma.course.create({
      data: req.body,
    });

    res.status(201).json({
      status: 'success',
      data: course,
    });
  },
);

export const getCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id: reqId } = req.params;

    const course = await prisma.course.findUnique({
      where: {
        id: Number(reqId),
      },
    });

    if (!course) return next(new AppError('No course found with that ID', 404));

    res.status(200).json({
      status: 'success',
      data: course,
    });
  },
);

export const updateCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id: reqId } = req.params;

    const course = await prisma.course.update({
      where: {
        id: Number(reqId),
      },
      data: req.body,
    });

    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: course,
    });
  },
);

export const deleteCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id: reqId } = req.params;

    await prisma.course.delete({
      where: {
        id: Number(reqId),
      },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);
