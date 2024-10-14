export interface InstagramProfessionalUser {
	id?: number;
	app_scoped_id: string;
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

export interface InstagramUserInteraction {
	id: number;
	instagram_scoped_id: string;
	professional_user_id: string;
	timestamp: string;
	additional_data: any; // JSON-serializable data
}

export interface CreateInstagramProfessionalUser extends Omit<InstagramProfessionalUser, 'id'> {}
export interface CreateInstagramUserInteraction extends Omit<InstagramUserInteraction, 'id'> {}

export interface DatabaseClient {
	getInstagramProfessionalUserByToken(
		accessToken: string
	): Promise<InstagramProfessionalUser | null>;
	getInstagramProfessionalUserByIGID(userId: string): Promise<InstagramProfessionalUser | null>;
	saveInstagramProfessionalUser(user: CreateInstagramProfessionalUser): Promise<boolean>;
	insertInstagramUserInteraction(interaction: CreateInstagramUserInteraction): Promise<boolean>;
}
