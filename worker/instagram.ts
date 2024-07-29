import { hmacSha256, hex } from './cryptoUtils';

const INSTAGRAM_API_BASE_URL = 'https://graph.instagram.com';

class InstagramAPI {
	private token: string;
	private apiBaseUrl: string;

	constructor(token: string, useTestApi: boolean = false) {
		this.token = token;
		const version = 'v20.0';
		this.apiBaseUrl = `${INSTAGRAM_API_BASE_URL}/${version}/`;
	}

	async getMe(token?: string): Promise<any> {
		const useToken = token || this.token;
		const url = `${this.apiBaseUrl}me?fields=id,user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count&access_token=${useToken}`;
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		return response.json();
	}
}

export { InstagramAPI as Instagram };
