import { InstagramProfessionalUser } from './types';

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

	async getInstagramProfessionalUserByIGID(
		userId: string
	): Promise<InstagramProfessionalUser | null> {
		const query = `
            SELECT *
            FROM instagramProfessionalUser
            WHERE user_id = ?
        `;
		return (await this.db.prepare(query).bind(userId).first()) as InstagramProfessionalUser | null;
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
			console.log('Saving Instagram user:', JSON.stringify(user, null, 2));
			const result = await this.db
				.prepare(query)
				.bind(
					user.app_scoped_id,
					user.user_id,
					user.username,
					user.name || null,
					user.account_type || null,
					user.profile_picture_url || null,
					user.followers_count || null,
					user.follows_count || null,
					user.media_count || null,
					user.access_token
				)
				.run();
			console.log('Database operation result:', JSON.stringify(result, null, 2));
			return result.success;
		} catch (error) {
			console.error('Error saving Instagram user:', error);
			console.error('User data:', JSON.stringify(user, null, 2));
			return false;
		}
	}
}

export { Database, InstagramProfessionalUser };
