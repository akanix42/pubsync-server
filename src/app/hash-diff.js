define(function (require) {
    var when = require('when'),
        util = require('util');
    return HashDiff;

    function HashDiff(filePath, debugLogger, fileHasher) {
        var self = this;

        self.diff = function diff(otherFile) {
            var deferred = when.defer();
            fileHasher.hash(filePath)
                .then(function (file) {
                    deferred.resolve(otherFile.hash !== file.hash);
                });

            return deferred.promise;
        };
    }
});


