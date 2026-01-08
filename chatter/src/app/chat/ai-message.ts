export class AiMessage {
    role: string;
    content: string;
    id: string;

    constructor(role: string, content: string) {
        this.role = role;
        this.content = content;
        this.id = crypto.randomUUID();
    }
}