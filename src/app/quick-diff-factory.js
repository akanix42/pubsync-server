define(function (require) {
var fs = require('fs'),
    when = require('when'),
    QuickDiff = require('quick-diff');
    return Constructor;

    function Constructor(debugLogger) {
        var self = this;

        self.create = function create(filePath){
            return new QuickDiff(debugLogger, filePath);
        };

    }
});