import { ChangeDetectorRef, Component, effect, ElementRef, inject, signal, Signal, ViewChild } from '@angular/core';
import { MessageList } from "../../message/message-list/message-list";
import { ChatMessage } from '../../message/chat-message';
import { ChatService } from '../chat-service';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, Observable } from 'rxjs';
import { LogService } from '../../log/log-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  imports: [MessageList, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  @ViewChild('messageList') private messageList! : ElementRef;

  private chatService = inject(ChatService);
  private chatServiceMessages = this.chatService.getMessages();
  messages = signal<ChatMessage[]>([]);

  errorMessage = signal<string | null>(null);

  waitingForMessage = signal(false);

  inputText: string = '';
  private lastInputText: string = '';

  private route = inject(ActivatedRoute);

  private log = inject(LogService);

  constructor(private ref: ChangeDetectorRef)
  {
    this.route.params.subscribe((params) => {
      this.chatService.initialise(params['id']);
      this.messages.set([]);
    });

    effect(() => {
      const aiMessages = this.chatServiceMessages();

      this.messages.update(messages => [...messages,
                  ...aiMessages
                    .slice(messages.length)
                    .filter(m => m.role != "system")
                    .map(ChatMessage.aiToChatMessage)]);
    });
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
          this.log.error("Error sending message: " + error);
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
    this.log.log("Scrolling to bottom of message list");
    this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
  }
}
