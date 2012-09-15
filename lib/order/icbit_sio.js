/// ICBIT socket.io-based trader

// builtin
var sio = require('socket.io-client');

var Trader = function (options) {
	var self = this;
	self.sec_key = options.sec_key;
	self.api_key = options.api_key;
	self.host = options.host;
	self.wsURL = 'https://' + options.host + '/icbit?AuthKey=' + options.sec_key + '&UserId=' + options.api_key;
	self.connected = false;
	self.orders_list = [];

	// connect
	self.socket = sio.connect(self.wsURL, { secure: true });

	// set up messages handlers for connect/disconnect events
	self.socket.on('connect', function () {
		console.log("connected to ICBIT");
		self.connected = true;
	});

	self.socket.on('disconnect', function () {
		console.log("disconnected from ICBIT");
		self.connected = false;
	});

	self.socket.on('message', function (data) {
		switch (data.op) {
			case 'private':
				switch (data.private) {
					case 'ticker':
						//onTicker(data);
						break;
					case 'user_order':
						updateOrders(data, self);
						break;
					case 'user_balance':
						//if (null != data.user_balance) {
						//	setBalance(data.user_balance);
						//}
						break;
					case 'orderbook':
						//updateOrderBook(data.orderbook);
						break;
					case 'status':
						//updateStatus(data.status);
						break;
				}
		}
	});

	updateOrders = function (data, self) {
		if (!data.update) {
			// This is a list of all orders
			self.orders_list = [];
			self.orders_list = data.user_order;
		}
		else {
			// This is an update to the existing order, always 1 order for now
			var orderFound = false;

			var totalOrders = self.orders_list.length;

			for (var i = 0; i < totalOrders; i++) {
				if (self.orders_list[i].oid == data.user_order[0].oid) {
					// this order already exists in our list, update it
					self.orders_list[i] = data.user_order[0];
					orderFound = true;
					break;
				}
			}

			// Add it if it was not found
			if (!orderFound) {
				for (var i = 0; i < data.user_order.length; i++) {
					self.orders_list.push(data.user_order[i]);
				}
			}
		}
	}
};

/// callback(err, detail)
Trader.prototype.new_order = function (details, cb) {
	if (details.market_id != 0 && details.market_id != 1)
		return cb(new Error("Incorrect market id!"));

    var price = (details.price*1e8).toString();
    var size = (details.size).toString();

	var params = {
		op: "create_order",
		"order": {
			"market": details.market_id,
			"ticker": details.product_id,
			"buy": (details.side === 0) ? 1 : 0,
			"price": price,
			"qty": size
		}
	};

	this.socket.json.send(params);

	return cb(null);
};

/// cancel an orders
/// details { product_id, order_id }
/// callback(err, detail)
Trader.prototype.cancel_order = function(details, cb) {

	if (!this.connected)
		return cb(new Error("Not connected!"));

	if (details.market_id != 0 && details.market_id != 1)
		return cb(new Error("Incorrect market id!"));

	this.socket.json.send({ op: 'cancel_order', order: { oid: details.order_id, market: details.market_id} });

	return cb(null, details);
}

/// get list of open orders
/// callback(err, orders)
Trader.prototype.orders = function(cb) {
	var result = [];
	this.orders_list.forEach(function(order) {
		result.push({
			id: order.oid,
			side: (order.dir == 1) ? 0 : 1,
			size: order.qty,
			price: order.price/1e8,
			ticker: order.ticker,
			type: order.type,
			qty: order.qty,
			exec_qty: order.exec_qty,
			status: _convert_status(order.status),
			currency: order.currency,
			market: order.market
		});
	});

	return cb(null, result);
}

// Convert numerical status to string
_convert_status = function(type) {
	var r = '';
	switch (type) {
		case 0: r = 'New'; break;
		case 1: r = 'Partially Filled'; break;
		case 2: r = 'Filled'; break;
		case 3: r = 'Done for Today'; break;
		case 4: r = 'Canceled'; break;
		case 5: r = 'Rejected'; break;
	}
	return r;
}

// create a new socket.io trader for ICBIT
module.exports.create = function(options) {
    return new Trader(options);
};


