import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync';
import prisma from '../../lib/prisma';
import AppError from '../../utils/appError';


export const getAllStudents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        firstname: true,
        surname: true,
        otherName: true,
        email: true,
        phone: true,
        enrollments: {
          select: {
            createdAt: true,
            course: {
              select: {
                title: true,
              },
            },

            //   payment: {
            //     select: {
            //       amount: true,
            //     },
            //   },
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      results: students.length,
      data: {
        students,
      },
    });
  },
);

export const getStudent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const student = await prisma.student.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        enrollments: {
          include: {
            course: true,
            payments: true,
          },
        },
      },
    });

    if (!student) {
      res.status(404).json({
        status: 'fail',
        message: 'No student found with that ID',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        student,
      },
    });
  },
);

export const createStudent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { courseId, amountReceived, ...studentData } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const course = await prisma.course.findUnique({
        where: {
          id: courseId,
        },
      });

      if (!course) {
        throw new AppError('Course not found', 404);
      }

      if (!course.isActive) throw new AppError('Course is not active', 400);

      if (amountReceived > course.fee) {
        throw new AppError(
          'Amount received cannot be greater than course fee',
          400,
        );
      }

      const student = await tx.student.create({
        data: {
          ...studentData,
        },
      });

      const enrollment = await tx.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
        },
      });

      await tx.payment.create({
        data: {
          amount: amountReceived,
          enrollmentId: enrollment.id,
        },
      });

      return student;
    });

    res.status(201).json({
      status: 'success',
      data: {
        student: result,
      },
    });
  },
);

export const updateStudent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...studentData } = req.body;
 
    const student = await prisma.student.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        ...studentData,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        student,
      },
    });
  },
);

export const deleteStudent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await prisma.student.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);
