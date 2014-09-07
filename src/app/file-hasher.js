define(function (require) {
    var when = require('when'),
        fs = require('fs'),
        crypto = require('crypto');

    return Constructor;

    function Constructor() {
        var self = this;

        self.hash = hash;

        function hash(filePath) {
            var stream = fs.createReadStream(filePath);
            var hasher = crypto.createHash('md5');
            var deferred = when.defer();

            stream.on('data', function (data) {
                hasher.update(data, 'utf8')
            });

            stream.on('end', function () {
                var hash = hasher.digest('hex'); // 34f7a3113803f8ed3b8fd7ce5656ebec
                deferred.resolve({hash: hash, filePath: filePath});
            });

            return deferred.promise;

        }

    }
});