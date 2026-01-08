import { HttpClient } from "@angular/common/http";
import { Inject, inject, Injectable, Signal, signal } from "@angular/core";
import { Observable, shareReplay } from "rxjs";
import { AiMessage } from "./ai-message";

@Injectable({
    providedIn: 'root'
})

export class ChatService {
    http = inject(HttpClient);
    url = "http://localhost:8787/";

    messages = signal<AiMessage[]>([]);

    constructor() {
        // Initialize with a default system message.
        this.messages.update(values => [...values, new AiMessage("system", "You are a helpful assistant")]);
    }

    // Sets the context for the chat bot.
    setSystemContent(content: string): void {
        this.messages.update(values => [new AiMessage("system", content), ...values.slice(1)]);
    }

    getMessages(): Signal<AiMessage[]> {
        return this.messages;
    }
    
    // Sends a message to the chat bot and returns the response as a string.
    sendMessage(message: string): Observable<string> {
        console.info("Sending message:", message);

        this.messages.update(values => [...values, new AiMessage("user", message)]);

        const requestBody = { messages: this.messages().map(m => ({ role: m.role, content: m.content })) };

        console.info("Request body:", requestBody);
        var request = this.http.post<string>(this.url, requestBody);

        request.pipe(
            shareReplay(1)
        ).subscribe((response: any) => {
            console.info("Received response:", response);
            this.messages.update(values => [...values, new AiMessage("assistant", response.response)]);
        });

        return request;
    }
}