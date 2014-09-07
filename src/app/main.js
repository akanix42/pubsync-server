var util = require('util');

var requirejs;
if (requirejs === undefined)
    requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require,
    baseUrl: 'app',
    paths: {
        'injector': '../lib/injector/injector',
        'extend': '../lib/extend/extend',
        'when-walk': '../lib/when-walk/when-walk-ex',
        'truthy': '../lib/truthy-falsy/truthy',
    }
});
process.on('uncaughtException', function(err) {
    console.error(util.inspect(err));
});
requirejs(['composition-root'], function(CompositionRoot) {
    var compositionRoot = new CompositionRoot();
    var server = compositionRoot.injector.resolve('Server');
    server.start();
});
