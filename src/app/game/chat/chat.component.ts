import { Component, OnInit } from '@angular/core';
import { ChatService } from './chat.service';
import { state, style, transition, animate, trigger } from '@angular/animations';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
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
        animate('0.5s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ])
  ]
})
export class ChatComponent implements OnInit {

  public isOpen = true;

  constructor(
    private readonly chatService: ChatService
  ) { }

  ngOnInit() {
  }

  clickSend() {
    // TODO Implementieren :)
    console.log('send message');
  }

  clickClose() {
    this.isOpen = !this.isOpen;
  }
}
