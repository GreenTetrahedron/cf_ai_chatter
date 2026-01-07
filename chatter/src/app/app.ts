import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ChatService } from '../chat/chat-service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  chatService = inject(ChatService);

  response: any = signal(null);
  
  inputText: string = '';

  ngOnInit() { 
    
  }

  sendRequest() {
    this.chatService.sendMessage(this.inputText)
      .subscribe(response => {
        console.log(response);
        this.response.set(response);
      });
  }
}
