import { AutoRouter, cors, error, json, IRequest } from 'itty-router';
import { ExecutionContext } from '@cloudflare/workers-types';
import { Instagram } from './instagram';
import { Database, InstagramProfessionalUser } from './databaseClient';
import { processField } from './webhookMessageProcessor';
import { App, Env } from './types/application';
import XHubSignature from './XHubSignature';

const securityHeaders = {
	'Content-Security-Policy':
		"default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'self';",
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'no-referrer-when-downgrade',
};

const createRouter = (env: Env) => {
	const corsOptions = {
		origin: env.FRONTEND_URL,
		allowMethods: ['GET', 'POST', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization', 'X-Hub-Signature-256'],
		maxAge: 86400,
	};

	const { preflight, corsify } = cors(corsOptions);

	const router = AutoRouter<IRequest, [Env, ExecutionContext]>({
		base: '/',
		before: [
			preflight,
			async (request, env) => {
				if (request.method !== 'OPTIONS') {
					const signature = request.headers.get('X-Hub-Signature-256');
					if (signature) {
						const xhub = new XHubSignature('sha256', env.INSTAGRAM_APP_SECRET);
						const body = await request.text();
						if (!(await xhub.verify(signature, body))) {
							return error(403, 'Invalid signature');
						}
						(request as any).parsedBody = JSON.parse(body);
					}
				}
			},
		],
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

		if (mode === 'subscribe' && token === env.WEBHOOK_VERIFY_TOKEN) {
			return challenge ? new Response(challenge) : error(400, 'Missing challenge');
		}

		return new Response('Instagram bot deployed correctly.');
	});

	router.post('/', async (request, env, ctx) => {
		const body = (request as any).parsedBody;
		const instagram = new Instagram(env.INSTAGRAM_BOT_TOKEN, env);
		const databaseClient = new Database(env.DB);

		if (body?.object === 'instagram' && Array.isArray(body.entry)) {
			for (const entry of body.entry) {
				if (entry.messaging) {
					await processField('messaging', entry.messaging, instagram, databaseClient, env);
				} else if (entry.changes) {
					for (const change of entry.changes) {
						await processField(change.field, change.value, instagram, databaseClient, env);
					}
				}
			}
			return json({ message: 'Webhook processed successfully' });
		}

		return error(400, 'Unexpected webhook payload structure');
	});

	router.all('*', () => error(404, 'Not found'));

	return router;
};

// Create router once
let router: ReturnType<typeof createRouter>;

const getInstagramUser = async (env: Env): Promise<InstagramProfessionalUser | null> => {
	const databaseClient = new Database(env.DB);
	let user = await databaseClient.getInstagramProfessionalUserByToken(env.INSTAGRAM_BOT_TOKEN);
	if (!user) {
		const instagram = new Instagram(env.INSTAGRAM_BOT_TOKEN, env);
		const response = await instagram.getMe();
		if (response && !response.error) {
			user = {
				app_scoped_id: response.id,
				user_id: response.user_id,
				username: response.username,
				name: response.name ?? null,
				account_type: response.account_type ?? null,
				profile_picture_url: response.profile_picture_url ?? null,
				followers_count: response.followers_count ?? null,
				follows_count: response.follows_count ?? null,
				media_count: response.media_count ?? null,
				access_token: env.INSTAGRAM_BOT_TOKEN,
			};
			await databaseClient.saveInstagramProfessionalUser(user);
		}
	}
	return user;
};

export default {
	fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
		// Lazy initialize router
		if (!router) {
			router = createRouter(env);
		}

		const app: App = {
			instagram: new Instagram(env.INSTAGRAM_BOT_TOKEN, env),
			databaseClient: new Database(env.DB),
			isLocalhost: request.headers.get('Host')?.match(/^(localhost|127\.0\.0\.1)/) !== null,
			getInstagramUser: () => getInstagramUser(env),
		};

		// You can use ctx.waitUntil() here if you need to perform any background tasks

		return router.fetch(request, env, ctx);
	},
};
