import type { ContentfulStatusCode } from "hono/utils/http-status"

export class AppError extends Error {
  status: ContentfulStatusCode
  constructor(message: string, status: ContentfulStatusCode = 500) {
    super(message)
    this.name = this.constructor.name
    this.status = status
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400)
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation Error") {
    super(message, 422)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, 404)
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500)
  }
}

export class UTxOContentionError extends AppError {
  constructor(
    message = "A UTxO included in the transaction inputs was already spent.",
  ) {
    super(message, 409)
  }
}

export class BalanceTooLowError extends AppError {
  constructor(message = "Insufficient balance to perform transaction.") {
    super(message, 400)
  }
}

export class ScriptExecutionError extends AppError {
  constructor(message = "Smart Contract script execution failed.") {
    super(message, 400)
  }
}
