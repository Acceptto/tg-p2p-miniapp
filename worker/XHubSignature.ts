export default class XHubSignature {
	private algorithm: string;
	private secret: string;

	constructor(algorithm: string, secret: string) {
		if (!algorithm) {
			throw new Error('Algorithm is required');
		}
		if (!secret) {
			throw new Error('Secret is required');
		}
		this.algorithm = algorithm;
		this.secret = secret;
	}

	private async calculateHmacSha256(message: string): Promise<ArrayBuffer> {
		const encoder = new TextEncoder();
		const keyData = encoder.encode(this.secret);
		const messageData = encoder.encode(message);

		const cryptoKey = await crypto.subtle.importKey(
			'raw',
			keyData,
			{ name: 'HMAC', hash: 'SHA-256' },
			false,
			['sign']
		);

		return crypto.subtle.sign('HMAC', cryptoKey, messageData);
	}

	private bufferToHex(buffer: ArrayBuffer): string {
		return Array.from(new Uint8Array(buffer))
			.map(b => b.toString(16).padStart(2, '0'))
			.join('');
	}

	async sign(payload: string): Promise<string> {
		const signatureBuffer = await this.calculateHmacSha256(payload);
		const signatureHex = this.bufferToHex(signatureBuffer);
		return `${this.algorithm}=${signatureHex}`;
	}

	async verify(expectedSignature: string, payload: string): Promise<boolean> {
		const calculatedSignature = await this.sign(payload);
		console.log('Expected signature:', expectedSignature);
		console.log('Calculated signature:', calculatedSignature);
		return this.timingSafeEqual(expectedSignature, calculatedSignature);
	}

	private timingSafeEqual(a: string, b: string): boolean {
		if (a.length !== b.length) {
			return false;
		}
		let result = 0;
		for (let i = 0; i < a.length; i++) {
			result |= a.charCodeAt(i) ^ b.charCodeAt(i);
		}
		return result === 0;
	}
}
