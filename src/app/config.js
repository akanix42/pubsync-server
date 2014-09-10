define(function (require) {
    var Filter = require('filter'),
        Uuid = require('uuid-lib'),
        extend = require('extend'),
        path = require('path'),
        isObject = require('helpers/is-object'),
        AsyncConstructor = require('helpers/async-constructor'),
        inherit = require('helpers/inherit'),
        fs = require('fs');

    return Constructor;

    function Constructor(config, debugLogger) {
        var self = this;

        inherit(AsyncConstructor, self);

        config.debugLogger = debugLogger;
        parseFilters(config.filters);

        extend(self, config);

        function parseFilters() {
            if (!('filters' in config) || !isObject(config.filters))
                return;
            var filters = config.filters;

            for (var filterIndex = 0; filterIndex < filters.length; filterIndex++)
                filters[filterIndex] = new Filter(filters[filterIndex]);
        }
    }
});