import { Injectable } from '@angular/core';

import * as LOG from 'loglevel';

import { environment } from 'app/../environments/environment';
import { AuthService } from '../../auth.service';
import { LoginAuthRequestMessage } from '../message/login-auth-request-message';
import { MESSAGE_ID } from '../message/message-id';

@Injectable()
export class WebSocketService {

  private socket: WebSocket;

  private isAuthenticated = false;
  private isConnected = false;

  constructor(
    private readonly authService: AuthService
  ) {
  }

  private sendJson(msg: any) {
    this.socket.send(JSON.stringify(msg));
  }

  private onOpen() {
    LOG.debug('Socket is connected');
    this.isConnected = true;
  }

  private onClose() {
    this.isConnected = false;
    this.isAuthenticated = false;
    LOG.error('Server closed the connection');
  }

  private onError() {
    LOG.error('Socket was closed because of an error');
  }

  private onMessage(msgEvent: any) {
    if (msgEvent.data === 'connected') {
      this.sendAuthentication();
      return;
    }

    const msg = JSON.parse(msgEvent.data);
    console.log(msg);
  }

  public connect() {
    this.socket = new WebSocket(environment.socketUrl);
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onclose = this.onClose.bind(this);
    this.socket.onerror = this.onError.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);

    LOG.debug('Connecting to: ' + environment.socketUrl);
  }

  private sendAuthentication() {
    const authMessage: LoginAuthRequestMessage = {
      mid: MESSAGE_ID.LoginAuthRequestMessage,
      token: this.authService.getToken()
    };
    this.sendJson(authMessage);
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
