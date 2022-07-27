import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';
import { NODE_ENV } from '@/config/index';
import { stat } from 'fs';

const isProduction = NODE_ENV === 'production';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';

    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    res.status(status).json({ message: isProduction || status <= 400 || status >= 500 ? 'Invalid Request' : message });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
