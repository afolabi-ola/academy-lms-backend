import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync';
import { searchService } from '../services/search.service';
import { User } from '../../generated/prisma/client';

export type SearchResult = {
  type:
    | 'student'
    | 'course'
    | 'user'
    | 'enrollment'
    | 'payment'
    | 'setting'
    | 'faq'
    | 'slider';
  id: number;
  title: string;
  subtitle: string;
  // Add other relevant fields based on your search results
};

export const searchAll = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Implementation for searching all resources

    const { query } = req.query;

    console.log({ query });

    // Perform search logic here (e.g., querying the database)

    // For demonstration purposes, let's assume we have a searchResults variable
    const searchResults = await searchService(
      query?.toString() || '',
      req.user as User,
    ); // Replace with actual search results

    res.status(200).json({
      status: 'success',
      data: {
        results: searchResults,
      },
    });
  },
);
