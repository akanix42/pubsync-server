define(function (require) {
    var when = require('when'),
        mkdirp = require('mkdirp');

    return makeDirectory;

    function makeDirectory(directoryPath) {
        var deferred = when.defer();
        mkdirp(directoryPath, function () {
            deferred.resolve();
        });
        return deferred.promise;
    }
});