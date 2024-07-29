import { App, Env } from './types';

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

		// Implement your message handling logic here
		// For example:
		// await sendReply(sender.id, "Thank you for your message!");
	} else {
		console.warn('Received incomplete message data:', value);
		// Handle incomplete data case
	}

	// Add any additional processing logic here
}
