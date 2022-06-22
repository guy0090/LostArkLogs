import { Server, Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { socketAuthMiddleware } from '@/middlewares/auth.middleware';
import SocketService from '@/services/socket.service';
import { User } from '@/interfaces/users.interface';
import PageService from '@/services/pages.service';
import PermissionsService from '@/services/permissions.service';
import { WsException } from '@/exceptions/WsException';

class SocketController {
  public static io: Server;
  public static socketService = new SocketService();
  public static pageService = new PageService();
  public static permissionService = new PermissionsService();

  /**
   * Event definitions.
   *
   * Describes event permissions and/or if authorization is required.
   *
   * If the event being requested is not in this dictionary, it is assumed to
   * require authorization.
   */
  public static events = {
    connect: {
      auth: false,
    },
    tokens: {
      auth: true,
      permissions: [],
    },
    page_access: {
      auth: true,
      permissions: [],
    },
    send_command: {
      auth: true,
      permissions: [],
    },
    permissions: {
      auth: true,
      permissions: [],
    },
  };

  /**
   * Sockets associated with users
   */
  public static sockets = {};

  /**
   * Initialize the socket.io server.
   */
  public static initializeSocket(io: Server): void {
    this.io = io;

    io.on('connection', async socket => {
      this.registerUserSocket(socket);
      socket.use(([event, ...args], next) => socketAuthMiddleware(socket, [event, ...args], next));

      await this.registerEvents(socket);

      socket.on('error', err => {
        logger.error(`🔴 Socket error: ${socket.id} | ${err.message}`);
      });

      socket.on('disconnecting', async () => {
        logger.info(`🔴 Socket disconnecting: ${socket.id}`);
        this.unregisterUserSocket(socket).catch(err => logger.error(`🔴 Socket disconnecting error: ${err.message}`));
      });
    });

    io.on('disconnection', socket => {
      logger.info(`🔴 Socket disconnected: ${socket.id}`);
    });

    io.on('disconnecting', socket => {
      logger.info(`🔴 Socket disconnecting: ${socket.id}`);
    });

    io.on('reconnect', socket => {
      logger.info(`🔵 Socket reconnect: ${socket.id}`);
    });
  }

  /**
   * Register a socket for a user.
   * @param socket The socket to register
   * @returns Nothing
   */
  public static async registerUserSocket(socket: Socket): Promise<void> {
    if (!socket) throw new WsException(500, 'Socket is not defined');

    try {
      const socketUser = await this.socketService.getUser(socket);
      this.sockets[`${socketUser}`] = socket;
      // logger.info(`Associated socket ${socket.id} with user ${socketUser}`);
    } catch (socketGetErr) {
      if (socketGetErr.status === 404) logger.info(`Connecting socket ${socket.id} is not a verified user`);
      else logger.error(`Unexpected error registered socket ${socket.id}: ${socketGetErr.message}`);
    }
  }

  /**
   * Unregister a socket from the user.
   * @param socket The socket to unregister
   * @returns Nothing
   */
  private static async unregisterUserSocket(socket: Socket): Promise<void> {
    if (!socket) throw new WsException(500, 'Socket is not defined');

    return new Promise((resolve, reject) => {
      this.socketService
        .getUser(socket)
        .then(socketUser => {
          if (this.sockets[`${socketUser}`].id === socket.id) delete this.sockets[`${socketUser}`];
          logger.info(`Disassociated socket ${socket.id} with user ${socketUser}`);
          resolve();
        })
        .catch(socketGetErr => {
          if (socketGetErr.status === 404) {
            logger.info(`Disconnecting socket ${socket.id} is not a verified user`);
            resolve();
          } else reject(socketGetErr);
        });
    });
  }

  /**
   * Register events for a socket.
   * @param socket The socket to register events for
   */
  public static async registerEvents(socket: Socket): Promise<void> {
    if (!socket) throw new WsException(500, 'Socket is not defined');

    /**
     * Event for getting the user's access token.
     * Also sends user related data to reduce calls required on first
     */
    socket.on('tokens', async (args, callback) => {
      try {
        const { access, uploadKey, returnedUser } = await this.socketService.refreshToken(args);
        const permissions = await this.permissionService.getPermissions(args.u._id);

        callback({ at: access, u: returnedUser, ut: uploadKey, p: permissions });
      } catch (err) {
        logger.error(`Error refreshing access token for ${socket.id}: ${err.message}`);
        callback({ failed: true });
      }
    });

    /**
     * Event for checking if a user has access to a page.
     */
    socket.on('page_access', async (args, callback) => {
      try {
        const page: string = args.page;

        const { permissions } = await this.pageService.getPageByName(page);
        let access = false;

        if (permissions.length === 0) {
          access = true;
        } else {
          access = await this.permissionService.userHasPermissions(args.u._id, permissions);
        }

        logger.info(`Authorized ${socket.id} to access page ${page}: ${access}`);

        callback({ access: access });
      } catch (err) {
        logger.error(`Error authorizing page access for ${socket.id}`);
        callback({ access: false });
      }
    });

    /**
     * Event for getting a user's permissions.
     */
    socket.on('permissions', async (args, callback) => {
      try {
        if (!args.p) {
          callback({ p: false });
        } else {
          const permission = args.p as string;
          const user: User = args.u as User;
          const hasPermission = await this.permissionService.userHasPermissions(user._id, [permission]);
          callback({ p: hasPermission });
        }
      } catch (err) {
        logger.error(`Error getting permission ${args.p} for ${socket.id}: ${err.message}`);
        callback({ p: false });
      }
    });

    /**
     * TESTING FOO
     * SEND A COMMAND TO A TARGET CLIENT
     */
    socket.on('send_command', async (args, callback) => {
      const requestingUser = args.u as User;
      const canAccess = await this.permissionService.userHasPermissions(requestingUser._id, ['send_command']);

      if (args.cmd && canAccess) {
        const targetUser = args.t as string;
        try {
          await this.socketService.sendUserMessage(targetUser, args.cmd);
          callback({ success: true });
        } catch (sendErr) {
          callback({ err: sendErr.message });
        }
      } else {
        callback({ err: 'Unauthorized' });
      }
    });
  }

  /**
   * Check if a given event requires the user to be authenticated
   * and if so if the user has the required permissions to call the event.
   *
   * @param event The socket event name
   * @returns If the event requires authorization
   */
  public static requiresAuthorization(event: string): Boolean {
    if (!SocketController.events[event.toLowerCase()]) return true;
    else return SocketController.events[event.toLowerCase()].auth;
  }

  /**
   * Get the socket associated with a user.
   * @param userId The user id to get the socket for
   * @returns The socket associated with the user if it exists
   */
  public static getSocket(userId: string): Socket {
    // if (!this.sockets[userId]) return undefined;
    return this.sockets[userId];
  }
}

export default SocketController;
