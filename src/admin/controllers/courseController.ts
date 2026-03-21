import { NextFunction, Request, Response } from 'express';
import prisma from '../../lib/prisma';
import catchAsync from '../../middlewares/catchAsync';
import AppError from '../../utils/appError';
import buildImageUrl from '../../utils/buildImageUrl';
import { ResourceFolders } from '../../middlewares/uploadImage';
import deleteFile from '../../utils/deleteImage';

export const getAllCourses = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courses = await prisma.course.findMany({});

    const coursesWithUrls = courses.map((course) => ({
      ...course,
      image:
        buildImageUrl(req, ResourceFolders['course'], course.image) || null,
    }));

    res.status(200).json({
      results: courses.length,
      status: 'success',
      data: coursesWithUrls,
    });
  },
);

export const createCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const course = await prisma.course.create({
      data: {
        ...req.body,
        image: req.file?.filename || '',
      },
    });

    const courseImageUrl = buildImageUrl(
      req,
      ResourceFolders['course'],
      course.image,
    );

    res.status(201).json({
      status: 'success',
      data: {
        ...course,
        image: courseImageUrl,
      },
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

      const courseImageUrl = buildImageUrl(
        req,
        ResourceFolders['course'],
        course.image,
      );


    res.status(200).json({
      status: 'success',
      data: {
        ...course,
        image: courseImageUrl,
      },
    });
  },
);

export const updateCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id: reqId } = req.params;

    const existingCourse = await prisma.course.findUnique({
      where: {
        id: Number(reqId),
      },
    });

    if (!existingCourse) {
      return next(new AppError('No course found with that ID', 404));
    }

    const course = await prisma.course.update({
      where: {
        id: Number(reqId),
      },
      data: {
        ...req.body,
        image: req.file?.filename,
      },
    });

    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }

    if (req.file?.filename && existingCourse.image) {
      deleteFile(ResourceFolders['course'], existingCourse.image);
    }

    const courseImageUrl = buildImageUrl(
      req,
      ResourceFolders['course'],
      course.image,
    );

    res.status(200).json({
      status: 'success',
      data: {
        ...course,
        image: courseImageUrl,
      },
    });
  },
);

export const deleteCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id: reqId } = req.params;

    const course = await prisma.course.findUnique({
      where: {
        id: Number(reqId),
      },
    });

    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }

    await prisma.course.delete({
      where: {
        id: Number(reqId),
      },
    });

    if (course.image) {
      deleteFile(ResourceFolders['course'], course.image);
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);
