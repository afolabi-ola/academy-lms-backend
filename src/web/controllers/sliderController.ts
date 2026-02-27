import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import catchAsync from '../../middlewares/catchAsync';
import AppError from '../../utils/appError';

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
    const { title, description, image } = req.body;

    const slider = await prisma.slider.create({
      data: { image, title, description },
    });

    res.status(201).json({
      status: 'success',
      data: slider,
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

    const slider = await prisma.slider.update({
      where: {
        id: Number(reqId),
      },
      data: req.body,
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

export const deleteSlider = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id: reqId } = req.params;
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
