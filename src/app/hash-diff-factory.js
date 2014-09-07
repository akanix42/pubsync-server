define(function (require) {
var fs = require('fs'),
    when = require('when'),
    HashDiff = require('hash-diff');
    return Constructor;

    function Constructor(debugLogger, fileHasher) {
        var self = this;

        self.create = function create(filePath){
            return new HashDiff(filePath, debugLogger, fileHasher);
        };

    }
});