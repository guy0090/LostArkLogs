import { NextFunction, RequestHandler, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import userModel from '@/models/user.model';
import SocketService from '@/controllers/socket.controller';
import { logger } from '@/utils/logger';
import { Event, Socket } from 'socket.io';
import cookie from 'cookie';
import { User } from '@/interfaces/users.interface';
import { hashMatch } from '@/utils/crypto';
import UserService from '@/services/users.service';
import PermissionsService from '@/services/permissions.service';
import { WsException } from '@/exceptions/WsException';

const users = new UserService();
const perms = new PermissionsService();

/**
 * Express middleware to handle authentication on HTTP requests.
 *
 * @param {string[] | undefined} permissions Optional: The permissions required to access the route.
 */
export const httpAuthMiddleware = (permissions?: string[]) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const refresh = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
      const access = req.cookies['at'] || (req.header('at').split('Bearer ')[1] ? req.header('at') : null);

      if (refresh) {
        const secretKey: string = SECRET_KEY;
        const refreshVerificationResponse = verify(refresh, secretKey) as DataStoredInToken;

        if (refreshVerificationResponse.exp * 1000 <= Date.now()) {
          next(new HttpException(403, 'Invalid Authorization'));
        } else {
          const userId = refreshVerificationResponse.i;
          let findUser: User = await users.findUserById(userId);

          let accessVerificationResponse: DataStoredInToken;
          if (access) {
            accessVerificationResponse = verify(access, secretKey) as DataStoredInToken;
            const userSalt = findUser.salt;
            const accessHash = accessVerificationResponse.h;

            if (!hashMatch(userId, userSalt, accessHash)) findUser = undefined;
          }

          if (findUser) {
            const hasPermission = permissions ? await perms.userHasPermissions(findUser._id, permissions) : true;
            if (hasPermission) {
              req.user = findUser;
              req.rt = refreshVerificationResponse;
              if (accessVerificationResponse) req.at = accessVerificationResponse;

              next();
            } else {
              next(new HttpException(403, 'Forbidden'));
            }
          } else {
            next(new HttpException(403, 'Invalid Authorization'));
          }
        }
      } else {
        next(new HttpException(401, 'Authentication Missing'));
      }
    } catch (error) {
      logger.error('Error in HTTP Auth Middleware:', error);
      next(new HttpException(500, 'Error During Authorization'));
    }
  };
};

/**
 * Express middleware to handle requests with API keys and optionally permissions.
 * Permission check defaults to `true` if no permissions are provided; TODO: change this?
 *
 * @param keyLocation Optional: The location of the API key in the request (e.g. 'query', 'body', 'params')
 * @param permissions Optional: the permission to check for the user
 * @param cookieFallback Optional: Whether to fallback to the auth cookie if the API key is not provided
 */
export const apiKeyMiddleware = (
  keyLocation: 'query' | 'body' | 'params' = 'query',
  permissions?: string[],
  cookieFallback = false,
): RequestHandler => {
  return async (req: RequestWithUser, _res: Response, next: NextFunction) => {
    try {
      const access = req[keyLocation].key as string;

      if (!access && cookieFallback) {
        logger.debug('No API key found in request, falling back to cookie');
        const refreshToken = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
        const accessToken = req.cookies['at'] || (req.header('at').split('Bearer ')[1] ? req.header('at') : null);

        if (refreshToken) {
          const secretKey: string = SECRET_KEY;
          const refreshVerificationResponse = verify(refreshToken, secretKey) as DataStoredInToken;

          if (refreshVerificationResponse.exp * 1000 <= Date.now()) {
            next(new HttpException(403, 'Invalid Authorization'));
          } else {
            const userId = refreshVerificationResponse.i;
            let findUser: User = await users.findUserById(userId);

            let accessVerificationResponse: DataStoredInToken;
            if (accessToken) {
              accessVerificationResponse = verify(accessToken, secretKey) as DataStoredInToken;
              const userSalt = findUser.salt;
              const accessHash = accessVerificationResponse.h;

              if (!hashMatch(userId, userSalt, accessHash)) findUser = undefined;
            }

            if (findUser) {
              const hasPermission = permissions ? await perms.userHasPermissions(findUser._id, permissions) : true;
              if (hasPermission) {
                req.user = findUser;
                next();
              } else {
                next(new HttpException(403, 'Unauthorized'));
              }
            } else {
              next(new HttpException(403, 'Invalid Authorization'));
            }
          }
        } else {
          next(new HttpException(401, 'Authentication Missing'));
        }
      } else {
        const user = await users.findByApiKey(access);
        const hasPermission = permissions ? await perms.userHasPermissions(user._id, permissions) : true;

        if (access === user.uploadKey && hasPermission) {
          req.user = user;
          next();
        } else {
          next(new HttpException(403, 'Unauthorized'));
        }
      }
    } catch (err) {
      logger.error('Error in API Key Middleware: ', err);
      next(new HttpException(401, 'Invalid Authorization'));
    }
  };
};

/**
 * Express middleware to handle authentication on Socket.io requests.
 *
 * @param socket The requesting socket
 * @param event The event being requested
 * @param next The next function to be called on successful or unsuccessful authentication
 */
export const socketAuthMiddleware = async (socket: Socket, event: Event, next: { (err?: Error): void; (): void }) => {
  try {
    const socketHeaders = socket.request.headers;
    const refresh = socketHeaders['cookie'] ? cookie.parse(socketHeaders['cookie']).Authorization : undefined;

    if (!event) {
      next(new WsException(409, 'Event Missing'));
    } else if (SocketService.requiresAuthorization(event[0])) {
      // If authorization is required, request body not be missing
      if (!event[1]) {
        next(new WsException(409, 'Event Body Missing'));
      } else if (refresh) {
        const secretKey: string = SECRET_KEY;
        const refreshVerificationResponse = verify(refresh, secretKey) as DataStoredInToken;

        if (refreshVerificationResponse.exp * 1000 <= Date.now()) {
          next(new WsException(401, 'Invalid Authorization'));
        } else {
          const userId = refreshVerificationResponse.i;
          let findUser = await userModel.findById(userId);

          const access = event[1].at || undefined;
          let accessVerificationResponse = undefined;
          if (access) {
            accessVerificationResponse = verify(access, secretKey);
            const userSalt = findUser.salt;
            const accessHash = accessVerificationResponse.h;

            if (!hashMatch(userId, userSalt, accessHash)) findUser = undefined;
          }

          if (findUser) {
            event[1].u = findUser;
            event[1].rt = refreshVerificationResponse;
            if (accessVerificationResponse) event[1].at = accessVerificationResponse;
            next();
          } else {
            next(new WsException(401, 'Access Denied'));
          }
        }
      } else {
        next(new WsException(404, 'Authentication Token Missing'));
      }
    } else {
      next();
    }
  } catch (error) {
    logger.error(error.message);
    next(new HttpException(401, 'Wrong Authentication Token'));
  }
};
