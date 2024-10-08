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

	if (message.sender?.id && message.recipient?.id && message.message?.text) {
		console.log(
			`Received message from ${message.sender.id} to ${message.recipient.id} at ${message.timestamp || 'unknown time'}`
		);
		console.log(`Message content: ${message.message.text}`);

		switch (message.message.text.toLowerCase().trim()) {
			case 'view_group_buys':
				console.log('Matched "view_group_buys" command');
				await handleTravelMessage(message.sender.id, message.recipient.id, app, env);
				break;
			default:
				console.log('Unrecognized command');
				await sendDefaultReply(message.sender.id, app, env);
		}
	} else {
		console.warn('Received incomplete message data:', message);
	}
}

async function handleTravelMessage(igId: string, igsId: string, app: App, env: Env): Promise<void> {
	console.log('Entering handleTravelMessage for igId:', igId);
	const messageTitle = 'Check out our latest group buys!';
	const imageUrl = 'https://placehold.co/600x400';
	const messageSubtitle = 'Great deals on travel packages';
	const websiteUrl = 'https://example.com/group-buys';
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
