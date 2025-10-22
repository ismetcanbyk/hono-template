export type AppErrorOptions = {
  status?: number;
  code?: string;
  details?: unknown;
  expose?: boolean;
  cause?: unknown;
};

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly expose: boolean;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = "AppError";
    this.status = options.status ?? 500;
    this.code = options.code ?? "INTERNAL_SERVER_ERROR";
    this.details = options.details;
    this.expose = options.expose ?? this.status < 500;
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }

  static badRequest(message = "Bad Request", details?: unknown) {
    return new AppError(message, {
      status: 400,
      code: "BAD_REQUEST",
      details,
      expose: true,
    });
  }

  static unauthorized(message = "Unauthorized", details?: unknown) {
    return new AppError(message, {
      status: 401,
      code: "UNAUTHORIZED",
      details,
      expose: true,
    });
  }

  static forbidden(message = "Forbidden", details?: unknown) {
    return new AppError(message, {
      status: 403,
      code: "FORBIDDEN",
      details,
      expose: true,
    });
  }

  static notFound(message = "Not Found", details?: unknown) {
    return new AppError(message, {
      status: 404,
      code: "NOT_FOUND",
      details,
      expose: true,
    });
  }

  static conflict(message = "Conflict", details?: unknown) {
    return new AppError(message, {
      status: 409,
      code: "CONFLICT",
      details,
      expose: true,
    });
  }

  static unprocessable(message = "Unprocessable Entity", details?: unknown) {
    return new AppError(message, {
      status: 422,
      code: "UNPROCESSABLE_ENTITY",
      details,
      expose: true,
    });
  }

  static tooManyRequests(message = "Too Many Requests", details?: unknown) {
    return new AppError(message, {
      status: 429,
      code: "TOO_MANY_REQUESTS",
      details,
      expose: true,
    });
  }

  static internal(message = "Internal Server Error", details?: unknown) {
    return new AppError(message, {
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
      details,
      expose: false,
    });
  }
}

export function isAppError(error: unknown): error is AppError {
  return (
    error instanceof AppError ||
    (typeof error === "object" &&
      error !== null &&
      (error as any).name === "AppError")
  );
}
