import { Router } from 'itty-router';
import { Instagram } from './instagram';
import { Database, InstagramProfessionalUser } from './db';
import { processField } from './webhookMessageProcessor';
import { App, Env } from './types';
import { hmacSha256, hex } from './cryptoUtils';

interface InstagramApiResponse {
	id: string;
	user_id: string;
	username: string;
	name?: string | null;
	account_type?: string | null;
	followers_count?: number | null;
	follows_count?: number | null;
	media_count?: number | null;
	profile_picture_url?: string | null;
}

interface InstagramWebhookPayload {
	object: string;
	entry: Array<{
		id: string;
		time: number;
		changed_fields?: string[];
		changes?: Array<{
			field: string;
			value: any;
		}>;
	}>;
}

function isInstagramApiResponse(response: any): response is InstagramApiResponse {
	return (
		typeof response === 'object' &&
		typeof response.id === 'string' &&
		typeof response.user_id === 'string' &&
		typeof response.username === 'string'
	);
}

const router = Router();

function createJsonResponse(data: any, status: number): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

async function validatePayload(
	request: Request,
	body: string,
	appSecret: string
): Promise<boolean> {
	const signature = request.headers.get('X-Hub-Signature-256');
	if (!signature) {
		console.error('No X-Hub-Signature-256 found in request header');
		return false;
	}

	const elements = signature.split('=');
	if (elements.length !== 2) {
		console.error('Invalid X-Hub-Signature-256 format');
		return false;
	}
	const signatureHash = elements[1];

	if (!appSecret) {
		console.error('App secret is empty or undefined');
		return false;
	}

	try {
		const expectedBuffer = await hmacSha256(body, appSecret);
		const expectedHash = hex(expectedBuffer);

		console.log('Received signature:', signatureHash);
		console.log('Computed signature:', expectedHash);

		return signatureHash === expectedHash;
	} catch (error) {
		console.error('Error computing HMAC:', error);
		return false;
	}
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
				name: response.name,
				account_type: response.account_type,
				profile_picture_url: response.profile_picture_url,
				followers_count: response.followers_count,
				follows_count: response.follows_count,
				media_count: response.media_count,
				access_token: token,
			};

			const saveResult = await db.saveInstagramProfessionalUser(user);
			if (!saveResult) {
				console.error('Failed to save Instagram user');
				return null;
			}

			return await db.getInstagramProfessionalUserByIGID(response.user_id);
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
	const instagram = new Instagram(env.INSTAGRAM_BOT_TOKEN);
	const db = new Database(env.DB);
	const corsHeaders = {
		'Access-Control-Allow-Origin': env.FRONTEND_URL,
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Access-Control-Max-Age': '86400',
	};
	const isLocalhost = request.headers.get('Host')?.match(/^(localhost|127\.0\.0\.1)/) !== null;

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
			...response.headers,
			...app.corsHeaders,
		},
	});
};

router.get('/', (request: Request, app: App, env: Env) => {
	const url = new URL(request.url);
	const mode = url.searchParams.get('hub.mode');
	const token = url.searchParams.get('hub.verify_token');
	const challenge = url.searchParams.get('hub.challenge');

	if (mode === 'subscribe' && token) {
		if (token === env.WEBHOOK_VERIFY_TOKEN) {
			console.log('Webhook verified');
			return new Response(challenge || '', { status: 200 });
		} else {
			console.error('Webhook verification failed');
			return createJsonResponse({ error: 'Forbidden' }, 403);
		}
	}

	return new Response(
		'This instagram bot is deployed correctly. No user-serviceable parts inside.',
		{ status: 200 }
	);
});

router.post('/', async (request: Request, app: App, env: Env) => {
	console.log('POST request received for Instagram webhook');

	const clonedRequest = request.clone();
	const body = await clonedRequest.text();

	console.log('INSTAGRAM_APP_SECRET is set:', !!env.INSTAGRAM_APP_SECRET);
	const isValid = await validatePayload(request, body, env.INSTAGRAM_APP_SECRET);
	if (!isValid) {
		console.error('Invalid payload signature');
		return createJsonResponse({ error: 'Invalid signature' }, 403);
	}

	try {
		const payload: InstagramWebhookPayload = JSON.parse(body);
		console.log('Received payload:', JSON.stringify(payload, null, 2));

		if (payload.object !== 'instagram') {
			console.error('Received non-Instagram object:', payload.object);
			return createJsonResponse({ error: 'Unsupported object type' }, 400);
		}

		for (const entry of payload.entry) {
			console.log(`Processing entry for object ID: ${entry.id}, time: ${entry.time}`);

			if (entry.changed_fields) {
				for (const field of entry.changed_fields) {
					await processField(field, null, app, env);
				}
			} else if (entry.changes) {
				for (const change of entry.changes) {
					await processField(change.field, change.value, app, env);
				}
			} else {
				console.warn('Entry contains neither changed_fields nor changes');
			}
		}

		return createJsonResponse({ message: 'OK' }, 200);
	} catch (error) {
		console.error('Error processing Instagram webhook:', error);
		return createJsonResponse({ error: 'Error processing webhook' }, 400);
	}
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

export default {
	fetch: handle,
};
