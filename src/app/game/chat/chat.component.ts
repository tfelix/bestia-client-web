import { Component, OnInit } from '@angular/core';
import { state, style, transition, animate, trigger } from '@angular/animations';

import { ChatService } from './chat.service';
import { ChatMessage } from './chat-message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        opacity: 1,
        bottom: 0
      })),
      state('closed', style({
        opacity: 0,
        bottom: '-200px'
      })),
      transition('open => closed', [
        animate('0.3s')
      ]),
      transition('closed => open', [
        animate('0.3s')
      ]),
    ])
  ]
})
export class ChatComponent implements OnInit {

  public playerName = 'rocket';
  public isOpen = false;
  public messages: ChatMessage[];
  public chatInput: string;

  constructor(
    private readonly chatService: ChatService
  ) { }

  ngOnInit() {
    this.messages = [
      { time: 12345, text: "Hello World, das ist ein Test", mode: 'PUBLIC' },
      { time: 12346, text: "Das ist eine Direktnachricht.", mode: 'WHISPER', sender: 'MaBoi' }
    ];
  }

  onKey() {

  }

  onSubmit(event) {
    event.preventDefault();

    const message: ChatMessage = {
      sender: this.playerName,
      text: this.chatInput,
      time: new Date().getMilliseconds(),
      mode: 'PUBLIC'
    }

    this.messages.push(message);

    // TODO Publish the Chat to the Server.

    this.chatInput = '';
  }

  close() {
    this.isOpen = false;
  }

  open() {
    this.isOpen = true;
  }
}
