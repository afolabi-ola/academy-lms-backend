import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync';
import prisma from '../../lib/prisma';

export const getAllStudents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const students = await prisma.student.findMany();

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
    const student = await prisma.student.create({
      data: req.body,
    });

    res.status(201).json({
      status: 'success',
      data: {
        student,
      },
    });
  },
);

export const updateStudent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const student = await prisma.student.update({
      where: {
        id: Number(req.params.id),
      },
      data: req.body,
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
