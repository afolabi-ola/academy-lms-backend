import { NextFunction, Request, Response } from 'express';
import catchAsync from './catchAsync';
import multer from 'multer';
import sharp from 'sharp';
import AppError from '../utils/appError';

export enum ImageResource {
  STUDENT = 'student',
  SLIDER = 'slider',
  COURSE = 'course',
  THUMBNAIL = 'thumbnail',
}

export const ResourceFolders: { [key in ImageResource]: string } = {
  student: 'students',
  slider: 'sliders',
  course: 'courses',
  thumbnail: 'thumbnails',
};

type ResizeOptions = {
  width: number;
  height: number;
  fit?: keyof sharp.FitEnum;
};

export const IMAGE_PRESETS: { [key in ImageResource]: ResizeOptions } = {
  student: {
    width: 200,
    height: 300,
    fit: 'cover',
  },
  slider: {
    width: 2000,
    height: 800,
    fit: 'cover',
  },
  thumbnail: {
    width: 300,
    height: 300,
    fit: 'cover',
  },
  course: {
    width: 500,
    height: 800,
    fit: 'cover',
  },
};

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Not an image! Please upload only images.', 400));
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadImage = (field: string) => upload.single(field);

const resizeImage = (resource: keyof typeof IMAGE_PRESETS) => {
  const { width, height, fit = 'cover' } = IMAGE_PRESETS[resource];

  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    const imageBuffer = await sharp(req.file.buffer)
      .resize(width, height, {
        fit,
        position: 'center',
      })
      .toFormat('jpeg')
      .jpeg({ quality: 85 })
      .toBuffer();

    req.file.buffer = imageBuffer;

    next();
  });
};

const uploadSingleImage = (
  field: string = 'image',
  resource: keyof typeof IMAGE_PRESETS,
) => {
  return [uploadImage(field), resizeImage(resource)];
};

export default uploadSingleImage;
