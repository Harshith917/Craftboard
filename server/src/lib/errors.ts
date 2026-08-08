// Custom HTTP error carrying a status code, mirroring NestJS's HttpException behavior.
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

export class BadRequestException extends HttpError {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

export class UnauthorizedException extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenException extends HttpError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundException extends HttpError {
  constructor(message = 'Not Found') {
    super(404, message);
  }
}

export class ConflictException extends HttpError {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}

export class GoneException extends HttpError {
  constructor(message = 'Gone') {
    super(410, message);
  }
}

export class UnprocessableEntityException extends HttpError {
  constructor(message = 'Unprocessable Entity') {
    super(422, message);
  }
}

// Wraps an async route handler so rejected promises are forwarded to the
// global error handler (mirrors NestJS's default exception handling).
export const asyncHandler =
  (fn: (req: any, res: any, next: any) => Promise<void>) =>
  (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
