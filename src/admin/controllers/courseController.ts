import { NextFunction, Request, Response } from 'express';
import prisma from '../../lib/prisma';
import catchAsync from '../../middlewares/catchAsync';
import AppError from '../../utils/appError';
import { ImageResource, ResourceFolders } from '../../middlewares/uploadImage';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/helpers';

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
      data: {
        ...req.body,
        image: '',
        publicId: '',
      },
    });

    if (!course) {
      return next(new AppError('Failed to create course', 500));
    }

    if (!req.file?.buffer) {
      res.status(201).json({
        status: 'success',
        data: course,
      });
      return;
    }

    const { secure_url, publicId } = await uploadToCloudinary(
      req?.file?.buffer,
      ResourceFolders[ImageResource.COURSE],
      course.id.toString(),
    );

    const updatedCourse = await prisma.course.update({
      where: {
        id: course.id,
      },
      data: {
        image: secure_url, // Use the image URL from the request
        publicId, // Use the public ID from the request
      },
    });

    res.status(201).json({
      status: 'success',
      data: updatedCourse,
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

    const existingCourse = await prisma.course.findUnique({
      where: {
        id: Number(reqId),
      },
    });

    if (!existingCourse) {
      return next(new AppError('No course found with that ID', 404));
    }

    const { title, description, duration, fee, isActive } = req.body;

    let imageUrl;
    let publicId;

    if (req.file?.buffer) {
      const { secure_url, publicId: public_id } = await uploadToCloudinary(
        req.file.buffer,
        ResourceFolders[ImageResource.COURSE],
        existingCourse.id.toString(),
      );

      imageUrl = secure_url;
      publicId = public_id;
    }

    const course = await prisma.course.update({
      where: {
        id: Number(reqId),
      },
      data: {
        title: title || existingCourse.title,
        description: description || existingCourse.description,
        duration: duration || existingCourse.duration,
        fee: fee || existingCourse.fee,
        isActive: isActive !== undefined ? isActive : existingCourse.isActive,
        image: imageUrl || existingCourse.image, // Use the new image URL if provided, otherwise keep the existing one
        publicId: publicId || existingCourse.publicId, // Use the new public ID if provided, otherwise keep the existing one
      },
    });

    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: course,
    });
  }
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

    if (course.publicId) {
      await deleteFromCloudinary(course.publicId);
    }
    
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

