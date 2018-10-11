import { Injectable } from '@angular/core';
import { ChatMessage } from './chat-message';

import { Subject, Observable } from 'rxjs';

@Injectable()
export class ChatService {

  private subject = new Subject<ChatMessage>();

  send(message: ChatMessage) {
    this.subject.next(message);
  }

  onMessage(): Observable<ChatMessage> {
    return this.subject.asObservable();
  }
}
