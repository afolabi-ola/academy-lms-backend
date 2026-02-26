/**
 * Custom Application Error Class
 * Distinguishes between operational and non-operational errors
 */
export default class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public error?: (string | { field: string; message: string })[] | undefined;

  constructor(
    message: string,
    statusCode: number,
    error?: (string | { field: string; message: string })[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.error = error || undefined;

    Error.captureStackTrace(this, this.constructor);
  }
}
