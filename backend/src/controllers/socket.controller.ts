import { Server, Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { socketAuthMiddleware } from '@/middlewares/auth.middleware';
import SocketService from '@/services/socket.service';
import PageService from '@/services/pages.service';
import PermissionsService from '@/services/permissions.service';
import { WsException } from '@/exceptions/WsException';
import LogsService from '@/services/logs.service';
import SocketHandler from '@/helpers/sockets/handlers/socket.handlers';
import { socketEvents } from '@/helpers/sockets/events/socket.events';
import SocketEvent from '@/objects/socketEvent.object';

class SocketController {
  public static io: Server;
  public static socketEvents = socketEvents;
  public static socketService = new SocketService();
  public static pageService = new PageService();
  public static permissionService = new PermissionsService();
  public static logService = new LogsService();

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
      socket.use(([event, ...args], next) => socketAuthMiddleware(socket, [event, ...args], next));

      await this.registerUserSocket(socket);

      socket.on('error', err => {
        logger.error(`[WS] Socket error: ${socket.id} | ${err.message}`);
      });

      socket.on('disconnecting', async () => {
        logger.info(`[WS] Socket disconnecting: ${socket.id}`);
        this.unregisterUserSocket(socket).catch(err => logger.error(`[WS] Socket disconnecting error: ${err.message}`));
      });
    });

    io.on('disconnection', socket => {
      logger.info(`[WS] Socket disconnected: ${socket.id}`);
    });

    io.on('disconnecting', socket => {
      logger.info(`[WS] Socket disconnecting: ${socket.id}`);
    });

    io.on('reconnect', socket => {
      logger.info(`[WS] Socket reconnect: ${socket.id}`);
    });
  }

  /**
   * Register a socket for a user.
   * @param socket The socket to register
   * @returns Nothing
   */
  public static async registerUserSocket(socket: Socket): Promise<void> {
    if (!socket) throw new WsException(500, 'Socket is not defined');

    let registered = false;
    try {
      const socketUser = await this.socketService.getUserId(socket);
      this.sockets[`${socketUser}`] = socket;
      registered = true;
      logger.info(`[WS] Associated socket ${socket.id} with user ${socketUser}`);
    } catch (socketGetErr) {
      if (socketGetErr.status === 404) logger.info(`[WS] Connecting socket ${socket.id} is not a verified user, skipping registration`);
      else logger.error(`[WS] Unexpected error registering socket ${socket.id}: ${socketGetErr.message}`);
    }

    this.registerEvents(socket, registered);
  }

  /**
   * Unregister a socket from the user.
   * @param socket The socket to unregister
   */
  private static async unregisterUserSocket(socket: Socket) {
    if (!socket) throw new WsException(500, 'Socket is not defined');

    try {
      const socketUser = await this.socketService.getUserId(socket);
      if (this.sockets[`${socketUser}`].id === socket.id) delete this.sockets[`${socketUser}`];
      logger.info(`[WS] Disassociated socket ${socket.id} with user ${socketUser}`);
    } catch (err) {
      if (err.status === 404) logger.info(`[WS] Disconnecting socket ${socket.id} is not a verified user, skipping unregister`);
      else logger.error(`[WS] Unexpected error unregistering socket ${socket.id}: ${err.message}`);
    }
  }

  /**
   * Register events for a socket.
   * @param socket The socket to register events for
   */
  public static registerEvents(socket: Socket, registered: boolean): void {
    if (!socket) throw new WsException(500, 'Socket is not defined');

    for (const event of this.socketEvents) {
      const eventName = event.name;
      const requiresAuth = event.requiresAuth();
      const handler = SocketHandler.getHandler(eventName);

      if (handler) {
        // If the event requires authentication and the user
        // is not authenticated, then we don't register the event
        if (requiresAuth && !registered) continue;

        // Register the handler for the event for the socket
        event.registerHandler(socket, handler);
      }
    }
  }

  /**
   * Check if a given event requires the user to be authenticated
   * and if so, if the user has the required permissions to call the event.
   *
   * @param eventName The socket event name
   * @returns If the event requires authorization
   */
  public static requiresAuthorization(eventName: string): boolean {
    const event = this.socketEvents.find(e => e.name === eventName);
    if (!event) return true;

    return event.requiresAuth();
  }

  public static getSocketEvent(eventName: string): SocketEvent {
    const event = this.socketEvents.find(e => e.name === eventName);
    return event;
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
