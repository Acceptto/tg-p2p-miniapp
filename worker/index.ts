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

interface InstagramApiResponse {
	id: string; // This is the app-scoped ID from the API
	user_id: string;
	username?: string;
	name?: string;
	account_type?: string;
	followers_count?: number;
	follows_count?: number;
	media_count?: number;
	profile_picture_url?: string;
}

// Type guard for InstagramApiResponse
function isInstagramApiResponse(response: any): response is InstagramApiResponse {
	return (
		typeof response === 'object' &&
		typeof response.id === 'string' &&
		typeof response.user_id === 'string'
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
			if (isInstagramApiResponse(me)) {
				instagram_professional_user = {
					app_scoped_id: me.id, // Store the app-scoped ID from the API
					user_id: me.user_id,
					username: me.username,
					name: me.name,
					account_type: me.account_type,
					profile_picture_url: me.profile_picture_url,
					followers_count: me.followers_count,
					follows_count: me.follows_count,
					media_count: me.media_count,
					access_token: env.INSTAGRAM_BOT_TOKEN, // Assuming this is the correct token
				};

				const saveResult = await db.saveInstagramProfessionalUser(instagram_professional_user);
				if (!saveResult) {
					console.error('Failed to save Instagram user');
				} else {
					// After saving, fetch the user again to get the auto-incremental ID
					instagram_professional_user = await db.getInstagramProfessionalUserByAppScopedId(me.id);
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

// ... rest of the code remains the same

export default {
	fetch: handle,
};
