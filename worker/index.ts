import { Router } from 'itty-router';
import { Instagram } from './instagram';
import { Database, InstagramProfessionalUser } from './db';
import { processMessage } from './messageProcessor';
import { MessageSender } from './messageSender';
import { generateSecret, sha256 } from './cryptoUtils';

interface Env {
	INSTAGRAM_BOT_TOKEN: string;
	TELEGRAM_USE_TEST_API: boolean;
	DB: any; // Replace 'any' with your actual database type if possible
	FRONTEND_URL: string;
	INIT_SECRET: string;
}

interface App {
	instagram: Instagram;
	db: Database;
	corsHeaders: Record<string, string>;
	isLocalhost: boolean;
	instagram_professional_user: InstagramProfessionalUser | null;
}

interface InstagramResponse {
	data: InstagramProfessionalUser[];
}

// Type guard for InstagramResponse
function isInstagramResponse(response: any): response is InstagramResponse {
	return (
		Array.isArray(response?.data) &&
		response.data.length > 0 &&
		typeof response.data[0].user_id === 'string' &&
		typeof response.data[0].username === 'string'
	);
}

// Create a new router
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

	let instagram_professional_user = await db.getInstagramProfessionalUserByToken(
		env.INSTAGRAM_BOT_TOKEN
	);

	if (!instagram_professional_user) {
		try {
			const me = await instagram.getMe();
			if (isInstagramResponse(me)) {
				instagram_professional_user = me.data[0];
				if (instagram_professional_user) {
					const saveResult = await db.saveInstagramProfessionalUser(instagram_professional_user);
					if (!saveResult) {
						console.error('Failed to save Instagram user');
					}
				} else {
					console.error('Failed to get user');
				}
			} else {
				console.error('Invalid response format from Instagram API');
			}
		} catch (error) {
			console.error('Failed to get Instagram user data:', error);
		}
	}

	const app: App = { instagram, db, corsHeaders, isLocalhost, instagram_professional_user };
	return await router.handle(request, app, env, ctx);
};

router.get('/', () => {
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

router.all('*', () => new Response('404, not found!', { status: 404 }));

export default {
	fetch: handle,
};
