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
    this.router.get(
      `${this.path}/me`,
      [limiterUsers, validationMiddleware(ApiKeyDTO, 'query'), apiKeyMiddleware('query', 'user.self')],
      this.usersController.getUser,
    );
    // this.router.get(`${this.path}/:id`, authMiddleware, this.usersController.getUserById);
    // this.router.post(`${this.path}`, authMiddleware, this.usersController.createUser);
    // this.router.put(`${this.path}/:id`, authMiddleware, this.usersController.updateUser);
    // this.router.delete(`${this.path}/:id`, authMiddleware, this.usersController.deleteUser);
  }
}

export default UsersRoute;
