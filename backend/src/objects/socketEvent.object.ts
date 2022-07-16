import { Socket } from 'socket.io';

/**
 * Utility class for registering socket events and their respective handlers.
 */
class SocketEvent {
  /**
   * @description The event name
   */
  private event: string;
  /**
   * @description Whether the event requires authentication
   */
  private auth: boolean;
  /**
   * @description The permissions required to call the event
   */
  private permissions: string[];

  /**
   * @param event The event to register
   * @param auth Whether the event requires authentication
   * @param permissions The permissions required to call the event
   */
  constructor(event: string, auth: boolean, permissions: string[]) {
    this.event = event;
    this.auth = auth;
    this.permissions = permissions;
  }

  /**
   * @returns The event name
   */
  get name(): string {
    return this.event;
  }

  /**
   * @returns The permissions required to call the event
   */
  get perms(): string[] {
    return this.permissions;
  }

  /**
   * @returns Whether the event requires authentication
   */
  public requiresAuth(): boolean {
    return this.auth;
  }

  /**
   * Register a handler for a socket.
   *
   * @param socket The socket to register the event for
   * @param handler The handler to register
   */
  public registerHandler(socket: Socket, handler: (args: any, callback: any) => void | Promise<void>): void {
    socket.on(this.event, handler);
  }

  /**
   * Unregister a handler for a socket.
   *
   * @param socket The socket to unregister the event for
   * @param handler The handler to unregister
   */
  public unregisterHandler(socket: Socket, handler: (args: any, callback: any) => void | Promise<void>): void {
    socket.off(this.event, handler);
  }
}

export default SocketEvent;
