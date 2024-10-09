import { App, Env } from './types';
import { Instagram } from './instagram';

interface MessageValue {
	sender?: { id: string };
	recipient?: { id: string };
	timestamp?: number;
	message?: {
		mid?: string;
		text?: string;
		attachments?: Array<{
			type: string;
			payload: {
				url: string;
			};
		}>;
	};
	postback?: {
		title: string;
		payload: string;
	};
}

export async function processField(field: string, value: any, app: App, env: Env): Promise<void> {
	console.log(`Processing field: ${field}`);
	console.log('Field value:', JSON.stringify(value, null, 2));

	if (field === 'messaging') {
		if (Array.isArray(value) && value.length > 0) {
			for (const message of value) {
				await processMessage(message, app, env);
			}
		} else {
			console.log('Messaging field is empty or not an array');
		}
	} else {
		console.log(`Unhandled field: ${field}`);
	}
}

async function processMessage(message: MessageValue, app: App, env: Env): Promise<void> {
	console.log('Processing message:', JSON.stringify(message, null, 2));

	if (message.sender?.id && message.recipient?.id) {
		console.log(
			`Received interaction from ${message.sender.id} to ${message.recipient.id} at ${message.timestamp || 'unknown time'}`
		);

		if (message.postback) {
			console.log('Processing ice breaker postback');
			await handlePostback(message.sender.id, message.recipient.id, message.postback, app, env);
		} else if (message.message?.text) {
			console.log(`Processing message text: ${message.message.text}`);
			await handleMessageText(
				message.sender.id,
				message.recipient.id,
				message.message.text,
				app,
				env
			);
		} else if (message.message?.attachments) {
			console.log('Processing message attachments');
			await handleAttachments(
				message.sender.id,
				message.recipient.id,
				message.message.attachments,
				app,
				env
			);
		} else {
			console.warn('Received message without text, postback, or attachments');
		}
	} else {
		console.warn('Received incomplete message data:', message);
	}
}

async function handlePostback(
	senderId: string,
	recipientId: string,
	postback: { title: string; payload: string },
	app: App,
	env: Env
): Promise<void> {
	console.log(`Handling postback: ${postback.title} with payload: ${postback.payload}`);

	switch (postback.payload.toLowerCase().trim()) {
		case 'learn_group_buying':
			console.log('Matched "learn_group_buying" payload from ice breaker');
			await handleTravelMessage(senderId, recipientId, app, env);
			break;
		default:
			console.log('Unrecognized postback payload');
			await sendDefaultReply(senderId, recipientId, app, env);
	}
}

async function handleMessageText(
	igId: string,
	igsId: string,
	text: string,
	app: App,
	env: Env
): Promise<void> {
	switch (text.toLowerCase().trim()) {
		case 'view_group_buys':
			console.log('Matched "view_group_buys" command');
			await handleTravelMessage(igId, igsId, app, env);
			break;
		default:
			console.log('Unrecognized command');
			await sendDefaultReply(igId, igsId, app, env);
	}
}

async function handleTravelMessage(igId: string, igsId: string, app: App, env: Env): Promise<void> {
	console.log('Entering handleTravelMessage for igId:', igId, 'and igsId:', igsId);
	const titles = [
		'Amalfi Coast Adventure',
		'Tokyo City Exploration',
		'African Safari Experience',
		'Caribbean Cruise Getaway',
		'Northern Lights in Iceland',
	];
	const imageUrls = [
		'https://upload.wikimedia.org/wikipedia/commons/0/0d/Positano-Amalfi_Coast-Italy.jpg',
		'https://upload.wikimedia.org/wikipedia/commons/9/98/Tokyo_aerial_night.jpg',
		'https://upload.wikimedia.org/wikipedia/commons/0/06/Sabi_sabi_game_drive.jpg',
		'https://upload.wikimedia.org/wikipedia/commons/2/25/Mariner_of_the_Seas_cruise_ship.jpg',
		'https://upload.wikimedia.org/wikipedia/commons/c/cf/Northern_Lights_02.jpg',
	];
	const subtitles = [
		'Explore the beautiful Amalfi Coast',
		'Discover the wonders of Tokyo',
		'Experience wildlife in its natural habitat',
		'Relax on a luxurious Caribbean cruise',
		'Witness the magical Northern Lights',
	];
	const websiteUrls = [
		'https://www.google.com/search?q=amalfi+tour',
		'https://www.google.com/search?q=tokyo+city+tour',
		'https://www.google.com/search?q=african+safari+tour',
		'https://www.google.com/search?q=caribbean+cruise+tour',
		'https://www.google.com/search?q=northern+lights+tour',
	];
	const firstButtonTitles = [
		'Book Amalfi Tour',
		'Book Tokyo Tour',
		'Book Safari Tour',
		'Book Cruise',
		'Book Iceland Tour',
	];
	const secondButtonTitles = [
		'Learn More About Amalfi',
		'Learn More About Tokyo',
		'Learn More About Safaris',
		'Learn More About Cruises',
		'Learn More About Northern Lights',
	];
	const instagram = new Instagram(env.INSTAGRAM_BOT_TOKEN);

	try {
		console.log('Sending template message...');
		const result = await instagram.sendTemplate(
			igId,
			igsId,
			titles,
			imageUrls,
			subtitles,
			websiteUrls,
			firstButtonTitles,
			secondButtonTitles,
			app,
			env
		);

		const thankYouMessage =
			'Thank you for mentioning us in your story! We really appreciate it. 😊';

		// Send a text message
		await instagram.sendTextMessage(igId, igsId, thankYouMessage);

		// Send a heart sticker
		await instagram.sendStickerMessage(igId, igsId);

		console.log('Template message sent successfully:', result);
	} catch (error) {
		console.error('Error sending template message:', error);
	}
}

async function handleAttachments(
	senderId: string,
	recipientId: string,
	attachments: Array<{ type: string; payload: { url: string } }>,
	app: App,
	env: Env
): Promise<void> {
	for (const attachment of attachments) {
		if (attachment.type === 'story_mention') {
			await handleStoryMention(senderId, recipientId, attachment.payload, app, env);
		} else {
			console.log(`Unhandled attachment type: ${attachment.type}`);
		}
	}
}

async function handleStoryMention(
	igId: string,
	igsId: string,
	payload: { url: string },
	app: App,
	env: Env
): Promise<void> {
	console.log(`Handling story mention from ${igId} to ${igsId}`);
	console.log(`Story mention URL: ${payload.url}`);

	const instagram = new Instagram(env.INSTAGRAM_BOT_TOKEN);
	const thankYouMessage = 'Thank you for mentioning us in your story! We really appreciate it. 😊';

	try {
		// Send a text message
		await instagram.sendTextMessage(igId, igsId, thankYouMessage);

		// Send a heart sticker
		await instagram.sendStickerMessage(igId, igsId);

		console.log('Thank you message and sticker sent successfully');
	} catch (error) {
		console.error('Error sending thank you message and sticker:', error);
	}

	// TODO: Add logic to store the mention or perform other actions
}

async function sendDefaultReply(igId: string, igsId: string, app: App, env: Env): Promise<void> {
	console.log('Sending default reply to senderId:', igId);
	const message = "I didn't understand that. Available commands: 'view_group_buys'";
	const instagram = new Instagram(env.INSTAGRAM_BOT_TOKEN);
	try {
		const result = await instagram.sendTextMessage(igId, igsId, message);
		console.log('Default reply sent successfully:', result);
	} catch (error) {
		console.error('Error sending default reply:', error);
	}
}
