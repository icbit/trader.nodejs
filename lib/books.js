//var icbit = require('./books/icbit_sio.js');
var mtgox = require('./books/mtgox_rest.js');

module.exports.build = function(spec) {
    if (spec.depth !== 'L1') {
        throw new Error('only L1 supported');
    }

    switch (spec.exchange) {
    //case 'icbit':
    //    return icbit.l1_book(spec);
    case 'mtgox':
        return mtgox.l1_book(spec);
    default:
        throw new Error('unsupported exchange: ' + spec.exchange);
    }
};

