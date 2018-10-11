import { Injectable } from '@angular/core';

import * as LOG from 'loglevel';

import { environment } from 'app/../environments/environment';
import { AuthService } from '../../auth.service';
import { LoginAuthRequestMessage } from '../message/login-auth-request-message';
import { MESSAGE_ID } from '../message/message-id';

@Injectable()
export class WebSocketService {

  private readonly socket: WebSocket;

  private isAuthenticated = false;
  private isConnected = false;

  constructor(
    private readonly authService: AuthService
  ) {
    this.socket = new WebSocket(environment.socketUrl);
    this.socket.onopen = this.onOpen;
    this.socket.onclose = this.onClose;
    this.socket.onerror = this.onError;
    this.socket.onmessage = this.onMessage;

    LOG.debug('Connecting to: ' + environment.socketUrl);
  }

  private sendJson(msg: any) {
    this.socket.send(JSON.stringify(msg));
  }

  private onOpen() {
    LOG.debug('Socket is connected');
    this.isConnected = true;
    const authMessage: LoginAuthRequestMessage = {
      messageId: MESSAGE_ID.LoginAuthRequestMessage,
      token: this.authService.getToken()
    };
    this.sendJson(authMessage);
  }

  private onClose() {
    this.isConnected = false;
    this.isAuthenticated = false;
    LOG.error('Server closed the connection');
  }

  private onError() {
    LOG.error('Socket was closed because of an error');
  }

  private onMessage(msg: any) {
    console.log(msg);
  }

  public send(msg: any) {
    if (!this.isConnected) {
      LOG.warn('Socket is not connected. Can not send: ' + JSON.stringify(msg));
      return;
    }

    if (!this.isAuthenticated) {
      LOG.warn('Socket is not authenticated. Can not send: ' + JSON.stringify(msg));
      return;
    }

    this.sendJson(msg);
  }
}
