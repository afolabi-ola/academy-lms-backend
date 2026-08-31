import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync';
import prisma from '../../lib/prisma';
import AppError from '../../utils/appError';

export const getAllEnrollments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const enrollments = await prisma.enrollment.findMany({
      select: {
        id: true,
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
    });

    res.status(200).json({
      status: 'success',
      data: {
        enrollments,
      },
    });
  },
);

export const getEnrollment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        id: Number(req.params.id),
      },
      select: {
        id: true,
        student: true,
        course: true,
        payments: true,
      },
    });

    if (!enrollment) {
      return next(new AppError('Enrollment not found', 404));
    }

    const totalAmountPaid = enrollment.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    const balance = enrollment.course.fee - totalAmountPaid;

    const status =
      balance === 0
        ? 'Paid'
        : balance < enrollment.course.fee
          ? 'Partially Paid'
          : 'Unpaid';

    const enrollmentWithPayment = {
      ...enrollment,
      paymentSummary: {
        totalAmountPaid,
        balance,
        status,
      },
    };

    res.status(200).json({
      status: 'success',
      data: {
        enrollment: enrollmentWithPayment,
      },
    });
  },
);

export const createEnrollment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { studentId, courseId } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: {
          id: studentId,
        },
      });

      if (!student) {
        throw new AppError('Student not found', 404);
      }

      const course = await tx.course.findUnique({
        where: {
          id: courseId,
        },
      });

      if (!course) {
        throw new AppError('Course not found', 404);
      }

      if (!course.isActive) throw new AppError('Course is not active', 400);

      const existingEnrollment = await tx.enrollment.findFirst({
        where: {
          studentId,
          courseId,
        },
      });

      if (existingEnrollment) {
        throw new AppError('Student is already enrolled in this course', 400);
      }

      const enrollment = await tx.enrollment.create({
        data: {
          studentId,
          courseId,
        },
      });

      return enrollment;
    });

    res.status(201).json({
      status: 'success',
      data: {
        enrollment: result,
      },
    });
  },
);
