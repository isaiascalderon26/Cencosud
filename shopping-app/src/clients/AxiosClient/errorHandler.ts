import { AxiosError } from "axios";

export class AxiosErrorHandler {
  constructor(readonly error: AxiosError) {}

  status(
    status: number,
    handler: (error: AxiosError) => void
  ): AxiosErrorHandler {
    if (this.error.response?.status === status) handler(this.error);
    return this;
  }

  badRequest(handler: (error: AxiosError) => void) {
    return this.status(404, handler);
  }

  unauthorized(handler: (error: AxiosError) => void) {
    return this.status(401, handler);
  }

  forbidden(handler: (error: AxiosError) => void) {
    return this.status(403, handler);
  }
}
