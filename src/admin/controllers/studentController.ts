import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync';
import prisma from '../../lib/prisma';
import AppError from '../../utils/appError';
import { ResourceFolders } from '../../middlewares/uploadImage';
import { sendEmail } from '../../utils/email';
import { uploadToCloudinary } from '../../utils/helpers';


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

    res.status(200).json({
      status: 'success',
      results: students.length,
      data: {
        students: students,
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
        student: student,
      },
    });
  }
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
          photo: process.env.CLOUDINARY_DEFAULT_STUDENT_AVATAR || '',
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

    if (!req.file?.buffer) {
      res.status(201).json({
        status: 'success',
        data: {
          student: result,
        },
      });
      return;
    }

    const fileId = req.user.isDemo
      ? `demo-student-photo-${result.id.toString()}`
      : `student-photo-${result.id.toString()}`;

    const { secure_url, publicId } = await uploadToCloudinary(
      req.file.buffer,
      ResourceFolders['student'],
      fileId,
      // result.id.toString(),
    );

    const updatedStudent = await prisma.student.update({
      where: {
        id: result.id,
      },
      data: {
        photo: secure_url,
        publicId,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { student: updatedStudent },
    });

    if (result) {
      await sendEmail(
        result.email,
        'Welcome to Academy LMS Academy!',
        `Dear ${result.firstname},\n\nThank you for enrolling in our course! We are excited to have you on board and look forward to helping you achieve your learning goals.\n\nBest regards,\nAcademy LMS Academy Teams`,
      ).catch((err) => {
        console.error('Email Failed:', err);
      });
    }
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

    let imageUrl: string | undefined;
    let publicId: string | undefined;

    if (req.file?.buffer) {
      const fileId = req.user.isDemo
        ? `demo-student-photo-${student.id.toString()}`
        : `student-photo-${student.id.toString()}`;
      
      const { secure_url, publicId: newPublicId } = await uploadToCloudinary(
        req.file.buffer,
        ResourceFolders['student'],
        fileId,
        // student.id.toString(),
      );
      imageUrl = secure_url;
      publicId = newPublicId;
    }

    const updatedStudent = await prisma.student.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        ...studentData,
        photo: imageUrl || student.photo,
        publicId: publicId || student.publicId,
      },
    });


    res.status(200).json({
      status: 'success',
      data: {
        student: updatedStudent,
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

    await prisma.student.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        active: false,
      },
    });


    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);
