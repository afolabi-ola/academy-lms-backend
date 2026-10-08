import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync';
import prisma from '../../lib/prisma';
import { Currency, ThemeMode } from '../../generated/prisma/browser';
import { uploadToCloudinary } from '../../utils/helpers';

export const DEFAULT_SETTINGS_ID = 1;

const DEFAULT_SETTINGS = {
  id: 1,
  appName: 'Academy LMS',
  appDescription: 'A modern learning management system',
  contactEmail: 'afolabiquadri28@gmail.com',

  logoUrl:
    'https://res.cloudinary.com/dxj0gqv1f/image/upload/v1690480915/academy-lms/academy-lms-logo.png',
  favicon:
    'https://res.cloudinary.com/dxj0gqv1f/image/upload/v1690480915/academy-lms/academy-lms-favicon.png',
  logoText: 'Academy LMS',

  defaultStudentPhoto:
    'https://res.cloudinary.com/gneyjc4o/image/upload/v1787933090/user_fqwnvn.jpg',

  themeMode: ThemeMode.LIGHT,
  primaryColor: '#eeeeee',
  secondaryColor: '#1b1b1b',
  accentColor: '#1b1b1b',
  backgroundColor: '#070707',

  timezone: 'Africa/Lagos',
  currency: Currency.NGN,
};

export const getSettings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const settings = await prisma.setting.upsert({
      where: {
        id: DEFAULT_SETTINGS_ID,
      },
      update: {},
      create: { ...DEFAULT_SETTINGS },
    });

    res.status(200).json({
      status: 'success',
      data: {
        settings,
      },
    });
  },
);

export const updateSettings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      appName,
      appDescription,
      contactEmail,
      timezone,
      currency,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      themeMode,
    } = req.body;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const logoFile = files?.logo?.[0];
    const faviconFile = files?.favicon?.[0];
    const defaultStudentPhotoFile = files?.defaultStudentPhoto?.[0];

    if (logoFile) {
      const fileId = req.user.isDemo
        ? `demo-logo-${DEFAULT_SETTINGS_ID.toString()}`
        : `logo-${DEFAULT_SETTINGS_ID.toString()}`;

      const { secure_url: logoUrl, publicId: logoUrlPublicId } =
        await uploadToCloudinary(
          logoFile.buffer,
          'settings',
          fileId,
          // `logo-${DEFAULT_SETTINGS_ID.toString()}`,
        );
      req.body.logoUrl = logoUrl;
      req.body.logoUrlPublicId = logoUrlPublicId;
    }

    if (faviconFile) {
      const fileId = req.user.isDemo
        ? `demo-favicon-${DEFAULT_SETTINGS_ID.toString()}`
        : `favicon-${DEFAULT_SETTINGS_ID.toString()}`;

      const { secure_url: faviconUrl, publicId: faviconUrlPublicId } =
        await uploadToCloudinary(
          faviconFile.buffer,
          'settings',
          fileId,
          // `favicon-${DEFAULT_SETTINGS_ID.toString()}`,
        );
      req.body.favicon = faviconUrl;
      req.body.faviconUrlPublicId = faviconUrlPublicId;
    }

    if (defaultStudentPhotoFile) {
      const fileId = req.user.isDemo
        ? `demo-default-student-photo-${DEFAULT_SETTINGS_ID.toString()}`
        : `default-student-photo-${DEFAULT_SETTINGS_ID.toString()}`;

      const {
        secure_url: defaultStudentPhotoUrl,
        publicId: defaultStudentPhotoUUrlPublicId,
      } = await uploadToCloudinary(
        defaultStudentPhotoFile.buffer,
        'settings',
        fileId,
        // `default-student-photo-${DEFAULT_SETTINGS_ID.toString()}`,
      );
      req.body.defaultStudentPhoto = defaultStudentPhotoUrl;
      req.body.defaultStudentPhotoUrlPublicId = defaultStudentPhotoUUrlPublicId;
    }

    const settings = await prisma.setting.update({
      where: {
        id: DEFAULT_SETTINGS_ID,
      },
      data: {
        appName,
        appDescription,
        contactEmail,
        timezone,
        currency,
        logoUrl: req.body.logoUrl,
        logoUrlPublicId: req.body.logoUrlPublicId,
        favicon: req.body.favicon,
        faviconPublicId: req.body.faviconUrlPublicId,
        defaultStudentPhoto: req.body.defaultStudentPhoto,
        defaultStudentPhotoPublicId: req.body.defaultStudentPhotoUrlPublicId,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        themeMode,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        settings,
      },
    });
  },
);
