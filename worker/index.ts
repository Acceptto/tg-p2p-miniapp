import { Router } from 'itty-router';
import { Instagram } from './instagram';
import { Database, InstagramProfessionalUser } from './db';
import { processField } from './webhookMessageProcessor';
import { App, Env } from './types';
import XHubSignature from './XHubSignature';
import { ExecutionContext } from '@cloudflare/workers-types';

function createJsonResponse(data: any, status: number): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

async function fetchInstagramUser(
	instagram: Instagram,
	db: Database,
	token: string
): Promise<InstagramProfessionalUser | null> {
	try {
		const response = await instagram.getMe();

		if (response.error) {
			console.error('Error from Instagram API:', response.error);
			return null;
		}

		if (isInstagramApiResponse(response)) {
			const user: InstagramProfessionalUser = {
				app_scoped_id: response.id,
				user_id: response.user_id,
				username: response.username,
				name: response.name || null,
				account_type: response.account_type || null,
				profile_picture_url: response.profile_picture_url || null,
				followers_count: response.followers_count || null,
				follows_count: response.follows_count || null,
				media_count: response.media_count || null,
				access_token: token,
			};

			const saveResult = await db.saveInstagramProfessionalUser(user);
			if (!saveResult) {
				console.error('Failed to save Instagram user');
				return null;
			}

			return user;
		} else {
			console.error('Invalid response format from Instagram API:', response);
			return null;
		}
	} catch (error) {
		console.error('Failed to get Instagram user data:', error);
		return null;
	}
}

const handle = async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
	console.log('Received request:', request.method, request.url);
	const instagram = new Instagram(env.INSTAGRAM_BOT_TOKEN);
	const db = new Database(env.DB);
	const corsHeaders = {
		'Access-Control-Allow-Origin': env.FRONTEND_URL,
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Hub-Signature-256',
		'Access-Control-Max-Age': '86400',
	};
	const securityHeaders = {
		'Content-Security-Policy':
			"default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'self';",
		'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'no-referrer-when-downgrade',
	};

	const isLocalhost = request.headers.get('Host')?.match(/^(localhost|127\.0\.0\.1)/) !== null;

	// Verify signature for all requests except OPTIONS
	if (request.method !== 'OPTIONS') {
		const signature = request.headers.get('X-Hub-Signature-256');
		if (!signature) {
			console.log('Missing signature');
			return createJsonResponse({ error: 'Missing signature' }, 400);
		}

		const xhub = new XHubSignature('sha256', env.INSTAGRAM_APP_SECRET);
		const body = await request.text();
		console.log('Request body:', body);

		const isValid = await xhub.verify(signature, body);

		if (!isValid) {
			console.log('Invalid signature');
			return createJsonResponse({ error: 'Invalid signature' }, 403);
		}

		console.log('Signature validation successful');

		try {
			const jsonBody = JSON.parse(body);
			console.log('Parsed JSON body:', JSON.stringify(jsonBody, null, 2));

			// Process the webhook payload
			if (jsonBody.object === 'instagram' && Array.isArray(jsonBody.entry)) {
				console.log('Processing Instagram webhook payload');
				for (const entry of jsonBody.entry) {
					console.log('Processing entry:', JSON.stringify(entry, null, 2));
					if (entry.messaging) {
						console.log('Processing messaging field');
						await processField('messaging', entry.messaging, { instagram, db } as App, env);
					} else if (entry.changes) {
						for (const change of entry.changes) {
							console.log('Processing change:', JSON.stringify(change, null, 2));
							await processField(change.field, change.value, { instagram, db } as App, env);
						}
					} else {
						console.log('No messaging or changes field found in entry');
					}
				}
				console.log('Webhook processing completed');
				return createJsonResponse({ message: 'Webhook processed successfully' }, 200);
			} else {
				console.log('Unexpected webhook payload structure');
				return createJsonResponse({ error: 'Unexpected webhook payload structure' }, 400);
			}
		} catch (error) {
			console.error('Error processing webhook payload:', error);
			return createJsonResponse({ error: 'Error processing webhook' }, 400);
		}
	}

	let instagram_professional_user = await db.getInstagramProfessionalUserByToken(
		env.INSTAGRAM_BOT_TOKEN
	);

	if (!instagram_professional_user) {
		instagram_professional_user = await fetchInstagramUser(instagram, db, env.INSTAGRAM_BOT_TOKEN);
		if (!instagram_professional_user) {
			return createJsonResponse({ error: 'Failed to fetch Instagram user' }, 500);
		}
	}

	const app: App = { instagram, db, corsHeaders, isLocalhost, instagram_professional_user };
	const response = await router.handle(request, app, env, ctx);

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: {
			...securityHeaders,
			...response.headers,
			...corsHeaders,
		},
	});
};

const router = Router();

router.get('/', (request: Request, app: App, env: Env) => {
	const url = new URL(request.url);
	const mode = url.searchParams.get('hub.mode');
	const token = url.searchParams.get('hub.verify_token');
	const challenge = url.searchParams.get('hub.challenge');

	if (mode === 'subscribe' && token) {
		if (token === env.WEBHOOK_VERIFY_TOKEN) {
			return new Response(challenge || '', { status: 200 });
		} else {
			return createJsonResponse({ error: 'Forbidden' }, 403);
		}
	}

	return new Response(
		'This instagram bot is deployed correctly. No user-serviceable parts inside.',
		{ status: 200 }
	);
});

router.options(
	'/miniApp/*',
	(request: Request, app: App, env: Env) =>
		new Response('Success', {
			headers: {
				...app.corsHeaders,
			},
			status: 200,
		})
);

router.all('*', () => createJsonResponse({ error: 'Not found' }, 404));

function isInstagramApiResponse(response: any): response is {
	id: string;
	user_id: string;
	username: string;
	name?: string;
	account_type?: string;
	profile_picture_url?: string;
	followers_count?: number;
	follows_count?: number;
	media_count?: number;
} {
	return (
		typeof response === 'object' &&
		typeof response.id === 'string' &&
		typeof response.user_id === 'string' &&
		typeof response.username === 'string'
	);
}

export default {
	fetch: handle,
};
