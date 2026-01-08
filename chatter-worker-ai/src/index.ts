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

export interface Env {
	AI: Ai
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		var corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization'
		}

		if (request.method == "OPTIONS") {
			return new Response(null, {status: 204, statusText: "OK", headers: corsHeaders});
		}

		if (request.method == "GET")
			return new Response("Chatter Worker AI is running. Please use POST requests to interact with the AI.", {status: 200, statusText: "OK", headers: corsHeaders});

		if (request.method != "POST")
			return new Response("Method Not Allowed", {status: 405, statusText: "Method Not Allowed", headers: corsHeaders}
		)

		try {
			console.info("Received request:", request);
				
			const body: { messages: { role: string, content: string }[] } = await request.json();
			
			console.info("Received messages:", body.messages);
			
			const response: any = await env.AI.run("@cf/meta/llama-3.1-8b-instruct",
				{
					max_tokens: 512,
					messages: body.messages
				});
			
			console.info("AI Response:", response);
			
			return new Response(JSON.stringify(response), {status: 200, statusText: "OK", headers: corsHeaders});
		} catch (err) {
			console.error("Error processing request:", err);
			return new Response(JSON.stringify({error: "Failed to process request"}), {status: 500, statusText: "Failed to process request", headers: corsHeaders});
		}
	},
} satisfies ExportedHandler<Env>;
