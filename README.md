# React Juno

#### A simple library for using Juno's auxiliary scripts in a React project. Its use may be slightly different from the original, but it is not at all difficult.
The functions that worked with callbacks in the original library now return the result.

How to use:

```javascript
import DirectCheckout from './directCheckout';

const checkout = new DirectCheckout("YOUR_PUBLIC_KEY", false); // true to production, false to sandbox

const cardData = {
  cardNumber: '0000000000000000',
  holderName: 'Nome do Titular do Cartão',
  securityCode: '000',
  expirationMonth: '12',
  expirationYear: '2045'
}

checkout.isValidCardNumber(cardData.cardNumber); // returns true or false
checkout.isValidSecurityCode(cardData.cardNumber, cardData.securityCode); // returns true or false
checkout.isValidExpireDate(cardData.expirationMonth, cardData.expirationYear); // returns true or false
checkout.isValidCardData(cardData); // returns true or false
checkout.getCardType(cardData.cardNumber); // returns the card flag
checkout.getCardHash(cardData); // returns the card hash
```
