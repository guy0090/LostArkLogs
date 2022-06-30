import http from 'http';
import https from 'https';
import fs from 'fs';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { connect, set } from 'mongoose';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS, SSL_KEY, SSL_CERT } from '@config';
import { dbConnection, redisConnection } from '@databases';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { Server } from 'socket.io';
import SocketController from '@/controllers/socket.controller';
import RoleService from '@/services/roles.service';
import PageService from '@/services/pages.service';
import RedisService from '@/services/redis.service';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public io: Server;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.connectToRedis();
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    // this.initializeSwagger();
    this.initializeErrorHandling();
    this.initializeDefaultCollections();
  }

  public listen() {
    let server: https.Server | http.Server | undefined = undefined;
    if (this.env === 'production') {
      try {
        const key = fs.readFileSync(SSL_KEY);
        const cert = fs.readFileSync(SSL_CERT);
        server = https.createServer({ key: key, cert: cert }, this.app);
      } catch (sslErr) {
        logger.error(`SSL Invalid, using HTTP: ${sslErr.message}`);
        server = http.createServer(this.app);
      }
    } else {
      server = http.createServer(this.app);
    }

    // Webserver Start
    server.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on port ${this.port}`);
      logger.info(`=================================`);
    });

    // WebSocket Start
    this.io = new Server(server, {
      path: '/ws',
      cors: {
        origin: ORIGIN,
        credentials: CREDENTIALS,
      },
    });

    SocketController.initializeSocket(this.io);
  }

  public getServer() {
    return this.app;
  }

  private connectToRedis() {
    RedisService.connect(redisConnection.port, redisConnection.host);
  }

  private connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }

    connect(dbConnection.url, dbConnection.options);
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private async initializeDefaultCollections() {
    // Initialize default collections
    try {
      await RoleService.initializeRoles();
      await PageService.initializePages();
    } catch (err) {
      throw err;
    }
  }
}

export default App;
