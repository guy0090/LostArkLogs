import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { NODE_ENV } from '@/config';
// import { logger } from '@utils/logger';

const validationMiddleware = (
  type: any,
  value: string | 'body' | 'query' | 'params' = 'body',
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return (req, res, next) => {
    validate(plainToInstance(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors: ValidationError[]) => {
      try {
        if (errors.length > 0) {
          const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
          next(new HttpException(400, NODE_ENV === 'production' ? 'Invalid Request Structure' : message));
        } else {
          next();
        }
      } catch (err) {
        next(new HttpException(500, NODE_ENV === 'production' ? 'Internal Server Error' : err.message));
      }
    });
  };
};

export default validationMiddleware;
