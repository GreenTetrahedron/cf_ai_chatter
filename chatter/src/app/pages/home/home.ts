import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Chat } from "../../chat/chat/chat";
import { ChatService } from '../../chat/chat-service';

@Component({
  selector: 'app-home',
  imports: [Chat, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private chatService = inject(ChatService);

  conversationId = this.chatService.getConversationId();

  expiry = this.chatService.getExpiry();
}
