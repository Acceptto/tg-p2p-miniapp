import { Database } from './db';
import { Instagram } from './instagram';

export interface App {
	instagram: Instagram;
	db: Database;
	corsHeaders: Record<string, string>;
	isLocalhost: boolean;
	instagram_professional_user: InstagramProfessionalUser | null;
}

export interface Env {
	INSTAGRAM_BOT_TOKEN: string;
	DB: D1Database;
	FRONTEND_URL: string;
	WEBHOOK_VERIFY_TOKEN: string;
	INSTAGRAM_APP_SECRET: string;
	INSTAGRAM_API_BASE_URL: string;
}

export interface InstagramProfessionalUser {
	id?: number; // Auto-incremental ID from your database
	app_scoped_id: string; // App-scoped ID from the API
	user_id: string;
	username: string;
	name?: string | null;
	account_type?: string | null;
	profile_picture_url?: string | null;
	followers_count?: number | null;
	follows_count?: number | null;
	media_count?: number | null;
	access_token: string;
}
