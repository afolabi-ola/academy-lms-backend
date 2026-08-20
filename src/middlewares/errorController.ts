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
      return new AppError(`The provided value for the column is too long`, 400);
    case 'P2001':
      return new AppError(`The searched record does not exist`, 404);
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
      return new AppError(`Invalid value stored for field type`, 400);
    case 'P2006':
      return new AppError(`The provided value for the field is not valid`, 400);
    case 'P2007':
      return new AppError(`Data validation error`, 400);
    case 'P2008':
      return new AppError(`Failed to parse query`, 400);
    case 'P2009':
      return new AppError(`Failed to validate query`, 400);
    case 'P2010':
      return new AppError(`Raw query failed`, 400);
    case 'P2011':
      return new AppError(`Null constraint violation`, 400);
    case 'P2012':
      return new AppError(`Missing a required value`, 400);
    case 'P2013':
      return new AppError(`Missing required argument`, 400);
    case 'P2014':
      return new AppError(`Change violates required relation`, 400);
    case 'P2015':
      return new AppError(`Related record could not be found`, 404);
    case 'P2016':
      return new AppError(`Query interpretation error`, 400);
    case 'P2017':
      return new AppError(`The records for relation are not connected`, 400);
    case 'P2018':
      return new AppError(`Required connected records were not found`, 404);
    case 'P2019':
      return new AppError(`Input error`, 400);
    case 'P2020':
      return new AppError(`Value out of range for the type`, 400);
    case 'P2021':
      return new AppError(`Table does not exist in current database`, 500);
    case 'P2022':
      return new AppError(`Column does not exist in current database`, 500);
    case 'P2023':
      return new AppError(`Inconsistent column data`, 500);
    case 'P2024':
      return new AppError(`Timed out fetching connection from pool`, 503);
    case 'P2025':
      return new AppError(`Record to update or delete does not exist`, 404);
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
        `Transaction failed due to write conflict/deadlock`,
        409,
      );
    default:
      return new AppError(`Database error: ${error.message}`, 500);
  }
};

/**
 * Extract user-friendly validation error message
 */
const extractValidationError = (message: string): string => {
  const missingField = message.match(/Argument `([^`]+)` is missing/);
  if (missingField) return `The field '${missingField[1]}' is required`;

  const invalidValue = message.match(/Invalid value for argument `([^`]+)`/);
  if (invalidValue) return `Invalid value provided for '${invalidValue[1]}'`;

  const unknownField = message.match(/Unknown field: `([^`]+)`/);
  if (unknownField) return `Unknown field '${unknownField[1]}'`;

  return 'Invalid input data provided';
};

const handlePrismaValidationError = (
  error: Prisma.PrismaClientValidationError,
): AppError => {
  const friendlyMessage = extractValidationError(error.message);
  return new AppError(friendlyMessage, 400);
};

/**
 * Handle Prisma Initialization Errors (Failed initial connection)
 */
const handlePrismaInitializationError = (
  error: Prisma.PrismaClientInitializationError,
): AppError => {
  return new AppError(
    `Database connection failed. Please try again shortly.`,
    503,
  );
};

/**
 * Handle Prisma Unknown Errors (Network drops during queries, ENETUNREACH, etc.)
 */
const handlePrismaUnknownRequestError = (
  error: Prisma.PrismaClientUnknownRequestError,
): AppError => {
  if (
    error.message.includes('ENETUNREACH') ||
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('ETIMEDOUT')
  ) {
    return new AppError('Database network connection lost. Please retry.', 503);
  }
  return new AppError('An unexpected database query error occurred.', 500);
};

/**
 * Handle Prisma Rust Panic Errors
 */
const handlePrismaRustPanicError = (
  error: Prisma.PrismaClientRustPanicError,
): AppError => {
  return new AppError(`Internal database engine error`, 500);
};

/**
 * Handle Direct PostgreSQL driver errors
 */
const handlePostgreSQLError = (error: any): AppError => {
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
    case '08006': // connection_failure
    case '57P03': // cannot_connect_now
      return new AppError(`Database connection unavailable`, 503);
    case '57P01': // admin_shutdown
      return new AppError(`Database is shutting down`, 503);
    case '53300': // too_many_connections
      return new AppError(`Too many database connections`, 503);
    case '40001': // serialization_failure
      return new AppError(`Transaction serialization failure`, 409);
    case '40P01': // deadlock_detected
      return new AppError(`Deadlock detected`, 409);
    default:
      return new AppError(`Database error occurred`, 500);
  }
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
const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or unknown errors: don't leak details
    console.error('ERROR 💥', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong on our end!',
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
  console.error('🔍 RAW ERROR:', err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    // Covers 'production' and any other non-development env (test, staging, unset, etc.)
    let error: AppError;

    if (err instanceof AppError) {
      error = err;
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      error = handlePrismaKnownRequestError(err);
    } else if (err instanceof Prisma.PrismaClientValidationError) {
      error = handlePrismaValidationError(err);
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
      error = handlePrismaInitializationError(err);
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
      error = handlePrismaUnknownRequestError(err);
    } else if (err instanceof Prisma.PrismaClientRustPanicError) {
      error = handlePrismaRustPanicError(err);
    } else if (err.code && typeof err.code === 'string') {
      error = handlePostgreSQLError(err);
    } else if (err.name === 'ValidationError') {
      error = new AppError(err.message, 400);
    } else if (err.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token. Please log in again!', 401);
    } else if (err.name === 'TokenExpiredError') {
      error = new AppError('Your token has expired! Please log in again.', 401);
    } else {
      // Unhandled operational errors wrapped into AppError
      error = new AppError(
        err.isOperational ? err.message : 'Something went wrong!',
        err.statusCode || 500,
      );
      error.isOperational = err.isOperational || false;
    }

    sendErrorProd(error, res);
  }
};

export default errorController;
