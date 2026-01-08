import { Component, ElementRef, input, Signal, ViewChild } from '@angular/core';
import { Message } from "../message/message";
import { ChatMessage } from '../chat-message';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.html',
  styleUrl: './message-list.css',
  imports: [Message],
})
export class MessageList {
  messages = input<ChatMessage[]>([]);
}
