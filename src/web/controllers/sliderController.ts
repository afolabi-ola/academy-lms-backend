import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import catchAsync from '../../middlewares/catchAsync';
import AppError from '../../utils/appError';
import { ResourceFolders } from '../../middlewares/uploadImage';
import buildImageUrl from '../../utils/buildImageUrl';
import deleteFile from '../../utils/deleteImage';


export const getAllSliders = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sliders = await prisma.slider.findMany();

      const slidersWithUrls = sliders.map((slider) => ({
        ...slider,
        image:
          buildImageUrl(req, ResourceFolders['slider'], slider.image) || null,
      }));

    res.status(200).json({
      results: sliders.length,
      status: 'success',
      data: slidersWithUrls,
    });
  },
);

export const createSlider = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { title, description } = req.body;

    const slider = await prisma.slider.create({
      data: {
        image: req.file?.filename || '',
        title,
        description,
      },
    });

    const sliderImageUrl = buildImageUrl(
      req,
      ResourceFolders['slider'],
      slider.image,
    );

    res.status(201).json({
      status: 'success',
      data: {
        ...slider,
        image: sliderImageUrl,
      },
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

    const sliderImageUrl = buildImageUrl(
      req,
      ResourceFolders['slider'],
      slider.image,
    );


    res.status(200).json({
      status: 'success',
      data: {
        ...slider,
        image: sliderImageUrl,
      },
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

    const data = {
      ...req.body,
      image: req.file?.filename,
    };

    const slider = await prisma.slider.update({
      where: {
        id: Number(reqId),
      },
      data,
    });

    if (!slider) {
      return next(new AppError('No slider found with that ID', 404));
    }

    if (req.file?.filename && existingSlider.image) {
      deleteFile(ResourceFolders['slider'], existingSlider.image);
    }

    const sliderImageUrl = buildImageUrl(
      req,
      ResourceFolders['slider'],
      slider.image,
    );

    res.status(200).json({
      status: 'success',
      data: {
        ...slider,
        image: sliderImageUrl,
      },
    });
  },
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
    
    await prisma.slider.delete({
      where: {
        id: Number(reqId),
      },
    });
    
    if (slider.image) {
      deleteFile(ResourceFolders['slider'], slider.image);
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  },
);
