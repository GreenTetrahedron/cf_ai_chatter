import { Injectable } from "@angular/core";
import { AiMessage } from "../chat/ai-message";

export class ChatMessage {
    message: string;
    sender: 'user' | 'ai';
    id: string;

    constructor(message: string, sender: 'user' | 'ai', id: string) {
        this.message = message;
        this.sender = sender;
        this.id = id;
    }

    public static aiToChatMessage(aiMessage: AiMessage): ChatMessage {
        return new ChatMessage(aiMessage.content, aiMessage.role === 'user' ? 'user' : 'ai', aiMessage.id);
    }
}