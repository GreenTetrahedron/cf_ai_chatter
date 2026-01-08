import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ChatService } from './chat/chat-service';
import { Chat } from "./chat/chat/chat";

@Component({
  selector: 'app-root',
  imports: [FormsModule, Chat],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

}
