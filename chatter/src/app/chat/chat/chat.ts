import { ChangeDetectorRef, Component, effect, ElementRef, inject, signal, Signal, ViewChild } from '@angular/core';
import { MessageList } from "../../message/message-list/message-list";
import { ChatMessage } from '../../message/chat-message';
import { ChatService } from '../chat-service';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  imports: [MessageList, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  @ViewChild('messageList') private messageList! : ElementRef;

  private chatService = inject(ChatService);
  messages = signal<ChatMessage[]>([]);

  errorMessage = signal<string | null>(null);

  waitingForMessage = signal(false);

  inputText: string = '';
  lastInputText: string = '';

  constructor(private ref: ChangeDetectorRef)
  {
    effect(() => {
      const aiMessages = this.chatService.getMessages();
      
      this.messages.update(messages => [...messages,
                  ...aiMessages()
                    .slice(messages.length)
                    .filter(m => m.role != "system")
                    .map(ChatMessage.aiToChatMessage)]);
    });
  }

  ngOnInit() {
    this.chatService.initialise();
  }
  
  sendRequest() {
    if (this.inputText == null || this.inputText == '')
        return;

    this.waitingForMessage.set(true);
    this.scrollToBottomOfMessages();
    
    this.handleChatObservable(this.chatService.sendMessage(this.inputText));
    
    
    this.lastInputText = this.inputText;
    this.inputText = '';
  }

  tryAgain() {
    if (this.inputText == null || this.inputText == '')
        return;

    this.handleChatObservable(this.chatService.retryLastMessage());
    this.waitingForMessage.set(true);
    this.errorMessage.set(null);
  }

  handleChatObservable(observable: Observable<any>) {
    observable
      .pipe(
        catchError((error) => {
          console.error("Error sending message:", error);
          this.errorMessage.set("Error sending message: " + error.message);
          throw error;
        }),
        finalize(() => {
          this.waitingForMessage.set(false);
          this.ref.markForCheck();
        })
      ).subscribe(() => {
        this.errorMessage.set(null);
        setTimeout(() => {this.scrollToBottomOfMessages()}, 500);
      });
  }

  scrollToBottomOfMessages() {
    console.log("Scrolling to bottom of message list");
    this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
  }
}
