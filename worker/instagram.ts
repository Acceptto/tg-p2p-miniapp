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
		igsId: string,
		titles: string[],
		imageUrls: string[],
		subtitles: string[],
		websiteUrls: string[],
		firstButtonTitles: string[],
		secondButtonTitles: string[],
		app: App,
		env: Env
	): Promise<any> {
		console.log('Preparing to send template message to igId:', igId);
		const url = `${this.apiBaseUrl}${igsId}/messages?access_token=${this.token}`;
		const elements = titles.map((title, index) => ({
			title: title,
			image_url: imageUrls[index],
			subtitle: subtitles[index],
			default_action: {
				type: 'web_url',
				url: websiteUrls[index],
			},
			buttons: [
				{
					type: 'web_url',
					url: websiteUrls[index],
					title: firstButtonTitles[index],
				},
				{
					type: 'postback',
					title: secondButtonTitles[index],
					payload: `PAYLOAD_${index + 1}`,
				},
			],
		}));

		const body = {
			recipient: {
				id: igId,
			},
			message: {
				attachment: {
					type: 'template',
					payload: {
						template_type: 'generic',
						elements: elements,
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

	async sendMessage(igId: string, message: any): Promise<any> {
		console.log(`Sending message to ${igId}:`, message);
		const url = `${this.apiBaseUrl}${igId}/messages`;
		const body = {
			recipient: {
				id: igId,
			},
			message: message,
		};

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.token}`,
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

	async sendTextMessage(igId: string, text: string): Promise<any> {
		return this.sendMessage(igId, { text: text });
	}

	async sendImageMessage(igId: string, imageUrl: string): Promise<any> {
		return this.sendMessage(igId, {
			attachment: {
				type: 'image',
				payload: {
					url: imageUrl,
				},
			},
		});
	}

	async sendAudioMessage(igId: string, audioUrl: string): Promise<any> {
		return this.sendMessage(igId, {
			attachment: {
				type: 'audio',
				payload: {
					url: audioUrl,
				},
			},
		});
	}

	async sendVideoMessage(igId: string, videoUrl: string): Promise<any> {
		return this.sendMessage(igId, {
			attachment: {
				type: 'video',
				payload: {
					url: videoUrl,
				},
			},
		});
	}

	async sendStickerMessage(igId: string): Promise<any> {
		return this.sendMessage(igId, {
			attachment: {
				type: 'like_heart',
			},
		});
	}

	async sendReaction(igId: string, messageId: string, reaction: string = 'love'): Promise<any> {
		const url = `${this.apiBaseUrl}${igId}/messages`;
		const body = {
			recipient: {
				id: igId,
			},
			sender_action: 'react',
			payload: {
				message_id: messageId,
				reaction: reaction,
			},
		};

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			const responseData = await response.json();
			console.log('Instagram API response for sendReaction:', responseData);

			if (!response.ok) {
				throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
			}

			return responseData;
		} catch (error) {
			console.error('Error sending reaction via Instagram API:', error);
			throw error;
		}
	}

	async sendPostMessage(igId: string, postId: string): Promise<any> {
		return this.sendMessage(igId, {
			attachment: {
				type: 'MEDIA_SHARE',
				payload: {
					id: postId,
				},
			},
		});
	}
}

export { InstagramAPI as Instagram };
