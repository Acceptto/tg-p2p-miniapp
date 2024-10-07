import { hmacSha256, hex } from './cryptoUtils';
import { App, Env } from './types';

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
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});
		return response.json();
	}
}

export { InstagramAPI as Instagram };
