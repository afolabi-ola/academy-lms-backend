import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../middlewares/catchAsync';
import prisma from '../../lib/prisma';

import jwt from 'jsonwebtoken';
import AppError from '../../utils/appError';
import {
  comparePassword,
  createUser,
  hashPassword,
} from '../services/auth.service';
import { Role } from '../../generated/prisma/client';

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

    if (!user.active) {
      res.status(403).json({
        status: 'fail',
        message:
          'Your account is deactivated. Please contact the administrator.',
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
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET! as string,
      {
        expiresIn:
          (process.env.JWT_EXPIRES_IN?.toString() as jwt.SignOptions['expiresIn']) ||
          '1h',
      },
    );

    res.cookie(process.env.COOKIE_NAME! || 'academy_lms_auth_token', token, {
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
      req.cookies[process.env.COOKIE_NAME || 'academy_lms_auth_token']
    ) {
      token = req.cookies[process.env.COOKIE_NAME || 'academy_lms_auth_token'];
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
          active: true,
          isDemo: true,
        },
      });

      if (!currentUser) {
        res.status(401).json({
          status: 'fail',
          message: 'The user belonging to this token does no longer exist.',
        });
        return;
      }

      if (!currentUser.active) {
        res.status(403).json({
          status: 'fail',
          message:
            'Your account is deactivated. Please contact the administrator.',
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

export const logout = (req: Request, res: Response) => {
  res.cookie(process.env.COOKIE_NAME! || 'academy_lms_auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0), // Set the cookie to expire in the past
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

export const getProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  },
);

export const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    const { name, email } = req.body;

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name : user.name,
        email: email !== undefined ? email : user.email,
      },
      select: {
        password: false,
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    });
  },
);

export const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const { currentPassword, newPassword } = req.body;

    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        password: true,
      },
    });

    if (!userWithPassword) {
      return next(new AppError('User not found', 404));
    }

    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      userWithPassword.password,
    );

    if (!isCurrentPasswordValid) {
      return next(new AppError('Current password is incorrect', 401));
    }

    const hashedNewPassword = await hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
      },
      select: {
        password: false,
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
      data: {
        user: updatedUser,
      },
    });
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

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        users: allUsers,
      },
    });
  },
);

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  },
);

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const targetUserId = Number(req.params.id);
    const { name, email, role, active } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: targetUserId,
      },
    });

    if (!existingUser) {
      return next(new AppError('No user found with that ID', 404));
    }

    if (
      user.id === targetUserId &&
      (role !== undefined || active !== undefined)
    ) {
      return next(
        new AppError('You cannot change your own role or account status', 403),
      );
    }

    if (existingUser.role === 'SUPER_ADMIN') {
      return next(
        new AppError('The super administrator account cannot be modified', 403),
      );
    }

    if (user.role === 'ADMIN' && existingUser.role === 'ADMIN') {
      return next(
        new AppError('You are not permitted to update this user', 403),
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: targetUserId,
      },
      data: {
        name: name !== undefined ? name : existingUser.name,
        email: email !== undefined ? email : existingUser.email,
        role: role !== undefined ? role : existingUser.role,
        active: active !== undefined ? active : existingUser.active,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: {
          ...updatedUser,
          password: undefined,
        },
      },
    });
  },
);

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const targetUserId = Number(req.params.id);

    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!existingUser) {
      return next(new AppError('No user found with that ID', 404));
    }

    if (user.id === targetUserId) {
      return next(new AppError('You cannot delete your own account', 403));
    }

    if (existingUser.role === 'SUPER_ADMIN') {
      return next(
        new AppError('The super administrator account cannot be deleted', 403),
      );
    }

    if (user.role === 'ADMIN' && existingUser.role === 'ADMIN') {
      return next(
        new AppError('You are not permitted to delete this user', 403),
      );
    }

    await prisma.user.delete({
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

export const checkIsDemoUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user.isDemo) {
      return next(
        new AppError(
          'Demo user cannot perform this action. Please create your own account.',
          403,
        ),
      );
    }

    next();
  },
);