define(function (require) {
    var when = require('when'),
        makeDirectory = require('helpers/when-makeDirectory'),
        path = require('path'),
        fs = require('fs'),
        zlib = require('zlib'),
        util = require('util');

    return FileUpload;

    function FileUpload(filePath, request, debugLogger) {
        var self = this;

        self.process = function process() {
            var outputStream;

            return when(makeDirectory(path.dirname(filePath)))
                .then(createOutputStream)
                .then(function (stream) {
                    outputStream = stream;
                })
                .then(listenForData);

            function createOutputStream() {
                if (request.headers['content-encoding'] === 'gzip')
                    return createGunzipStream();
                else
                    return createFileStream();
            }

            function createFileStream() {
                var outputStream = fs.createWriteStream(filePath);
                return waitForStreamOpen(outputStream);
            }

            function listenForData() {
                var deferred = when.defer();
                request.on('data', function (data) {
                    outputStream.write(data);
                });
                request.on('end', function () {
                    outputStream.end();
                    deferred.resolve();
                });

                return deferred.promise;
            }

            function createGunzipStream() {
                var gunzip = zlib.createGunzip();
                var outputStream;
                gunzip.on('data', function (data) {
                    outputStream.write(data);
                });
                gunzip.on('end', function () {
                    outputStream.end();
                });
                return when(createFileStream()).then(function (stream) {
                    outputStream = stream;
                    return gunzip;
                });
            }

            function waitForStreamOpen(stream) {
                var deferred = when.defer();
                stream.on('open', function () {
                    deferred.resolve(stream);
                });
                return deferred.promise;

            }
        };
    }
});


