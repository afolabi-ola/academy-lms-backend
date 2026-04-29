import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync';
import prisma from '../../lib/prisma';
import AppError from '../../utils/appError';
import deleteFile from '../../utils/deleteImage';
import { ResourceFolders } from '../../middlewares/uploadImage';
import buildImageUrl from '../../utils/buildImageUrl';


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
        photo: true,
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

    const studentsWithPhoto = students.map((student) =>
      student.photo
        ? {
            ...student,
            photo: buildImageUrl(
              req,
              ResourceFolders['student'],
              student.photo,
            ),
          }
        : student,
    );
    
      
    res.status(200).json({
      status: 'success',
      results: students.length,
      data: {
        students: studentsWithPhoto,
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

    const imageUrl = buildImageUrl(
      req,
      ResourceFolders['student'],
      student.photo || '',
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        student: {
          ...student,
          photo: imageUrl,
        },
      },
    });
  },
);

export const createStudent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { courseId, amountReceived, ...studentData } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const course = await tx.course.findUnique({
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
          photo: req.file?.filename,
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
        student: {
          ...result,
          photo: req.imageUrl,
        },
      },
    });
  },
);

export const updateStudent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...studentData } = req.body;

    const student = await prisma.student.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!student) {
      return next(new AppError('No student found with that ID', 404));
    }

    const updatedStudent = await prisma.student.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        ...studentData,
        photo: req.file?.filename,
      },
    });

    if (req.file?.filename && student.photo) {
      deleteFile(ResourceFolders['student'], student.photo);
    }

    res.status(200).json({
      status: 'success',
      data: {
        student: {
          ...updatedStudent,
          photo: req.imageUrl,
        },
      },
    });
  },
);

export const deleteStudent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const student = await prisma.student.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!student) {
      return next(new AppError('No student found with that ID', 404));
    }

    // await prisma.student.delete({
    //   where: {
    //     id: Number(req.params.id),
    //   },
    // });

    await prisma.student.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        active: false,
      },
    });

    if (student.photo) {
      deleteFile(ResourceFolders['student'], student.photo);
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);
