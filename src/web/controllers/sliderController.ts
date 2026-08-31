import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import catchAsync from '../../middlewares/catchAsync';
import AppError from '../../utils/appError';
import { ResourceFolders } from '../../middlewares/uploadImage';
import { deleteFromCloudinary, uploadToCloudinary } from '../../utils/helpers';


export const getAllSliders = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sliders = await prisma.slider.findMany();

    res.status(200).json({
      results: sliders.length,
      status: 'success',
      data: sliders,
    });
  },
);

export const createSlider = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { title, description } = req.body;

    const slider = await prisma.slider.create({
      data: {
        image: '',
        title,
        description,
        publicId: '',
      },
    });

    if (!req.file?.buffer) {
      res.status(201).json({
        status: 'success',
        data: slider,
      });
      return;
    }

    const { secure_url, publicId } = await uploadToCloudinary(
      req?.file?.buffer,
      ResourceFolders['slider'],
      slider.id.toString(),
    );

    const updatedSlider = await prisma.slider.update({
      where: {
        id: slider.id,
      },
      data: {
        image: secure_url, // Use the image URL from the request
        publicId, // Use the public ID from the request
      },
    });

    res.status(201).json({
      status: 'success',
      data: updatedSlider,
    });
  },
);

export const getSlider = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id: reqId } = req.params;

    const slider = await prisma.slider.findUnique({
      where: {
        id: Number(reqId),
      },
    });

    if (!slider) {
      return next(new AppError('No slider found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: slider,
    });
  },
);

export const updateSlider = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id: reqId } = req.params;

    const existingSlider = await prisma.slider.findUnique({
      where: {
        id: Number(reqId),
      },
    });

    if (!existingSlider) {
      return next(new AppError('No slider found with that ID', 404));
    }

    let imageUrl = existingSlider.image;
    let publicId = existingSlider.publicId;

    if (req.file?.buffer) {
      const { secure_url, publicId: newPublicId } = await uploadToCloudinary(
        req.file.buffer,
        ResourceFolders['slider'],
        existingSlider.id.toString(),
      );

      imageUrl = secure_url;
      publicId = newPublicId;
    }

    const slider = await prisma.slider.update({
      where: {
        id: Number(reqId),
      },
      data: {
        ...req.body,
        image: imageUrl || existingSlider.image,
        publicId: publicId || existingSlider.publicId,
      },
    });

    res.status(200).json({
      status: 'success',
      data: slider,
    });
  }
);

export const deleteSlider = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id: reqId } = req.params;

    const slider = await prisma.slider.findUnique({
      where: {
        id: Number(reqId),
      },
    });

    if (!slider) {
      return next(new AppError('No slider found with that ID', 404));
    }

    if (slider.publicId) {
      await deleteFromCloudinary(slider.publicId);
    }

    await prisma.slider.delete({
      where: {
        id: Number(reqId),
      },
    });

    res.status(200).json({
      status: 'success',
      data: null,
    });
  },
);
