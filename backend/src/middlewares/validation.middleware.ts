import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import { HttpException } from '@exceptions/Exception';

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
          next(new HttpException(400, message));
        } else {
          next();
        }
      } catch (err) {
        next(new HttpException(500, err.message));
      }
    });
  };
};

export default validationMiddleware;
