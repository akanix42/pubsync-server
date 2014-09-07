define(function (require) {
    var fs = require('fs'),
        when = require('when');
    return Constructor;

    function Constructor(debugLogger, filePath) {
        var self = this;

        self.diff = function diff(otherFile) {
            var deferred = when.defer();
            fs.stat(filePath, function (err, stats) {
//                debugLogger.log('stats');
                var diffResult = !!err || stats.size != parseInt(otherFile.size);
//                debugLogger.log(diffResult);
                deferred.resolve(diffResult);

            });
            return deferred.promise;
        };

    }
});