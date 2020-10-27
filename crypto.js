export default class Crypto {
	constructor() {
		this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		this.lookup = new Uint8Array(256);
		for(var i = 0; i < this.chars.length; i++) this.lookup[this.chars.charCodeAt(i)] = i;
	}

	async encrypt(pemPublicKey, stringData) {
		const publicKey = await this.importPublicKey(pemPublicKey);
		const encrypted = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP', hash: { name: 'SHA-256' } }, publicKey, this.stringToArrayBuffer(stringData));
		return this.encodeAb(encrypted);
	}

	async importPublicKey(pemPublicKey) {
		return await window.crypto.subtle.importKey('spki', this.pemToArrayBuffer(pemPublicKey), { name: 'RSA-OAEP', hash: { name: 'SHA-256' } }, false, ['encrypt']);
	}

	base64ToArrayBuffer(b64) {
		const byteString = window.atob(b64);
		const byteArray = new Uint8Array(byteString.length);
		for(var i = 0; i < byteString.length; i++) byteArray[i] = byteString.charCodeAt(i);
		return byteArray;
	}

	pemToArrayBuffer(pem) {
		return this.base64ToArrayBuffer(pem.replace('\n', '').replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', ''));
	}

	stringToArrayBuffer(str) {
		return new TextEncoder('utf-8').encode(str).buffer;
	}

	encodeAb(arrayBuffer) {
		var bytes = new Uint8Array(arrayBuffer), i, len = bytes.length, base64 = '';
		for(i = 0; i < len; i += 3) base64 += this.chars[ bytes[i] >> 2 ] + this.chars[ ((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4) ] + this.chars[ ((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6) ] + this.chars[ bytes[i + 2] & 63 ];
		if((len % 3) === 2) base64 = base64.substring(0, base64.length - 1) + '=';
		else if(len % 3 === 1) base64 = base64.substring(0, base64.length - 2) + '==';
		return base64;
	}
}