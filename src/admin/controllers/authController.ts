import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../middlewares/catchAsync';
import prisma from '../../lib/prisma';

import jwt from 'jsonwebtoken';
import AppError from '../../utils/appError';
import { comparePassword, createUser } from '../services/auth.service';
import { Role } from '../../generated/prisma/client';
import { registerSchema } from '../../validators/auth.schema';

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    const user = await createUser({ name, email, password });
    console.log({ user });
    console.log('we are after create user service');
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          ...user,
          password: undefined,
        },
      },
    });
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET! as string,
      {
        expiresIn:
          (process.env.JWT_EXPIRES_IN?.toString() as jwt.SignOptions['expiresIn']) ||
          '1h',
      },
    );

    res.cookie(process.env.COOKIE_NAME! || 'gigtech_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // secure: true,
      // sameSite: 'strict',
      sameSite: 'lax',
      maxAge: process.env.COOKIE_EXPIRES_IN
        ? parseInt(process.env.COOKIE_EXPIRES_IN) * 60 * 60 * 1000
        : 60 * 60 * 1000, // Default to 1 hour if not set
    });

    res.status(200).json({
      status: 'success',
      data: {
        token,
      },
    });
  },
);

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (
      req.cookies &&
      req.cookies[process.env.COOKIE_NAME! || 'gigtech_auth_token']
    ) {
      token = req.cookies[process.env.COOKIE_NAME! || 'gigtech_auth_token'];
    }

    if (!token) {
      res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.',
      });
      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET! as string,
      ) as jwt.JwtPayload;

      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          password: false,
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!currentUser) {
        res.status(401).json({
          status: 'fail',
          message: 'The user belonging to this token does no longer exist.',
        });
        return;
      }

      // Grant access to protected route
      req.user = currentUser;
      next();
    } catch (error) {
      res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please log in again.',
      });
    }
  },
);

export const restrictTo =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You are not permitted to perform this task', 403),
      );

    next();
  };
