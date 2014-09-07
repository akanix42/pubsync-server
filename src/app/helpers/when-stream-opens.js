define(function(require){
    var when = require('when');

    return whenStreamOpens;


    function whenStreamOpens(stream) {
        var deferred = when.defer();
        stream.on('open', function () {
            deferred.resolve(stream);
        });
        return deferred.promise;

    }
});
