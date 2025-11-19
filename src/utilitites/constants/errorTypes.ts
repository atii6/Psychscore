import { FileContentError } from "../types/fileContentError";

export class NotFoundError extends Error {
  constructor(message = "Not Found") {
    super();
    this.message = message;
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super();
    this.message = message;
  }
}

export class BadRequestError extends Error {
  constructor(message = "Bad Request") {
    super();
    this.message = message;
  }
}

export class ValidationError extends Error {
  validationErrors: FileContentError[];
  constructor(
    validationErrors: FileContentError[],
    message = "ValidationError"
  ) {
    super();
    this.message = message;
    this.validationErrors = validationErrors;
  }
}
