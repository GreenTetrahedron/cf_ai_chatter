import { HttpClient } from "@angular/common/http";
import { Inject, inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class ChatService {
    http = inject(HttpClient);
    url = "http://localhost:8787/";

    messages : { role: string, content: string }[] = [];

    constructor() {
        // Initialize with a default system message.
        this.messages.push({ role: "system", content: "You are a helpful assistant" });
    }

    // Sets the context for the chat bot.
    setSystemContent(content: string): void {
        this.messages[0] = { role: "system", content: content };
    }

    getMessages(): { role: string, content: string }[] {
        return structuredClone(this.messages);
    }
    
    // Sends a message to the chat bot and returns the response as a string.
    sendMessage(message: string): Observable<string> {
        this.messages.push({ role: "user", content: message });

        const requestBody = { messages: this.messages };

        var request = this.http.post<string>(this.url, requestBody);

        request.subscribe(response => {
            this.messages.push({ role: "assistant", content: response });
        });

        return request;
    }
}