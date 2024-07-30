export const sha256 = async (body: string): Promise<Uint8Array> => {
	const enc = new TextEncoder(); // UTF-8 encoder
	const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(body));
	return new Uint8Array(hashBuffer);
};

// New function to convert string to raw bytes
function stringToUint8Array(str: string): Uint8Array {
	return new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
}

export const hmacSha256 = async (data: Uint8Array, secret: string): Promise<Uint8Array> => {
	const key = await crypto.subtle.importKey(
		'raw',
		stringToUint8Array(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, data);
	return new Uint8Array(signature);
};

export const hex = (buffer: Uint8Array): string => {
	return Array.from(buffer)
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
};

export const generateSecret = (bytes: number): string => {
	return hex(crypto.getRandomValues(new Uint8Array(bytes)));
};
