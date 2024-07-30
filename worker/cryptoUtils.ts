export const sha256 = async (body: string): Promise<Uint8Array> => {
	const enc = new TextEncoder(); // UTF-8 encoder
	const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(body));
	return new Uint8Array(hashBuffer);
};

export const escapeUnicode = (str: string): string => {
	return str.replace(/[\u007F-\uFFFF]/g, chr => {
		return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
	});
};

export const hmacSha256 = async (body: string, secret: string): Promise<Uint8Array> => {
	const escapedBody = escapeUnicode(body);
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		enc.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, enc.encode(escapedBody));
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
