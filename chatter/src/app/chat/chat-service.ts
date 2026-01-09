import { HttpClient } from "@angular/common/http";
import { computed, Inject, inject, Injectable, input, Signal, signal } from "@angular/core";
import { Observable, shareReplay } from "rxjs";
import { AiMessage } from "./ai-message";
import { routes } from "../app.routes";
import { ActivatedRoute } from "@angular/router";
import { LogService } from "../log/log-service";

@Injectable({
    providedIn: 'root'
})

export class ChatService {
    private readonly http = inject(HttpClient);
    private readonly url = "https://chatter-worker-ai.maniarhamza01.workers.dev/";

    private activatedRoute = inject(ActivatedRoute);

    private conversationId = signal<string>('');

    private messages = signal<AiMessage[]>([]);
    private expiry = signal<Date>(new Date(Date.now()));

    private logs = inject(LogService);

    getConversationId(): Signal<string> {
        return this.conversationId;
    }

    getMessages(): Signal<AiMessage[]> {
        return this.messages;
    }

    getExpiry(): Signal<Date> {
        return this.expiry;
    }

    initialise(conversationId: string) {
        this.logs.log("Reinitialising: " + Date.now().toString());
        this.conversationId.set(conversationId);

        const response = this.http.get<string>(this.url + "?conversationId=" + this.conversationId());

        response.pipe(shareReplay(1))
            .subscribe((response: any) => {
                this.logs.log("Updating messages: " + JSON.stringify(response));

                this.expiry.set(response.expiry);

                this.messages.set(response.messages
                    .filter((message: {role: string, content: string}) => message.role != "system")
                    .map((message: {role: string, content: string}) => new AiMessage(message.role, message.content)));
                
                this.logs.log("New messages length: " + this.messages().length);
            });

        return response;
    }
    
    // Sends a message to the chat bot and returns the response as a string.
    sendMessage(message: string): Observable<string> {
        this.logs.log("Sending message: " + message);

        this.messages.update(values => [...values, new AiMessage("user", message)]);

        this.logs.log(this.messages());

        return this.retryLastMessage();
    }

    retryLastMessage(): Observable<string> {
        const requestBody = { conversationId: this.conversationId(), message: this.messages()[this.messages().length - 1].content };

        this.logs.log("Request body:" + JSON.stringify(requestBody));
        var request = this.http.post<string>(this.url, requestBody).pipe(shareReplay(1));

        request.subscribe((response: any) => {
            this.logs.log("Received response:" + JSON.stringify(response));
            this.messages.update(values => [...values, new AiMessage("assistant", response.response)]);
        });

        return request;
    }
}