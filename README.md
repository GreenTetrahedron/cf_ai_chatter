# Chatter

A web LLM chat application powered by Cloudflare.


## Flow Design

```
Pages (Frontend)
        ↓
Workers (Routes to appropriate Durable Object)
        ↓
Durable Objects (Stores conversation history per conversation)
        ↓
Workers AI (calls LLM)
```


## Configuration for Testing and Deployment

### Configuring the Angular Frontend

The frontend communicates with the Worker via the `apiUrl` environment variable.

**Development**: Edit `src/environments/environment.development.ts`

   ```ts
   export const environment = {
     apiUrl: '<dev-worker-url>'
   };
   ```

**Production**: Edit `src/environments/environment.ts`

   ```ts
   export const environment = {
     apiUrl: '<prod-worker-url>'
   };
   ```

### Building the Angular Frontend

   * Development build (uses `environment.development.ts`):

     ```bash
     ng build --configuration development
     ```
   * Production build (uses `environment.ts`):

     ```bash
     ng build
     ```


### Configuring the Worker

The Worker leverages CORS to only allow the frontend to send requests to the Worker via a browser. To do this, it needs to know what URL the frontend is hosted on.

For Development:
1. Create a `.dev.vars` file in the `chatter-worker-ai` directory.
2. Add the following line to specify your development frontend URL:

   ```bash
   PAGE_URL="<Your frontend URL>"
   ```

For production, configure the same `PAGE_URL` in your Cloudflare Worker environment settings.

## Potential improvements

* Voice chat input
* Ability to delete chats
* Ability to change expiration date of conversations
* Ability to copy conversation transcript
* Ability to change system prompt
* Ability to choose the LLM used
