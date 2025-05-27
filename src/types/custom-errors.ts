export interface CustonErrorInterface extends Error {
  statusCode: number;
  errorCode?: string;
}

export class CustomError extends Error implements CustonErrorInterface {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string,
  ) {
    super(message);
    this.name = "CustomError";
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
