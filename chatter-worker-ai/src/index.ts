/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { DurableObject } from "cloudflare:workers";

export interface Env {
	AI: Ai,
	CHATTER_DURABLE_OBJECT: DurableObjectNamespace<ChatterDurableObject>,
	PAGE_URL: string
}

export class ChatterDurableObject extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	async getMessages(): Promise<{role: string, content: string}[]> {
		const messages: undefined | {role: string, content: string;}[] = await this.ctx.storage.get('messages');

		if (messages == undefined)
		{
			const thing = await this.initialise();
			return thing.messages;
		}

		return messages;
	}

	async getInfo(): Promise<{expiry: Date, messages: {role: string, content: string}[]}> {
		const messages: undefined | {role: string, content: string;}[] = await this.ctx.storage.get('messages');
		const expiry: undefined | Date = await this.ctx.storage.get('expiry');

		if (messages == undefined || expiry == undefined)
		{
			return await this.initialise();
		}

		return {expiry: expiry!, messages: messages!};
	}

	async initialise(): Promise<{expiry: Date, messages: {role: string, content: string}[]}> {
		const messages = [{role: 'system', content: 'You are a helpful AI assistant that gives concise answers.'}];

		this.ctx.storage.put('messages', messages);

		const expiry = new Date(Date.now());
		expiry.setDate(expiry.getDate() + 1);

		console.log(expiry);
		
		this.ctx.storage.put('expiry', expiry);

		this.ctx.storage.setAlarm(expiry);

		return {expiry: expiry, messages: messages};
	}

	async sendMessage(message: string): Promise<{response: string, usage: any}> {
		const messages = await this.getMessages();

		messages.push({role: 'user', content: message});

		let lastError;

		// Retry upto 3 times
		for (let i = 0; i < 3; i++)
		{
			try {
				console.log("Trying to send: " + messages)	
				const response: any = await this.env.AI.run("@cf/meta/llama-3.1-8b-instruct",
					{
						max_tokens: 512,
						messages: messages
					});
				
				console.info("AI Response:", response);
				
				messages.push({role: 'assistant', content: response.response});

				this.ctx.storage.put('messages', messages);

				return response;
			} catch (err) {
				lastError = err;
				console.warn("Attempt " + (i + 1) + " failed... Trying again. \n Error: ", err)
			    await new Promise(resolve => setTimeout(resolve, 500));
			}
		}

		throw lastError;
	}

	async alarm() {
		console.log("Deleting all...");
		await this.ctx.storage.deleteAll();
	}
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		var corsHeaders = {
			'Access-Control-Allow-Origin': env.PAGE_URL,
			'Vary': 'Origin',
			'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization'
		}

		console.log(env.PAGE_URL);

		if (request.method == "OPTIONS") {
			return new Response(null, {status: 204, statusText: "OK", headers: corsHeaders});
		}

		if (request.method == "GET")
		{
			const url = new URL(request.url);

			if (!url.searchParams.has('conversationId'))
				return new Response("Chatter Worker AI is running. Please use POST requests to interact with the AI.", {status: 200, statusText: "OK", headers: corsHeaders});
	
			const stub = env.CHATTER_DURABLE_OBJECT.getByName(url.searchParams.get('conversationId')!);
			const info = await stub.getInfo();

			return new Response(JSON.stringify(info), {status: 200, statusText: "OK", headers: corsHeaders});
		}

		if (request.method != "POST")
			return new Response("Method Not Allowed", {status: 405, statusText: "Method Not Allowed", headers: corsHeaders}
		)

		console.info("Received POST request");
		
		try {
			const body: { conversationId: string , message: string } = await request.json();

			if (body.conversationId == undefined || body.conversationId == null || body.conversationId == ''
				|| body.message == undefined || body.message == null || body.message == '') {
					throw new TypeError("Invalid request body");
			}
			
			console.info("Received message:", body.message);

			const stub = env.CHATTER_DURABLE_OBJECT.getByName(body.conversationId);

			try {
				return new Response(JSON.stringify(await stub.sendMessage(body.message)), {status: 200, statusText: "OK", headers: corsHeaders})

			} catch (err) {
				console.error("All retries failed. Last error encountered: ", err);
				return new Response(JSON.stringify({error: "Failed to process request"}), {status: 500, statusText: "Failed to process request", headers: corsHeaders});
			}

		} catch (err) {
			console.error("Error: ", err);
			return new Response("Invalid message sent", {status: 400, statusText: "Invalid message", headers: corsHeaders})
		}

	},
} satisfies ExportedHandler<Env>;
