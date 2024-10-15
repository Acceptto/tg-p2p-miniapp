import { Env, App } from './types/application';
import { InstagramUserProfile, CreateInstagramUserInteraction } from './types/database';

/**
 * Represents an API client for interacting with the Instagram Graph API.
 */
class InstagramAPI {
	private token: string;
	private apiBaseUrl: string;

	/**
	 * Creates an instance of InstagramAPI.
	 * @param token - The access token for authentication with the Instagram API.
	 * @param useTestApi - Optional boolean flag to use a test API (currently unused).
	 */
	constructor(token: string, env: Env) {
		this.token = token;
		this.apiBaseUrl = `${env.INSTAGRAM_API_BASE_URL}`;
	}

	/**
	 * Fetches the current user's Business Instagram profile information.
	 *
	 * @param token - Optional access token to use for the API request. If not provided, the instance's token will be used.
	 * @returns A Promise that resolves to the user's profile data.
	 * @throws Will throw an error if the API request fails.
	 */
	async getMe(token?: string): Promise<any> {
		const useToken = token || this.token;
		const url = `${this.apiBaseUrl}me?fields=id,user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count&access_token=${useToken}`;
		console.log('Fetching business user data from Instagram API:', url);
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
			console.error('Error fetching business user data from Instagram API:', error);
			throw error;
		}
	}
	/**
	 * Processes an Instagram user's profile information.
	 *
	 * @param body - The request body containing Instagram webhook data.
	 * @param app - The App object for database operations.
	 * @returns A Promise that resolves to a boolean indicating success of saving the profile.
	 * @throws Will throw an error if the API request fails or if database operations fail.
	 */
	async processInstagramUserProfile(
		body: any,
		app: App
	): Promise<{ profileSaved: boolean; interactionSaved: boolean }> {
		const senderId = body.entry[0]?.messaging?.[0]?.recipient?.id;
		if (!senderId) {
			throw new Error('Sender ID not found in the webhook data');
		}

		const url = `${this.apiBaseUrl}${senderId}?fields=name,username,follower_count,is_verified,is_user_follow_business,is_business_follow_user&access_token=${this.token}`;
		console.log('Fetching instagram profile data from Instagram API:', url);

		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			});

			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`);
			}

			const data = (await response.json()) as {
				follower_count: number;
				is_business_follow_user: boolean;
				is_user_follow_business: boolean;
				name: string;
				username: string;
				is_verified: boolean;
			};

			const profile: InstagramUserProfile = {
				instagram_scoped_id: senderId,
				follower_count: data.follower_count,
				is_business_follow_user: data.is_business_follow_user,
				is_user_follow_business: data.is_user_follow_business,
				is_verified_user: data.is_verified,
				name: data.name,
				username: data.username,
			};

			const interaction: CreateInstagramUserInteraction = {
				instagram_scoped_id: senderId,
				professional_user_id: body.entry[0].id,
				timestamp: new Date().toISOString(),
				additional_data: body,
			};

			const profileSaved = await app.databaseClient.saveInstagramUserProfile(profile);
			const interactionSaved = await app.databaseClient.insertInstagramUserInteraction(interaction);

			console.log('Instagram API response for getUserProfile:', data);
			console.log('Profile and interaction save result:', { profileSaved, interactionSaved });

			return { profileSaved, interactionSaved };
		} catch (error) {
			console.error('Error processing Instagram user profile:', error);
			throw error;
		}
	}

	/**
	 * Sends a template message to a specific Instagram user.
	 *
	 * @param igId - The Instagram user ID of the recipient.
	 * @param igsId - The Instagram Business Account ID.
	 * @param titles - An array of titles for each element in the template.
	 * @param imageUrls - An array of image URLs for each element in the template.
	 * @param subtitles - An array of subtitles for each element in the template.
	 * @param websiteUrls - An array of website URLs for each element in the template.
	 * @param firstButtonTitles - An array of titles for the first button of each element.
	 * @param secondButtonTitles - An array of titles for the second button of each element.
	 * @param app - The App object (unused in this method).
	 * @param env - The Env object (unused in this method).
	 * @returns A Promise that resolves to the API response.
	 * @throws Will throw an error if the API request fails.
	 */
	async sendTemplate(
		igId: string,
		igsId: string,
		titles: string[],
		imageUrls: string[],
		subtitles: string[],
		websiteUrls: string[],
		firstButtonTitles: string[],
		secondButtonTitles: string[]
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

	/**
	 * Sends a message to a specific Instagram user.
	 *
	 * @param igId - The Instagram user ID of the recipient.
	 * @param igsId - The Instagram Business Account ID.
	 * @param message - The message object to be sent.
	 * @returns A Promise that resolves to the API response.
	 * @throws Will throw an error if the API request fails.
	 */
	async sendMessage(igId: string, igsId: string, message: any): Promise<any> {
		console.log(`Sending message to ${igsId}:`, message);
		const url = `${this.apiBaseUrl}${igsId}/messages`;
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

	/**
	 * Sends a text message to the specified Instagram user.
	 *
	 * @param igId - The Instagram user ID of the recipient.
	 * @param igsId - The Instagram Business Account ID.
	 * @param text - The text content of the message to be sent.
	 * @returns A Promise that resolves to the API response.
	 */
	async sendTextMessage(igId: string, igsId: string, text: string): Promise<any> {
		return this.sendMessage(igId, igsId, { text: text });
	}

	/**
	 * Sends an image message to the specified Instagram user.
	 *
	 * @param igId - The Instagram user ID of the recipient.
	 * @param igsId - The Instagram Business Account ID.
	 * @param imageUrl - The URL of the image to be sent.
	 * @returns A Promise that resolves to the API response.
	 */
	async sendImageMessage(igId: string, igsId: string, imageUrl: string): Promise<any> {
		return this.sendMessage(igId, igsId, {
			attachment: {
				type: 'image',
				payload: {
					url: imageUrl,
				},
			},
		});
	}

	/**
	 * Sends an audio message to the specified Instagram user.
	 *
	 * @param igId - The Instagram user ID of the recipient.
	 * @param igsId - The Instagram Business Account ID.
	 * @param audioUrl - The URL of the audio file to be sent.
	 * @returns A Promise that resolves to the API response.
	 */
	async sendAudioMessage(igId: string, igsId: string, audioUrl: string): Promise<any> {
		return this.sendMessage(igId, igsId, {
			attachment: {
				type: 'audio',
				payload: {
					url: audioUrl,
				},
			},
		});
	}

	/**
	 * Sends a video message to the specified Instagram user.
	 *
	 * @param igId - The Instagram user ID of the recipient.
	 * @param igsId - The Instagram Business Account ID.
	 * @param videoUrl - The URL of the video to be sent.
	 * @returns A Promise that resolves to the API response.
	 */
	async sendVideoMessage(igId: string, igsId: string, videoUrl: string): Promise<any> {
		return this.sendMessage(igId, igsId, {
			attachment: {
				type: 'video',
				payload: {
					url: videoUrl,
				},
			},
		});
	}

	/**
	 * Sends a sticker message with a "like heart" to the specified Instagram user.
	 *
	 * @param igId - The Instagram user ID of the recipient.
	 * @param igsId - The Instagram Business Account ID.
	 * @returns A Promise that resolves to the API response.
	 */
	async sendStickerMessage(igId: string, igsId: string): Promise<any> {
		return this.sendMessage(igId, igsId, {
			attachment: {
				type: 'like_heart',
			},
		});
	}

	/**
	 * Sends a reaction to a specific message on Instagram.
	 *
	 * @param igId - The Instagram user ID of the recipient.
	 * @param igsId - The Instagram Business Account ID.
	 * @param messageId - The ID of the message to react to.
	 * @param reaction - The type of reaction to send. Defaults to 'love'.
	 * @returns A Promise that resolves to the API response.
	 * @throws Will throw an error if the API request fails.
	 */
	async sendReaction(
		igId: string,
		igsId: string,
		messageId: string,
		reaction: string = 'love'
	): Promise<any> {
		const url = `${this.apiBaseUrl}${igsId}/messages`;
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

	/**
	 * Sends a post message to the specified Instagram user.
	 *
	 * @param igId - The Instagram user ID of the recipient.
	 * @param igsId - The Instagram Business Account ID.
	 * @param postId - The ID of the post to be shared.
	 * @returns A Promise that resolves to the API response.
	 */
	async sendPostMessage(igId: string, igsId: string, postId: string): Promise<any> {
		return this.sendMessage(igId, igsId, {
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
