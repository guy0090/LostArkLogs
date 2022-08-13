import { v4 as uuidv4 } from 'uuid';

export class Exception extends Error {
  public status: number;
  public message: string;
  public uuid: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;

    this.uuid = uuidv4().replace(/-/g, '');
  }
}

export class HttpException extends Exception {
  constructor(status: number, message: string) {
    super(status, message);
  }
}

export class WsException extends Exception {
  constructor(status: number, message: string) {
    super(status, message);
  }
}
