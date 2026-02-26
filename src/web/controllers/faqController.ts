import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync';
import prisma from '../../lib/prisma';
import AppError from '../../utils/appError';

export const getAllFaqs = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const faqs = await prisma.faq.findMany();

    res.status(200).json({
      status: 'success',
      results: faqs.length,
      data: {
        faqs,
      },
    });
  },
);

export const createFaq = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { question, answer } = req.body;

    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        faq,
      },
    });
  },
);

export const getFaq = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const faq = await prisma.faq.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!faq) {
      return next(new AppError('No FAQ found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        faq,
      },
    });
  },
);

export const updateFaq = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const faq = await prisma.faq.update({
      where: {
        id: Number(id),
      },
      data: req.body,
    });

    if (!faq) {
      return next(new AppError('No FAQ found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        faq,
      },
    });
  },
);

export const deleteFaq = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    await prisma.faq.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);
