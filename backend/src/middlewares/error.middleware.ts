import { NextFunction, Request, Response } from 'express';
import { logger } from '@utils/logger';
import { NODE_ENV } from '@/config/index';
import { Exception } from '@/exceptions/Exception';

const isProduction = NODE_ENV === 'production';

const errorMiddleware = (error: Exception, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';
    const errorId: string = error.uuid;

    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, ID:: ${errorId}, Message:: ${message}`);
    if (isProduction && (status <= 400 || status >= 500)) {
      res.status(status).json({ message: 'Invalid Request', id: errorId });
    } else {
      res.status(status).json({ message: message, id: errorId });
    }
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
