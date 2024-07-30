export default class XHubSignature {
	private algorithm: string;
	private secret: string;
	private encoder: TextEncoder;

	constructor(algorithm: string, secret: string) {
		if (!algorithm) {
			throw new Error('Algorithm is required');
		}
		if (!secret) {
			throw new Error('Secret is required');
		}
		this.algorithm = algorithm;
		this.secret = secret;
		this.encoder = new TextEncoder();
	}

	private async getKey(): Promise<CryptoKey> {
		const keyData = this.encoder.encode(this.secret);
		return await crypto.subtle.importKey(
			'raw',
			keyData,
			{ name: 'HMAC', hash: { name: this.getHashAlgorithm() } },
			false,
			['sign']
		);
	}

	private getHashAlgorithm(): string {
		switch (this.algorithm) {
			case 'sha256':
				return 'SHA-256';
			case 'sha1':
				return 'SHA-1';
			default:
				throw new Error(`Unsupported algorithm: ${this.algorithm}`);
		}
	}

	async sign(requestBody: string): Promise<string> {
		const key = await this.getKey();
		const data = this.encoder.encode(requestBody);
		const signature = await crypto.subtle.sign('HMAC', key, data);
		const hashArray = Array.from(new Uint8Array(signature));
		const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
		console.log('utf8:', this.decoder.decode(signature));
		return `${this.algorithm}=${hashHex}`;
	}

	async verify(expectedSignature: string, requestBody: string): Promise<boolean> {
		const actualSignature = await this.sign(requestBody);
		console.log(actualSignature);
		console.log(expectedSignature);
		return this.timingSafeEqual(expectedSignature, actualSignature);
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
