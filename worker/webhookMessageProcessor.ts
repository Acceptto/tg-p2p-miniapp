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
				// You might want to fetch the latest messages here
			}
			break;
		// Add more cases for other fields you want to handle
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

		switch (message.text.toLowerCase()) {
			case 'view_group_buys':
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
		// Handle incomplete data case
	}
}

async function handleTravelMessage(igId: string, app: App, env: Env): Promise<void> {
	const messageTitle = 'Check out our latest group buys!';
	const imageUrl = 'https://placehold.co/600x400';
	const messageSubtitle = 'Great deals on travel packages';
	const websiteUrl = 'https://example.com/group-buys';
	const firstButtonTitle = 'View Deals';
	const secondButtonTitle = 'Learn More';
	const instagram = new Instagram(env.INSTAGRAM_BOT_TOKEN);

	await instagram.sendTemplate(
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
}

async function handleWeatherMessage(senderId: string, app: App, env: Env): Promise<void> {
	// Implement weather-specific logic here
	await sendReply(senderId, "Here's today's weather forecast...", app, env);
}

async function sendHelpMessage(senderId: string, app: App, env: Env): Promise<void> {
	const helpMessage = "Available commands: 'travel', 'weather', 'help'";
	await sendReply(senderId, helpMessage, app, env);
}

async function sendDefaultReply(senderId: string, app: App, env: Env): Promise<void> {
	await sendReply(
		senderId,
		"I didn't understand that. Type 'help' for available commands.",
		app,
		env
	);
}

async function sendReply(senderId: string, message: string, app: App, env: Env): Promise<void> {
	// Implement your message sending logic here
	console.log(`Sending reply to ${senderId}: ${message}`);
	// Use app and env as needed for sending the reply
}
