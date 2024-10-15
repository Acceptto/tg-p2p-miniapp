import {
	DatabaseClient,
	InstagramProfessionalUser,
	CreateInstagramProfessionalUser,
	InstagramUserInteraction,
	CreateInstagramUserInteraction,
	InstagramUserProfile,
} from './types/database';

/**
 * Represents a database connection and provides methods to interact with Instagram Professional User data.
 */
class Database implements DatabaseClient {
	private db: D1Database;

	/**
	 * Creates a new Database instance.
	 * @param databaseConnection - The database connection object.
	 */
	constructor(databaseConnection: D1Database) {
		this.db = databaseConnection;
	}

	/**
	 * Retrieves an Instagram Professional User by their access token.
	 * @param accessToken - The access token of the Instagram Professional User.
	 * @returns A Promise that resolves to the InstagramProfessionalUser or null if not found.
	 */
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

	/**
	 * Retrieves an Instagram Professional User by their Instagram User ID.
	 * @param userId - The Instagram User ID of the Professional User.
	 * @returns A Promise that resolves to the InstagramProfessionalUser or null if not found.
	 */
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

	/**
	 * Saves or updates an Instagram Professional User in the database.
	 * @param user - The InstagramProfessionalUser object to save or update.
	 * @returns A Promise that resolves to a boolean indicating success or failure.
	 */
	async saveInstagramProfessionalUser(user: CreateInstagramProfessionalUser): Promise<boolean> {
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

	/**
	 * Saves or updates an Instagram User Profile in the database.
	 * @param profile - The Instagram User Profile object to save or update.
	 * @returns A Promise that resolves to a boolean indicating success or failure.
	 */
	async saveInstagramUserProfile(profile: InstagramUserProfile): Promise<boolean> {
		const query = `
			INSERT INTO instagramUserProfile (
				instagram_scoped_id, follower_count, is_business_follow_user,
				is_user_follow_business, is_verified_user, name, username
			) VALUES (?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT (instagram_scoped_id) DO UPDATE SET
				follower_count = excluded.follower_count,
				is_business_follow_user = excluded.is_business_follow_user,
				is_user_follow_business = excluded.is_user_follow_business,
				is_verified_user = excluded.is_verified_user,
				name = excluded.name,
				username = excluded.username,
				updated_at = CURRENT_TIMESTAMP
		`;

		try {
			console.log('Saving Instagram user profile:', JSON.stringify(profile, null, 2));
			const result = await this.db
				.prepare(query)
				.bind(
					profile.instagram_scoped_id,
					profile.follower_count,
					profile.is_business_follow_user,
					profile.is_user_follow_business,
					profile.is_verified_user || false, // Assuming false if not provided
					profile.name || null,
					profile.username
				)
				.run();
			console.log('Database operation result:', JSON.stringify(result, null, 2));
			return result.success;
		} catch (error) {
			console.error('Error saving Instagram user profile:', error);
			console.error('Profile data:', JSON.stringify(profile, null, 2));
			return false;
		}
	}

	/**
	 * Inserts a new Instagram user interaction into the database.
	 * @param interaction - The Instagram user interaction object to insert.
	 * @returns A Promise that resolves to a boolean indicating success or failure.
	 */
	async insertInstagramUserInteraction(
		interaction: CreateInstagramUserInteraction
	): Promise<boolean> {
		const query = `
      INSERT INTO instagramUserInteraction (
        instagram_scoped_id, professional_user_id, timestamp, additional_data
      ) VALUES (?, ?, ?, json(?))
    `;

		try {
			console.log('Inserting Instagram user interaction:', JSON.stringify(interaction, null, 2));
			const result = await this.db
				.prepare(query)
				.bind(
					interaction.instagram_scoped_id,
					interaction.professional_user_id,
					interaction.timestamp,
					JSON.stringify(interaction.additional_data) // Using D1's json() function
				)
				.run();
			console.log('Database operation result:', JSON.stringify(result, null, 2));
			return result.success;
		} catch (error) {
			console.error('Error inserting Instagram user interaction:', error);
			console.error('Interaction data:', JSON.stringify(interaction, null, 2));
			return false;
		}
	}

	async getInstagramUserInteractions(
		professionalUserId: string,
		limit: number = 10
	): Promise<InstagramUserInteraction[]> {
		const query = `
      SELECT
        id,
        instagram_scoped_id,
        professional_user_id,
        timestamp
      FROM instagramUserInteraction
      WHERE professional_user_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;

		try {
			const result = await this.db.prepare(query).bind(professionalUserId, limit).all();

			return (result.results as any[]).map(
				(row): InstagramUserInteraction => ({
					id: row.id,
					instagram_scoped_id: row.instagram_scoped_id,
					professional_user_id: row.professional_user_id,
					timestamp: row.timestamp,
					additional_data: row.additional_data,
				})
			);
		} catch (error) {
			console.error('Error retrieving Instagram user interactions:', error);
			return [];
		}
	}

	async saveProfileAndInteraction(
		profile: InstagramUserProfile,
		interaction: CreateInstagramUserInteraction
	): Promise<{
		profileSaved: boolean;
		interactionSaved: boolean;
		isNewProfile: boolean;
	}> {
		const profileQuery = `
    INSERT INTO instagramUserProfile (
      instagram_scoped_id, follower_count, is_business_follow_user,
      is_user_follow_business, name, username
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (instagram_scoped_id) DO UPDATE SET
      follower_count = excluded.follower_count,
      is_business_follow_user = excluded.is_business_follow_user,
      is_user_follow_business = excluded.is_user_follow_business,
      name = excluded.name,
      username = excluded.username,
      updated_at = CURRENT_TIMESTAMP
    RETURNING (changes() = 0) AS is_updated;
  `;

		const interactionQuery = `
    INSERT INTO instagramUserInteraction (
      instagram_scoped_id, professional_user_id, timestamp, additional_data
    ) VALUES (?, ?, ?, json(?));
  `;

		try {
			const results = await this.db.batch([
				this.db
					.prepare(profileQuery)
					.bind(
						profile.instagram_scoped_id,
						profile.follower_count,
						profile.is_business_follow_user,
						profile.is_user_follow_business,
						profile.name || null,
						profile.username
					),
				this.db
					.prepare(interactionQuery)
					.bind(
						interaction.instagram_scoped_id,
						interaction.professional_user_id,
						interaction.timestamp,
						JSON.stringify(interaction.additional_data)
					),
			]);

			// Explicitly type and check the results
			const profileResult = results[0] as D1Result<{ is_updated: number }> | undefined;
			const interactionResult = results[1] as D1Result<{}> | undefined;

			const profileSaved = profileResult?.success ?? false;
			const interactionSaved = interactionResult?.success ?? false;
			const isNewProfile = profileResult?.results?.[0]?.is_updated === 0;

			return {
				profileSaved,
				interactionSaved,
				isNewProfile,
			};
		} catch (error: any) {
			console.error('Error saving profile and interaction:', error.message);
			return {
				profileSaved: false,
				interactionSaved: false,
				isNewProfile: false,
			};
		}
	}
}

export { Database };
export type {
	InstagramProfessionalUser,
	CreateInstagramProfessionalUser,
	InstagramUserInteraction,
	InstagramUserProfile,
};
