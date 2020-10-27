import Crypto from './crypto';
import Card from './card';
export default class DirectCheckout {
	constructor(publicToken, prod = true) {
		this._version = '0.0.2';
		this._url = 'https://' + (prod ? 'www' : 'sandbox') + '.boletobancario.com/boletofacil/integration/api/';
		this._publicKey = null;
		this._countAwaitingPublicKey = 0;
		this._publicToken = publicToken;
		this._crypto = new Crypto();
		this._card = new Card();
		this._loadPublicKey();
	}

	getCardType(cardNumber) {
		return (this.isValidCardNumber(cardNumber)) ? this._card.getType(cardNumber).name : false;
	}

	isValidCardNumber(cardNumber) {
		return this._card.validateNumber(cardNumber);
	}

	isValidSecurityCode(cardNumber, securityCode) {
		return this._card.validateCvc(cardNumber, securityCode);
	}

	isValidExpireDate(expirationMonth, expirationYear) {
		return this._card.validateExpireDate(expirationMonth, expirationYear);
	}

	isValidCardData(cardData) {
		if(!this._publicKey) {
			console.error('Invalid public key');
			return false;
		}
		if(!cardData) {
			console.error('Invalid card data');
			return false;
		}
		if(!cardData.holderName || cardData.holderName == '') {
			console.error('Invalid holder name');
			return false;
		}
		if(!this.isValidCardNumber(cardData.cardNumber)) {
			console.error('Invalid card number');
			return false;
		}
		if(!this.isValidSecurityCode(cardData.cardNumber, cardData.securityCode)) {
			console.error('Invalid security code');
			return false;
		}
		if(!this.isValidExpireDate(cardData.expirationMonth, cardData.expirationYear)) {
			console.error('Invalid expire date');
			return false;
		}
		return true;
	}

	async getCardHash(cardData) {
		if(this._checkPublicKey() && this.isValidCardData(cardData)) {
			return await this._internalGetCardHash(cardData);
		}
	}

	async _internalGetCardHash(cardData) {
		const url = this._url + 'get-credit-card-hash.json';
		const encoded = await this._crypto.encrypt(this._publicKey, JSON.stringify(cardData));
		var params = 'publicToken=' + this._publicToken;
		params += '&encryptedData=' + window.encodeURIComponent(encoded);
		var res = await this._ajax('POST', url, params);
		res = JSON.parse(res);
		if(res.success) {
			return res.data;
		} else {
			throw Error(res.errorMessage);
		}
	}

	async _loadPublicKey() {
		var url = this._url + 'get-public-encryption-key.json';
		var params = 'publicToken=' + this._publicToken + '&version=' + this._version;
		var res = await this._ajax('POST', url, params);
		res = JSON.parse(res);
		if(res.success) {
			this._publicKey = res.data;
		} else {
			throw Error(res.errorMessage);
		}
	}

	_checkPublicKey() {
		if(!this._publicKey && this._countAwaitingPublicKey < 100) {
			setTimeout(function () {
				this._countAwaitingPublicKey++;
				this._checkPublicKey();
			}.bind(this), 100);
		} else {
			return true;
		}
	}

	async _ajax(type, url, params) {
		return new Promise(function (resolve, reject) {
			var req = new XMLHttpRequest();
			req.open(type, url);
			req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			req.onload = function () {
				if (req.status == 200) {
					resolve(req.response);
				} else {
					reject(Error(req.statusText));
				}
			};
			req.onerror = function () {
				reject(Error("Network Error"));
			};
			req.send(params);
		});
	}
}