import { Component, input } from '@angular/core';
import { ChatMessage } from '../chat-message';
import { RemarkModule } from 'ngx-remark';

@Component({
  selector: 'app-message',
  imports: [RemarkModule],
  templateUrl: './message.html',
  styleUrl: './message.css',
})
export class Message {
  message = input.required<ChatMessage>();
}
