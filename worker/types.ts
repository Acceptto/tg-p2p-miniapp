import { Database } from './databaseClient';
import { Instagram } from './instagram';

export interface Env {
	// Environment Variables
	INSTAGRAM_BOT_TOKEN: string;
	DB: D1Database;
	FRONTEND_URL: string;
	WEBHOOK_VERIFY_TOKEN: string;
	INSTAGRAM_APP_SECRET: string;
	INSTAGRAM_API_BASE_URL: string;

	// KV Namespaces
	KV: KVNamespace;

	// Durable Objects
	COUNTER: DurableObjectNamespace;

	// R2 Buckets
	MY_BUCKET: R2Bucket;

	// Queues
	MY_QUEUE: Queue;
}

export interface App {
	instagram: Instagram;
	databaseClient: Database;
	corsHeaders: Record<string, string>;
	isLocalhost: boolean;
	instagram_professional_user: InstagramProfessionalUser | null;
}

export interface DatabaseClient {
	getInstagramProfessionalUserByToken(
		accessToken: string
	): Promise<InstagramProfessionalUser | null>;
	getInstagramProfessionalUserByIGID(userId: string): Promise<InstagramProfessionalUser | null>;
	saveInstagramProfessionalUser(user: InstagramProfessionalUser): Promise<boolean>;
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
