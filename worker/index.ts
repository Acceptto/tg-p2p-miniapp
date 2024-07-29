import { Router } from 'itty-router';
import { Instagram } from './instagram';
import { Database, InstagramProfessionalUser } from './db';
import { processMessage } from './messageProcessor';
import { MessageSender } from './messageSender';
import { generateSecret, sha256 } from './cryptoUtils';

interface Env {
	INSTAGRAM_BOT_TOKEN: string;
	TELEGRAM_USE_TEST_API: boolean;
	DB: any; // TODO: Replace 'any' with your actual database type if possible
	FRONTEND_URL: string;
	INIT_SECRET: string;
	WEBHOOK_VERIFY_TOKEN: string;
}

interface App {
	instagram: Instagram;
	db: Database;
	corsHeaders: Record<string, string>;
	isLocalhost: boolean;
	instagram_professional_user: InstagramProfessionalUser | null;
}

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

function isInstagramApiResponse(response: any): response is InstagramApiResponse {
	return (
		typeof response === 'object' &&
		typeof response.id === 'string' &&
		typeof response.user_id === 'string' &&
		typeof response.username === 'string'
	);
}

const router = Router();

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

	//potentially we can encrypt tokens before storing them
	let instagram_professional_user = await db.getInstagramProfessionalUserByToken(
		env.INSTAGRAM_BOT_TOKEN
	);

	if (!instagram_professional_user) {
		try {
			const response = await instagram.getMe();

			if (response.error) {
				console.error('Error from Instagram API:', response.error);
				return new Response(JSON.stringify({ error: 'Error from Instagram API' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			if (isInstagramApiResponse(response)) {
				instagram_professional_user = {
					app_scoped_id: response.id,
					user_id: response.user_id,
					username: response.username,
					name: response.name,
					account_type: response.account_type,
					profile_picture_url: response.profile_picture_url,
					followers_count: response.followers_count,
					follows_count: response.follows_count,
					media_count: response.media_count,
					access_token: env.INSTAGRAM_BOT_TOKEN,
				};

				const saveResult = await db.saveInstagramProfessionalUser(instagram_professional_user);
				if (!saveResult) {
					console.error('Failed to save Instagram user');
					return new Response(JSON.stringify({ error: 'Failed to save Instagram user' }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					});
				}

				instagram_professional_user = await db.getInstagramProfessionalUserByAppScopedId(
					response.id
				);
			} else {
				console.error('Invalid response format from Instagram API:', response);
				return new Response(JSON.stringify({ error: 'Invalid response from Instagram API' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		} catch (error) {
			console.error('Failed to get Instagram user data:', error);
			return new Response(JSON.stringify({ error: 'Failed to get Instagram user data' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
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
			return new Response('Forbidden', { status: 403 });
		}
	}

	return new Response(
		'This instagram bot is deployed correctly. No user-serviceable parts inside.',
		{ status: 200 }
	);
});

router.post('/', async (request: Request, app: App, env: Env) => {
	try {
		const payload = await request.json();
		console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

		// Here you would typically process the webhook payload
		// For now, we're just logging it

		return new Response('OK', { status: 200 });
	} catch (error) {
		console.error('Error processing webhook:', error);
		return new Response('Error processing webhook', { status: 400 });
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

router.all('*', () => new Response('404, not found!', { status: 404 }));

export default {
	fetch: handle,
};
