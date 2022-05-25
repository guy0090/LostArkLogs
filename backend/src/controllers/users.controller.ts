import { NextFunction, Response } from 'express';
import { User } from '@interfaces/users.interface';
import userService from '@services/users.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { UserObject } from '@/objects/user.object';

class UsersController {
  public userService = new userService();

  /**
   * Get the user found in the request reformatted to not include sensitive information.
   *
   * @param req Request with user object
   * @param res Response object
   * @param next The next function to be called on fail to pass along to error middleware
   */
  public getUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findUser: User = req.user;
      res.status(200).json(new UserObject(findUser));
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
