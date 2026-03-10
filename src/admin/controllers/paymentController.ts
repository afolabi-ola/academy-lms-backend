import { NextFunction, Response, Request } from 'express';
import catchAsync from '../../middlewares/catchAsync';
import prisma from '../../lib/prisma';
import AppError from '../../utils/appError';

export const getAllPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payments = await prisma.payment.findMany({
      select: {
        id: true,
        amount: true,
        createdAt: true,
        reference: true,
        enrollment: {
          select: {
            student: {
              select: {
                surname: true,
                firstname: true,
                otherName: true,
              },
            },
            course: {
              select: {
                title: true,
                fee: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        payments,
      },
    });
  },
);

export const getPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payment = await prisma.payment.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        enrollment: {
          include: {
            student: true,
            course: true,
          },
        },
      },
    });

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        payment,
      },
    });
  },
);

export const createPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { amountReceived: amount, enrollmentId } = req.body;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        id: enrollmentId,
      },
      select: {
        course: {
          select: {
            fee: true,
          },
        },
      },
    });

    if (!enrollment) {
      return next(new AppError('Enrollment not found', 404));
    }

    if (amount > enrollment.course.fee) {
      return next(
        new AppError('Amount received cannot be greater than course fee', 400),
      );
    }

    const existingPayments = await prisma.payment.findMany({
      where: { enrollmentId },
    });

    const totalPaid = existingPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    if (totalPaid + amount > enrollment.course.fee) {
      return next(new AppError('Payment exceeds remaining balance', 400));
    }

    const payment = await prisma.payment.create({
      data: {
        amount,
        enrollmentId,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        payment,
      },
    });
  },
);
