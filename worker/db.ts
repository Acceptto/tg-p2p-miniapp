interface InstagramProfessionalUser {
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

class Database {
	private db: any;

	constructor(databaseConnection: any) {
		this.db = databaseConnection;
	}

	async getInstagramProfessionalUserByToken(
		accessToken: string
	): Promise<InstagramProfessionalUser | null> {
		const query = `
            SELECT *
            FROM instagramProfessionalUser
            WHERE access_token = ?
        `;
		return (await this.db
			.prepare(query)
			.bind(accessToken)
			.first()) as InstagramProfessionalUser | null;
	}

	async getInstagramProfessionalUserByAppScopedId(
		appScopedId: string
	): Promise<InstagramProfessionalUser | null> {
		const query = `
            SELECT *
            FROM instagramProfessionalUser
            WHERE app_scoped_id = ?
        `;
		return (await this.db
			.prepare(query)
			.bind(appScopedId)
			.first()) as InstagramProfessionalUser | null;
	}

	async saveInstagramProfessionalUser(user: InstagramProfessionalUser): Promise<boolean> {
		const query = `
            INSERT INTO instagramProfessionalUser (
                app_scoped_id, user_id, username, name, account_type, profile_picture_url,
                followers_count, follows_count, media_count, access_token
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (app_scoped_id) DO UPDATE SET
                user_id = excluded.user_id,
                username = excluded.username,
                name = excluded.name,
                account_type = excluded.account_type,
                profile_picture_url = excluded.profile_picture_url,
                followers_count = excluded.followers_count,
                follows_count = excluded.follows_count,
                media_count = excluded.media_count,
                access_token = excluded.access_token
        `;
		try {
			const result = await this.db
				.prepare(query)
				.bind(
					user.app_scoped_id,
					user.user_id,
					user.username,
					user.name,
					user.account_type,
					user.profile_picture_url,
					user.followers_count,
					user.follows_count,
					user.media_count,
					user.access_token
				)
				.run();
			return result.changes > 0;
		} catch (error) {
			console.error('Error saving Instagram user:', error);
			return false;
		}
	}
}

export { Database, InstagramProfessionalUser };
