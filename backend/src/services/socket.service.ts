import { Socket } from 'socket.io';
import AuthService from '@/services/auth.service';
import cookie from 'cookie';
import { WsException } from '@/exceptions/WsException';
import { SECRET_KEY } from '@/config';
import { verify } from 'jsonwebtoken';
import SocketController from '@/controllers/socket.controller';
import { UserObject } from '@/objects/user.object';
import { DataStoredInToken } from '@/objects/auth.object';

class SocketService {
  public authService = new AuthService();

  /**
   * Create a new login token for the user.
   * Uses `AuthService` to also update the user's Discord profile and OAuth tokens.
   *
   * @param args The arguments passed by the socket during connection
   * @returns The user object, their API key and the user profile
   */
  public async refreshToken(refreshJWT: DataStoredInToken) {
    try {
      const { access, user } = await this.authService.login(refreshJWT);

      const returnedUser = new UserObject(user);
      const uploadKey = user.uploadKey;

      return { access, uploadKey, returnedUser };
    } catch (err) {
      throw new WsException(500, err.message);
    }
  }

  /**
   * Get the user associated with a specified socket
   * @param socket The connected socket
   * @returns The user's ID
   */
  public async getUserId(socket: Socket) {
    try {
      const socketHeaders = socket.request.headers;
      const refreshToken = socketHeaders['cookie'] ? cookie.parse(socketHeaders['cookie']).Authorization : null;

      if (!refreshToken) throw new WsException(404, 'Authorization Missing');
      const secretKey: string = SECRET_KEY;
      const refreshVerificationResponse = verify(refreshToken, secretKey) as DataStoredInToken;

      if (refreshVerificationResponse.exp * 1000 <= Date.now()) throw new WsException(409, 'Invalid Authorization');

      return refreshVerificationResponse.i;
    } catch (err) {
      throw new WsException(err.status, err.message);
    }
  }

  /**
   * TESTING FOO
   */
  public async sendUserMessage(userId: string, message: any) {
    try {
      const socket = SocketController.getSocket(userId);
      if (!socket) throw new WsException(404, 'Socket Not Found');

      socket.emit('cmd', message);
    } catch (err) {
      throw new WsException(err.status, err.message);
    }
  }
}

export default SocketService;
