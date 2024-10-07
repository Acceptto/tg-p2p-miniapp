import { hmacSha256, hex } from './cryptoUtils';
import { App, Env } from './types';

const INSTAGRAM_API_BASE_URL = 'https://graph.instagram.com';

class InstagramAPI {
	private token: string;
	private apiBaseUrl: string;

	constructor(token: string, useTestApi: boolean = false) {
		this.token = token;
		const version = 'v21.0';
		this.apiBaseUrl = `${INSTAGRAM_API_BASE_URL}/${version}/`;
	}

	async getMe(token?: string): Promise<any> {
		const useToken = token || this.token;
		const url = `${this.apiBaseUrl}me?fields=id,user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count&access_token=${useToken}`;
		console.log('Fetching user data from Instagram API:', url);
		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();
			console.log('Instagram API response for getMe:', data);
			return data;
		} catch (error) {
			console.error('Error fetching user data from Instagram API:', error);
			throw error;
		}
	}

	async sendTemplate(
		igId: string,
		messageTitle: string,
		imageUrl: string,
		messageSubtitle: string,
		websiteUrl: string,
		firstButtonTitle: string,
		secondButtonTitle: string,
		app: App,
		env: Env
	): Promise<any> {
		console.log('Preparing to send template message to igId:', igId);
		const url = `${this.apiBaseUrl}${igId}/messages?access_token=${this.token}`;
		const body = {
			recipient: {
				id: igId,
			},
			message: {
				attachment: {
					type: 'template',
					payload: {
						template_type: 'generic',
						elements: [
							{
								title: messageTitle,
								image_url: imageUrl,
								subtitle: messageSubtitle,
								default_action: {
									type: 'web_url',
									url: websiteUrl,
								},
								buttons: [
									{
										type: 'web_url',
										url: websiteUrl,
										title: firstButtonTitle,
									},
									{
										type: 'postback',
										title: secondButtonTitle,
										payload: 'PAYLOAD_TO_INCLUDE_FOR_BUTTON_2',
									},
								],
							},
						],
					},
				},
			},
		};
		console.log('Sending request to Instagram API:', url);
		console.log('Request body:', JSON.stringify(body, null, 2));
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});
			const responseData = await response.json();
			console.log('Instagram API response:', responseData);
			if (!response.ok) {
				throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
			}
			return responseData;
		} catch (error) {
			console.error('Error calling Instagram API:', error);
			throw error;
		}
	}

	async sendMessage(igId: string, text: string): Promise<any> {
		console.log(`Sending message to ${igId}: ${text}`);
		const url = `${this.apiBaseUrl}${igId}/messages?access_token=${this.token}`;
		const body = {
			recipient: {
				id: igId,
			},
			message: {
				text: text,
			},
		};
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});
			const responseData = await response.json();
			console.log('Instagram API response for sendMessage:', responseData);
			if (!response.ok) {
				throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
			}
			return responseData;
		} catch (error) {
			console.error('Error sending message via Instagram API:', error);
			throw error;
		}
	}
}

export { InstagramAPI as Instagram };
