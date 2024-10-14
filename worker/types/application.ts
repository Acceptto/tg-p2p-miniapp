import { Instagram } from '../instagram';
import { DatabaseClient, InstagramProfessionalUser } from '../types/database';

/**
 * Environment variables and bindings for the Cloudflare Workers application.
 */
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

/**
 * Application context containing essential components and configuration.
 */
export interface App {
	instagram: Instagram;
	databaseClient: DatabaseClient;
}
