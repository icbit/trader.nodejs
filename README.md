node.js trading library for ICBIT and MtGox

The library is written using a typical node.js event/callback approach. See below for quick usage and the 'examples' directory for more detailed examples. All of the APIs described below are a work in progress and being actively developed. Suggestions are welcome.

##Install##

    npm install git://github.com/icbit/trader.nodejs.git

##Market Data##

To receive market data all you have to do is use the book builder to create a book for the exchange you want. Level updates will emit events.

```javascript
var book_builder = require('btctrader').books;

// we can ask the book builder to create a book of any supported type
// as long as the returned book object emits the right events it will work
var icbit_book = book_builder.build({
    // common options
    exchange: 'icbit', // icbit or mtgox
    protocol: 'rest', // 'rest' for mtgox and 'sio' for ICBIT
    depth: 'L1', // only L1 is supported for now

    // exchange specific
    host: 'api.icbit.se',
    product: 1,
});

// errors will be emitted to the typical error event
icbit_book.on('error', function(err) {
});

// the L1 book emits a 'changed' event when there is an update
book.on('changed', function(details) {
    details.side; // 0 for BID, 1 for ASK
    details.size; // amount
    details.price; // price
});
```

##Order Entry##

Setup to enter orders is very similar to the book builder. You initialize a trader for the given exchange. Below is an example for a basic REST based trader.

```javascript

var trader_builder = require('btctrader').traders;

var trader = trader_builder.build({
    exchange: 'icbit',

    // exchange specific
    protocol: 'sio',
    host: 'api.icbit.se',
    sec_key: ..., // your ICBIT sec key
    api_key: ..., // your ICBIT api key
});

// send a new order to the exchange
var details = {
    side: 0, // 0 for buy, 1 for sell
    size: 0.0, // amount
    price: 0.0, // price
    product_id: 1, // exchange specific product id
}

trader.new_order(details, function(response) {
});

// cancel an order
var details = {
    order_id: '', // exchange specified order id
    product_id: 1, // exchange specific product id
}

trader.cancel_order = function(details, response) {
});

```
