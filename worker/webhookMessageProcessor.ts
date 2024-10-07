import { App, Env } from './types';
import { Instagram } from './instagram';

interface MessageValue {
	sender?: { id: string };
	recipient?: { id: string };
	timestamp?: string;
	message?: {
		mid?: string;
		text?: string;
	};
}

export async function processField(field: string, value: any, app: App, env: Env): Promise<void> {
	console.log(`Processing field: ${field}`);
	switch (field) {
		case 'messages':
			if (value) {
				await processMessage(value, app, env);
			} else {
				console.log('Message field changed, but no value provided');
			}
			break;
		default:
			console.log(`Unhandled field: ${field}`);
	}
}

export async function processMessage(value: MessageValue, app: App, env: Env): Promise<void> {
	console.log('Processing message:', JSON.stringify(value, null, 2));

	if (!value || typeof value !== 'object') {
		console.error('Invalid message value received');
		return;
	}

	const { sender, recipient, timestamp, message } = value;

	if (sender?.id && recipient?.id && message?.text) {
		console.log(
			`Received message from ${sender.id} to ${recipient.id} at ${timestamp || 'unknown time'}`
		);
		console.log(`Message content: ${message.text}`);

		switch (message.text.toLowerCase().trim()) {
			case 'view_group_buys':
				console.log('Matched "view_group_buys" command');
				await handleTravelMessage(sender.id, app, env);
				break;
			case 'weather':
				await handleWeatherMessage(sender.id, app, env);
				break;
			case 'help':
				await sendHelpMessage(sender.id, app, env);
				break;
			default:
				await sendDefaultReply(sender.id, app, env);
		}
	} else {
		console.warn('Received incomplete message data:', value);
	}
}

async function handleTravelMessage(igId: string, app: App, env: Env): Promise<void> {
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

async function handleWeatherMessage(senderId: string, app: App, env: Env): Promise<void> {
	console.log('Handling weather message for senderId:', senderId);
	await sendReply(senderId, "Here's today's weather forecast...", app, env);
}

async function sendHelpMessage(senderId: string, app: App, env: Env): Promise<void> {
	console.log('Sending help message to senderId:', senderId);
	const helpMessage = "Available commands: 'view_group_buys', 'weather', 'help'";
	await sendReply(senderId, helpMessage, app, env);
}

async function sendDefaultReply(senderId: string, app: App, env: Env): Promise<void> {
	console.log('Sending default reply to senderId:', senderId);
	await sendReply(
		senderId,
		"I didn't understand that. Type 'help' for available commands.",
		app,
		env
	);
}

async function sendReply(senderId: string, message: string, app: App, env: Env): Promise<void> {
	console.log(`Sending reply to ${senderId}: ${message}`);
	const instagram = new Instagram(env.INSTAGRAM_BOT_TOKEN);
	try {
		const result = await instagram.sendMessage(senderId, message);
		console.log('Reply sent successfully:', result);
	} catch (error) {
		console.error('Error sending reply:', error);
	}
}
