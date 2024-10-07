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

	private async getKey(): Promise<CryptoKey> {
		const encoder = new TextEncoder();
		const keyData = encoder.encode(this.secret);
		return await crypto.subtle.importKey(
			'raw',
			keyData,
			{ name: 'HMAC', hash: { name: this.algorithm.toUpperCase() } },
			false,
			['sign']
		);
	}

	async sign(payload: string): Promise<string> {
		const key = await this.getKey();
		const encoder = new TextEncoder();
		const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
		const hashArray = Array.from(new Uint8Array(signature));
		const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
		return `${this.algorithm}=${hashHex}`;
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
