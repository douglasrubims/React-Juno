export default class Card {
	constructor() {
		var self = this;
		this.mask = {
			DEFAULT_CC: '0000  0000  0000  0000',
			DEFAULT_CVC: '000',
		};
		this.type = {
			VISA: {
				name: 'visa',
				detector: /^4/,
				cardLength: 16,
				cvcLength: 3,
				maskCC: self.mask.DEFAULT_CC,
				maskCVC: self.mask.DEFAULT_CVC,
				order: 99
			},
			MASTERCARD: {
				name: 'mastercard',
				detector: /^(5[1-5]|2(2(2[1-9]|[3-9])|[3-6]|7([0-1]|20)))/,
				cardLength: 16,
				cvcLength: 3,
				maskCC: self.mask.DEFAULT_CC,
				maskCVC: self.mask.DEFAULT_CVC,
				order: 99
			},
			AMEX: {
				name: 'amex',
				detector: /^3[47]/,
				cardLength: 15,
				cvcLength: 4,
				maskCC: '0000  000000  00000',
				maskCVC: '0000',
				order: 99
			},
			DISCOVER: {
				name: 'discover',
				detector: /^6(?:011\d{12}|5\d{14}|4[4-9]\d{13}|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d{2}|9(?:[01]\d|2[0-5]))\d{10})/,
				cardLength: 16,
				cvcLength: 3,
				maskCC: self.mask.DEFAULT_CC,
				maskCVC: self.mask.DEFAULT_CVC,
				order: 2
			},
			HIPERCARD: {
				name: 'hipercard',
				detector: /^606282|384100|384140|384160/,
				cardLength: 16,
				cvcLength: 3,
				maskCC: self.mask.DEFAULT_CC,
				maskCVC: self.mask.DEFAULT_CVC,
				order: 4
			},
			DINERS: {
				name: 'diners',
				detector: /^(300|301|302|303|304|305|36|38)/,
				cardLength: 14,
				cvcLength: 3,
				maskCC: '0000  000000  0000',
				maskCVC: self.mask.DEFAULT_CVC,
				order: 5
			},
			JCB_15: {
				name: 'jcb_15',
				detector: /^2131|1800/,
				cardLength: 15,
				cvcLength: 3,
				maskCC: self.mask.DEFAULT_CC,
				maskCVC: self.mask.DEFAULT_CVC,
				order: 6
			},
			JCB_16: {
				name: 'jcb_16',
				detector: /^35(?:2[89]|[3-8]\d)/,
				cardLength: 16,
				cvcLength: 3,
				maskCC: self.mask.DEFAULT_CC,
				maskCVC: self.mask.DEFAULT_CVC,
				order: 7
			},
			ELO: {
				name: 'elo',
				detector: /^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67([0-6][0-9]|7[0-8])|9\d{3})|627780|63(6297|6368)|650(03([^4])|04([0-9])|05(0|1)|4(0[5-9]|(1|2|3)[0-9]|8[5-9]|9[0-9])|5((3|9)[0-8]|4[1-9]|([0-2]|[5-8])\d)|7(0\d|1[0-8]|2[0-7])|9(0[1-9]|[1-6][0-9]|7[0-8]))|6516(5[2-9]|[6-7]\d)|6550(2[1-9]|5[0-8]|(0|1|3|4)\d))\d*/,
				cardLength: 16,
				cvcLength: 3,
				maskCC: self.mask.DEFAULT_CC,
				maskCVC: self.mask.DEFAULT_CVC,
				order: 1
			},
			AURA: {
				name: 'aura',
				detector: /^((?!5066|5067|50900|504175|506699)50)/,
				cardLength: 19,
				cvcLength: 3,
				maskCC: '0000000000000000000',
				maskCVC: self.mask.DEFAULT_CVC,
				order: 3
			}
		};
	}

	getType(cardNumber) {
		cardNumber = cardNumber.replace(/ /g, '');
		for(const key in this.getOrderedTypes()) if(this.validatorNumber(cardNumber, this.type[ key ])) return this.type[ key ];
		return false;
	}

	getOrderedTypes() {
		const types = {};
		var order = 1;
		while(order < 100) {
			for(const key in this.type) if(this.type[ key ].order == order) types[ key ] = this.type[ key ];
			order++;
		}
		return types;
	}

	validateNumber(cardNumber) {
		cardNumber = cardNumber.replace(/ /g, '');
		const type = this.getType(cardNumber);
		return type && type.cardLength == cardNumber.length && this.validatorLuhn(cardNumber);
	}

	validateCvc(cardNumber, cvcNumber) {
		const type = this.getType(cardNumber.replace(/ /g, ''));
		return type && this.validatorCvc(cvcNumber, type);
	}

	validateExpireDate(expirationMonth, expirationYear) {
		const today = new Date();
		const month = today.getMonth() + 1;
		const year = today.getFullYear();
		expirationMonth = parseInt(expirationMonth);
		expirationYear = parseInt(expirationYear);
		if(expirationMonth > 0 && expirationYear > 0 && expirationYear >= year) {
			if(expirationYear == year) {
				return (expirationMonth > month);
			}
			return true;
		}
		return false;
	}

	validatorNumber(cardNumber, type) {
		return type.detector.test(cardNumber);
	}

	validatorLuhn(cardNumber) {
		var numberProduct, checkSumTotal = 0;
		for(var digitCounter = cardNumber.length - 1; digitCounter >= 0; digitCounter = digitCounter - 2) {
			checkSumTotal += parseInt(cardNumber.charAt(digitCounter), 10);
			numberProduct = String((cardNumber.charAt(digitCounter - 1) * 2));
			for(var productDigitCounter = 0; productDigitCounter < numberProduct.length; productDigitCounter++) {
				checkSumTotal += parseInt(numberProduct.charAt(productDigitCounter), 10);
			}
		}
		return (checkSumTotal % 10 == 0);
	}

	validatorCvc(cvcNumber, type) {
		return type.cvcLength == ('' + cvcNumber).length;
	}
};