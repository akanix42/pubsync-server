define(function (require) {
    var fs = require('fs'),
        when = require('when'),
        Config = require('config');
    return ConfigFactory;

    function ConfigFactory(debugLogger) {
        var self = this;

        self.create = function create(config) {
            return new Config(config, debugLogger);
        };

    }
});