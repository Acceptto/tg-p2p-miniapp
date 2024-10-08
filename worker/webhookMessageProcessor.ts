import { App, Env } from './types';
import { Instagram } from './instagram';

interface MessageValue {
	sender?: { id: string };
	recipient?: { id: string };
	timestamp?: number;
	message?: {
		mid?: string;
		text?: string;
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
		} else {
			console.warn('Received message without text or postback');
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
			console.log('Matched "view_group_buys" payload from ice breaker');
			await handleTravelMessage(senderId, recipientId, app, env);
			break;
		default:
			console.log('Unrecognized postback payload');
			await sendDefaultReply(senderId, app, env);
	}
}

async function handleMessageText(
	senderId: string,
	recipientId: string,
	text: string,
	app: App,
	env: Env
): Promise<void> {
	switch (text.toLowerCase().trim()) {
		case 'view_group_buys':
			console.log('Matched "view_group_buys" command');
			await handleTravelMessage(senderId, recipientId, app, env);
			break;
		default:
			console.log('Unrecognized command');
			await sendDefaultReply(senderId, app, env);
	}
}

async function handleTravelMessage(igId: string, igsId: string, app: App, env: Env): Promise<void> {
	console.log('Entering handleTravelMessage for igId:', igId, 'and igsId:', igsId);
	const messageTitle = 'Check out our latest group buys!';
	const imageUrl =
		'8XhZk=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/TAL-amalfi-coast-newman-family-NOCHCDBAGS0223-e03f54b7c9c040c4b74823626ec9bdc9.jpg';
	const messageSubtitle = 'Great deals on travel packages';
	const websiteUrl = 'https://google.com';
	const firstButtonTitle = 'View Deals';
	const secondButtonTitle = 'Learn More';
	const instagram = new Instagram(env.INSTAGRAM_BOT_TOKEN);

	try {
		console.log('Sending template message...');
		const result = await instagram.sendTemplate(
			igId,
			igsId,
			messageTitle,
			imageUrl,
			messageSubtitle,
			websiteUrl,
			firstButtonTitle,
			secondButtonTitle,
			app,
			env
		);
		console.log('Template message sent successfully:', result);
	} catch (error) {
		console.error('Error sending template message:', error);
	}
}

async function sendDefaultReply(senderId: string, app: App, env: Env): Promise<void> {
	console.log('Sending default reply to senderId:', senderId);
	const message = "I didn't understand that. Available commands: 'view_group_buys'";
	const instagram = new Instagram(env.INSTAGRAM_BOT_TOKEN);
	try {
		const result = await instagram.sendMessage(senderId, message);
		console.log('Default reply sent successfully:', result);
	} catch (error) {
		console.error('Error sending default reply:', error);
	}
}
