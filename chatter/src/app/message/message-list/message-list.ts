import { Component, effect, ElementRef, inject, input, Signal, ViewChild } from '@angular/core';
import { Message } from "../message/message";
import { ChatMessage } from '../chat-message';
import { LogService } from '../../log/log-service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.html',
  styleUrl: './message-list.css',
  imports: [Message],
})
export class MessageList {
  messages = input.required<ChatMessage[]>();

  private log = inject(LogService);
  
  constructor() {
    effect(() => {
      this.log.log(this.messages().length);
    });
  }
}
