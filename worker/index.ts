import { AutoRouter, cors, error, json, IRequest } from 'itty-router';
import { ExecutionContext } from '@cloudflare/workers-types';
import { Instagram } from './instagram';
import { Database, InstagramProfessionalUser } from './databaseClient';
import { processField } from './webhookMessageProcessor';
import { App, Env } from './types';
import XHubSignature from './XHubSignature';

async function fetchInstagramUser(
	instagram: Instagram,
	databaseClient: Database,
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

			const saveResult = await databaseClient.saveInstagramProfessionalUser(user);
			if (!saveResult) {
				throw new Error('Failed to save Instagram user');
			}

			return user;
		} else {
			console.error('Invalid response format from Instagram API:', response);
			return null;
		}
	} catch (error) {
		console.error('Failed to get Instagram user data:', error);
		throw error;
	}
}

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

const corsConfig = {
	origin: (origin: string) => origin, // Adjust as needed
	allowMethods: ['GET', 'POST', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'Authorization', 'X-Hub-Signature-256'],
	maxAge: 86400,
};

const { preflight, corsify } = cors(corsConfig);

const verifySignature = async (request: IRequest, env: Env) => {
	if (request.method !== 'OPTIONS') {
		const signature = request.headers.get('X-Hub-Signature-256');
		if (!signature) {
			return error(400, 'Missing signature');
		}

		const xhub = new XHubSignature('sha256', env.INSTAGRAM_APP_SECRET);
		const body = await request.text();
		console.log('Request body:', body);

		const isValid = await xhub.verify(signature, body);

		if (!isValid) {
			return error(403, 'Invalid signature');
		}

		console.log('Signature validation successful');
		(request as any).parsedBody = JSON.parse(body);
	}
};

const securityHeaders = {
	'Content-Security-Policy':
		"default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'self';",
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'no-referrer-when-downgrade',
};

const router = AutoRouter<IRequest, [Env, ExecutionContext]>({
	base: '/',
	before: [preflight, verifySignature],
	catch: err => {
		console.error('Error:', err);
		return error(500, 'Internal Server Error');
	},
	finally: [
		corsify,
		response => {
			Object.entries(securityHeaders).forEach(([key, value]) => {
				response.headers.set(key, value);
			});
			return response;
		},
	],
});

router.get('/', (request, env) => {
	const url = new URL(request.url);
	const mode = url.searchParams.get('hub.mode');
	const token = url.searchParams.get('hub.verify_token');
	const challenge = url.searchParams.get('hub.challenge');

	if (mode === 'subscribe' && token) {
		if (token === env.WEBHOOK_VERIFY_TOKEN) {
			return challenge ? new Response(challenge) : error(400, 'Missing challenge');
		} else {
			return error(403, 'Forbidden');
		}
	}

	return new Response(
		'This instagram bot is deployed correctly. No user-serviceable parts inside.'
	);
});

router.post('/', async (request, env, ctx) => {
	const body = (request as any).parsedBody;
	const instagram = new Instagram(env.INSTAGRAM_BOT_TOKEN, env);
	const databaseClient = new Database(env.DB);

	/*  Use ExecutionContext to schedule a task
  ctx.waitUntil(
    env.MY_KV.put('last-accessed', new Date().toISOString())
    ); */

	if (body.object === 'instagram' && Array.isArray(body.entry)) {
		for (const entry of body.entry) {
			if (entry.messaging) {
				await processField('messaging', entry.messaging, { instagram, databaseClient } as App, env);
			} else if (entry.changes) {
				for (const change of entry.changes) {
					await processField(change.field, change.value, { instagram, databaseClient } as App, env);
				}
			}
		}
		return json({ message: 'Webhook processed successfully' });
	}

	return error(400, 'Unexpected webhook payload structure');
});

router.all('*', () => error(404, 'Not found'));

export default {
	fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
		const instagram = new Instagram(env.INSTAGRAM_BOT_TOKEN, env);
		const databaseClient = new Database(env.DB);
		const isLocalhost = request.headers.get('Host')?.match(/^(localhost|127\.0\.0\.1)/) !== null;

		let instagram_professional_user = await databaseClient.getInstagramProfessionalUserByToken(
			env.INSTAGRAM_BOT_TOKEN
		);

		if (!instagram_professional_user) {
			instagram_professional_user = await fetchInstagramUser(
				instagram,
				databaseClient,
				env.INSTAGRAM_BOT_TOKEN
			);
			if (!instagram_professional_user) {
				return error(500, 'Failed to fetch Instagram user');
			}
		}

		const app: App = {
			instagram,
			databaseClient,
			corsHeaders: {},
			isLocalhost,
			instagram_professional_user,
		};
		return router.fetch(request, env, ctx);
	},
};
