export default class Crypto {
	constructor() {
		this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		this.lookup = new Uint8Array(256);
		this.initB64();
	}

	async encrypt(pemPublicKey, stringData) {
		const publicKey = await this.importPublicKey(pemPublicKey);
		var data = this.stringToArrayBuffer(stringData);
		const encrypted = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP', hash: { name: 'SHA-256' } }, publicKey, data);
		return this.encodeAb(encrypted);
	}

	async importPublicKey(pemPublicKey) {
		return await window.crypto.subtle.importKey('spki', this.pemToArrayBuffer(pemPublicKey), { name: 'RSA-OAEP', hash: { name: 'SHA-256' } }, false, ['encrypt']);
	}

	initB64() {
		for (var i = 0; i < this.chars.length; i++) {
			this.lookup[this.chars.charCodeAt(i)] = i;
		}
	}

	removeLines(str) {
		return str.replace('\n', '');
	}

	base64ToArrayBuffer(b64) {
		var byteString = window.atob(b64);
		var byteArray = new Uint8Array(byteString.length);
		for (var i = 0; i < byteString.length; i++) {
			byteArray[i] = byteString.charCodeAt(i);
		}
		return byteArray;
	}

	pemToArrayBuffer(pem) {
		var b64Lines = this.removeLines(pem);
		var b64Prefix = b64Lines.replace('-----BEGIN PUBLIC KEY-----', '');
		var b64Final = b64Prefix.replace('-----END PUBLIC KEY-----', '');
		return this.base64ToArrayBuffer(b64Final);
	}

	stringToArrayBuffer(str) {
		var encoder = new TextEncoder('utf-8');
		var byteArray = encoder.encode(str);
		return byteArray.buffer;
	}

	encodeAb(arrayBuffer) {
		var bytes = new Uint8Array(arrayBuffer),
			i, len = bytes.length,
			base64 = '';
		for (i = 0; i < len; i += 3) {
			base64 += this.chars[bytes[i] >> 2];
			base64 += this.chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
			base64 += this.chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
			base64 += this.chars[bytes[i + 2] & 63];
		}
		if ((len % 3) === 2) {
			base64 = base64.substring(0, base64.length - 1) + '=';
		} else if (len % 3 === 1) {
			base64 = base64.substring(0, base64.length - 2) + '==';
		}
		return base64;
	}
}