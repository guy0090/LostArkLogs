import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { User } from '@interfaces/users.interface';
import { SECRET_KEY, CLIENT_DOMAIN, SERVER_DOMAIN } from '@config';
import AuthService from '@services/auth.service';
import { HttpException } from '@/exceptions/Exception';
import UserService from '@/services/users.service';
import { hashMatch } from '@/utils/crypto';
import { DataStoredInToken, TokenData } from '@/objects/auth.object';
import { UserObject } from '@/objects/user.object';

class AuthController {
  public authService = new AuthService();
  public userService = new UserService();

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
      const access = req.cookies['at'] || null;
      const oAuthCode: string = req.body.code;

      /**
       * If the request contains a refresh token, verify it. If it successfully
       * verifies, we log the user in normally. If the token is invalid, we reject the request.
       *
       * If the request does not contain an authorization token, we attempt to register the user.
       */
      let refreshToken: TokenData, accessToken: TokenData, user: User;
      if (refresh) {
        const secretKey: string = SECRET_KEY;
        const refreshVerificationResponse = verify(refresh, secretKey) as DataStoredInToken;
        user = await this.userService.findUserById(refreshVerificationResponse.i);

        if (!user) throw new HttpException(400, 'Invalid User');

        let accessVerificationResponse: DataStoredInToken;
        if (access) {
          accessVerificationResponse = verify(access, secretKey) as DataStoredInToken;
          const userSalt = user.salt;
          const accessHash = accessVerificationResponse.h;
          if (!hashMatch(refreshVerificationResponse.i, userSalt, accessHash)) throw new HttpException(400, 'Invalid User');
        }

        const loggedIn = await this.authService.login(refreshVerificationResponse);
        refreshToken = loggedIn.refresh;
        accessToken = loggedIn.access;
        user = loggedIn.user;
      } else {
        const registered = await this.authService.register(oAuthCode);
        refreshToken = registered.refresh;
        accessToken = registered.access;
        user = registered.user;
      }

      res.cookie('Authorization', refreshToken.token, {
        expires: new Date(Date.now() + refreshToken.expiresIn * 1000),
        httpOnly: true,
        domain: SERVER_DOMAIN,
      });
      res.cookie(`at`, accessToken.token, {
        expires: new Date(Date.now() + accessToken.expiresIn * 1000),
        httpOnly: false,
        domain: CLIENT_DOMAIN,
      });

      res.status(200).json({ message: 'logged in', when: Date.now(), user: new UserObject(user) });
    } catch (error) {
      next(error);
    }
  };

  /**
   * No-auth revoke endpoint for easily revoking a user's access.
   *
   * @param {Request} req The request
   * @param {Response} res The response
   * @param {NextFunction} next The next function to be used to pass control to the next middleware.
   */
  public revoke = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie('Authorization', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
        domain: SERVER_DOMAIN,
      });
      res.cookie('at', '', {
        httpOnly: false,
        expires: new Date(0),
        path: '/',
        domain: CLIENT_DOMAIN,
      });
      res.status(200).json({ message: 'revoked' });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
