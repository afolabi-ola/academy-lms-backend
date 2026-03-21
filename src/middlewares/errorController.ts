import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../generated/prisma/client';
import AppError from '../utils/appError';

/**
 * Handle Prisma Known Request Errors (P2xxx codes)
 */
const handlePrismaKnownRequestError = (
  error: Prisma.PrismaClientKnownRequestError,
): AppError => {
  switch (error.code) {
    case 'P2000':
      return new AppError(
        `The provided value for the column is too long for the column's type`,
        400,
      );
    case 'P2001':
      return new AppError(
        `The record searched for in the where condition does not exist`,
        404,
      );
    case 'P2002': {
      const target = (error.meta?.target as string[]) || [];
      return new AppError(
        `Duplicate field value: ${target.join(', ')}. Please use another value!`,
        409,
      );
    }
    case 'P2003':
      return new AppError(
        `Foreign key constraint failed on the field: ${error.meta?.field_name}`,
        400,
      );
    case 'P2004':
      return new AppError(`A constraint failed on the database`, 400);
    case 'P2005':
      return new AppError(
        `The value stored in the database for the field is invalid for the field's type`,
        400,
      );
    case 'P2006':
      return new AppError(`The provided value for the field is not valid`, 400);
    case 'P2007':
      return new AppError(`Data validation error`, 400);
    case 'P2008':
      return new AppError(`Failed to parse the query`, 400);
    case 'P2009':
      return new AppError(`Failed to validate the query`, 400);
    case 'P2010':
      return new AppError(`Raw query failed`, 400);
    case 'P2011':
      return new AppError(`Null constraint violation`, 400);
    case 'P2012':
      return new AppError(`Missing a required value`, 400);
    case 'P2013':
      return new AppError(`Missing the required argument`, 400);
    case 'P2014':
      return new AppError(
        `The change you are trying to make would violate the required relation`,
        400,
      );
    case 'P2015':
      return new AppError(`A related record could not be found`, 404);
    case 'P2016':
      return new AppError(`Query interpretation error`, 400);
    case 'P2017':
      return new AppError(`The records for relation are not connected`, 400);
    case 'P2018':
      return new AppError(`The required connected records were not found`, 404);
    case 'P2019':
      return new AppError(`Input error`, 400);
    case 'P2020':
      return new AppError(`Value out of range for the type`, 400);
    case 'P2021':
      return new AppError(
        `The table does not exist in the current database`,
        500,
      );
    case 'P2022':
      return new AppError(
        `The column does not exist in the current database`,
        500,
      );
    case 'P2023':
      return new AppError(`Inconsistent column data`, 500);
    case 'P2024':
      return new AppError(
        `Timed out fetching a new connection from the connection pool`,
        503,
      );
    case 'P2025':
      return new AppError(`Record to delete does not exist`, 404);
    case 'P2026':
      return new AppError(
        `The current database provider doesn't support a feature that the query used`,
        400,
      );
    case 'P2027':
      return new AppError(
        `Multiple errors occurred on the database during query execution`,
        500,
      );
    case 'P2028':
      return new AppError(`Transaction API error`, 500);
    case 'P2030':
      return new AppError(
        `Cannot find a fulltext index to use for the search`,
        400,
      );
    case 'P2031':
      return new AppError(
        `Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set`,
        500,
      );
    case 'P2033':
      return new AppError(
        `A number used in the query does not fit into a 64 bit signed integer`,
        400,
      );
    case 'P2034':
      return new AppError(
        `Transaction failed due to a write conflict or a deadlock`,
        409,
      );
    default:
      return new AppError(`Database error occurred: ${error.message}`, 500);
  }
};

/**
 * Extract field-specific error from Prisma validation error message
 */
// const extractValidationError = (message: string): string => {
//   // Try to extract the last meaningful error message
//   const lines = message.split('\n');

//   // Look for "Argument" errors (missing required fields)
//   const argumentMatch = message.match(/Argument `([^`]+)` is missing/);
//   if (argumentMatch) {
//     return `The field '${argumentMatch[1]}' is required`;
//   }

//   // Look for "Unknown field" errors
//   const unknownFieldMatch = message.match(/Unknown field: `([^`]+)`/);
//   if (unknownFieldMatch) {
//     return `Unknown field '${unknownFieldMatch[1]}' provided`;
//   }

//   // Look for type mismatch errors
//   const typeMatch = message.match(
//     /Argument of type `([^`]+)` is not assignable/,
//   );
//   if (typeMatch) {
//     return `Invalid field type provided`;
//   }

//   // Look for type expected errors
//   const expectedTypeMatch = message.match(
//     /`([^`]+)` Argument of type `([^`]+)` is not assignable to parameter/,
//   );
//   if (expectedTypeMatch) {
//     return `Field '${expectedTypeMatch[1]}' has invalid type`;
//   }

//   // Extract from the last meaningful line that contains actual error info
//   for (let i = lines.length - 1; i >= 0; i--) {
//     const line = lines[i];
//     if (
//       line &&
//       !line.startsWith('{') &&
//       !line.startsWith('}') &&
//       !line.startsWith('+') &&
//       !line.startsWith('data:')
//       // &&
//       // !line.includes('Invalid') &&
//       // !line.includes('invocation')
//     ) {
//       return line.trim();
//     }
//   }

//   return 'Invalid input data provided';
// };

const extractValidationError = (message: string): string => {
  // Missing required field
  const missingField = message.match(/Argument `([^`]+)` is missing/);
  if (missingField) {
    return `The field '${missingField[1]}' is required`;
  }

  // Invalid value
  const invalidValue = message.match(/Invalid value for argument `([^`]+)`/);
  if (invalidValue) {
    return `Invalid value provided for '${invalidValue[1]}'`;
  }

  // Unknown field
  const unknownField = message.match(/Unknown field: `([^`]+)`/);
  if (unknownField) {
    return `Unknown field '${unknownField[1]}'`;
  }

  // Fallback
  return 'Invalid input data provided';
};;;;

/**
 * Handle Prisma Validation Errors
 */
const handlePrismaValidationError = (
  error: Prisma.PrismaClientValidationError,
): AppError => {
  const friendlyMessage = extractValidationError(error.message);
  return new AppError(friendlyMessage, 400);
};

/**
 * Handle Prisma Initialization Errors
 */
const handlePrismaInitializationError = (
  error: Prisma.PrismaClientInitializationError,
): AppError => {
  return new AppError(
    `Failed to initialize database connection: ${error.message}`,
    503,
  );
};

/**
 * Handle Prisma Rust Panic Errors
 */
const handlePrismaRustPanicError = (
  error: Prisma.PrismaClientRustPanicError,
): AppError => {
  return new AppError(`Internal database engine error: ${error.message}`, 500);
};

/**
 * Handle PostgreSQL-specific errors that might not be caught by Prisma
 */
const handlePostgreSQLError = (error: any): AppError => {
  // PostgreSQL error codes
  if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        return new AppError(`Duplicate value violates unique constraint`, 409);
      case '23503': // foreign_key_violation
        return new AppError(`Foreign key constraint violation`, 400);
      case '23502': // not_null_violation
        return new AppError(`Null value violates not-null constraint`, 400);
      case '23514': // check_violation
        return new AppError(`Value violates check constraint`, 400);
      case '22P02': // invalid_text_representation
        return new AppError(`Invalid input syntax`, 400);
      case '22001': // string_data_right_truncation
        return new AppError(`String data right truncation`, 400);
      case '22003': // numeric_value_out_of_range
        return new AppError(`Numeric value out of range`, 400);
      case '42P01': // undefined_table
        return new AppError(`Table does not exist`, 500);
      case '42703': // undefined_column
        return new AppError(`Column does not exist`, 500);
      case '08001': // sqlclient_unable_to_establish_sqlconnection
        return new AppError(`Unable to establish database connection`, 503);
      case '08006': // connection_failure
        return new AppError(`Database connection failure`, 503);
      case '57P01': // admin_shutdown
        return new AppError(`Database is shutting down`, 503);
      case '57P03': // cannot_connect_now
        return new AppError(`Database cannot accept connections now`, 503);
      case '53300': // too_many_connections
        return new AppError(`Too many database connections`, 503);
      case '40001': // serialization_failure
        return new AppError(`Transaction serialization failure`, 409);
      case '40P01': // deadlock_detected
        return new AppError(`Deadlock detected`, 409);
      default:
        return new AppError(`Database error: ${error.message}`, 500);
    }
  }

  return new AppError(`Unknown database error occurred`, 500);
};

/**
 * Send error response in development mode
 * Includes full error details and stack trace
 */
const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
    isOperational: err.isOperational || false,
  });
};

/**
 * Send error response in production mode
 * Only sends operational errors to client, logs programming errors
 */
const sendErrorProd = (err: any, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err.error || undefined,
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    // 1) Log error for developers
    console.error('ERROR 💥', err);

    // 2) Send generic message to client
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

/**
 * Global Error Handling Middleware
 * Handles all errors in the application
 */
const errorController = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      error = handlePrismaKnownRequestError(err);
    } else if (err instanceof Prisma.PrismaClientValidationError) {
      error = handlePrismaValidationError(err);
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
      error = handlePrismaInitializationError(err);
    } else if (err instanceof Prisma.PrismaClientRustPanicError) {
      error = handlePrismaRustPanicError(err);
    }
    // Handle PostgreSQL errors
    else if (err.code && typeof err.code === 'string') {
      error = handlePostgreSQLError(err);
    }
    // Handle validation errors from express-validator or similar
    else if (err.name === 'ValidationError') {
      error = new AppError(err.message, 400);
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token. Please log in again!', 401);
    } else if (err.name === 'TokenExpiredError') {
      error = new AppError('Your token has expired! Please log in again.', 401);
    }

    sendErrorProd(error, res);
  }
};

export default errorController;
