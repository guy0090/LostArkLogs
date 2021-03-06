import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { Routes } from '@interfaces/routes.interface';
import { apiKeyMiddleware } from '@middlewares/auth.middleware';
import { limiterUsers } from '@/middlewares/limiting.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { ApiKeyDTO } from '@/dtos/auth.dto';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get the user's info
    this.router.post(
      `${this.path}/me`,
      [limiterUsers, validationMiddleware(ApiKeyDTO, 'body'), apiKeyMiddleware('body', ['users.self.get'], true)],
      this.usersController.getSelf,
    );

    // Get any user by ID
    // this.router.post(`${this.path}/get`, [limiterUsers, validationMiddleware(UserIdDTO, 'body')], this.usersController.getUser);
  }
}

export default UsersRoute;
