import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, Signal, ViewChild } from '@angular/core';
import { MessageList } from "../../message/message-list/message-list";
import { ChatMessage } from '../../message/chat-message';
import { ChatService } from '../chat-service';
import { AiMessage } from '../ai-message';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-chat',
  imports: [MessageList, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  @ViewChild('messageList') private messageList! : ElementRef;

  private chatService = inject(ChatService);
  messages: Signal<ChatMessage[]> = signal<ChatMessage[]>([]);

  errors = signal<string[]>([]);

  waitingForMessage = signal(false);

  inputText: string = '';

  ngOnInit() {
    const aiMessages = this.chatService.getMessages();

    this.messages = computed(() => aiMessages().filter(m => m.role != "system").map(ChatMessage.aiToChatMessage));
  }

  ngOnChanges() {
    try{
    } catch(err) {
      console.error("Error scrolling to bottom of message list:", err);
    }
  }
  
  sendRequest() {
    this.waitingForMessage.set(true);
    this.scrollToBottomOfMessages();
    
    this.chatService.sendMessage(this.inputText)
      .pipe(
        catchError((error) => {
          console.error("Error sending message:", error);
          this.waitingForMessage.set(false);
          this.errors.update(errs => [...errs, "Error sending message: " + error.message]);
          throw error;
        })
      ).subscribe(() => {
        this.waitingForMessage.set(false);
        this.scrollToBottomOfMessages();
      });
    
    this.inputText = '';
  }

  scrollToBottomOfMessages() {
    console.log("Scrolling to bottom of message list");
    this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
  }
}
