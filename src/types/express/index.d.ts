import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        name: string;
        email: string;
        role: 'ADMIN' | 'SUB_ADMIN' | 'SUPER_ADMIN';
        active: boolean;
        isDemo: boolean;
      };
      imagePublicId?: string;
      imageUrl?: string;
    }
  }
}
