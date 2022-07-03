import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
// import { CreateUserDto } from '@dtos/users.dto';
import { RegisterDTO } from '@dtos/register.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { limiterAuth } from '@/middlewares/limiting.middleware';

class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.post(`${this.path}register`, validationMiddleware(RegisterDTO, 'body'), this.authController.register);
    this.router.post(`${this.path}/login`, [limiterAuth, validationMiddleware(RegisterDTO, 'body')], this.authController.logIn);
    this.router.post(`${this.path}/revoke`, this.authController.revoke);
  }
}

export default AuthRoute;
