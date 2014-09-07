define(function (require) {
    var when = require('when'),
        walk = require('when-walk'),
        fs = require('fs'),
        util = require('util'),
        express = require('express'),
        bodyParser = require('body-parser'),
        path = require('path');

    return Server;

    function Server(debugLogger, sessionFactory, configFactory, quickDiffFactory, hashDiffFactory, fileUploadFactory) {

        var self = this;
        self.start = start;

        function start() {
            var app = express();
            app.use(bodyParser.json());
            app.post('/sessions/:sessionId', handleSessionRequest);
            app.post('/sessions/:sessionId/files/:file', handleUploadRequest);
            app.get('/sessions/:sessionId/files/:file/diffs/quick', handleQuickDiffRequest);
            app.get('/sessions/:sessionId/files/:file/diffs/hash', handleHashDiffRequest);
            app.post('/sessions/:sessionId/publish', handlePublishRequest);
            app.post('/upload/:file', handleUploadRequest);

            app.use(function (req, res, next) {
                // the status option, or res.statusCode = 404
                // are equivalent, however with the option we
                // get the "status" local available as well
                console.log('unknown request');
                res.write('404');
                res.end();
            });

            var server = app.listen(3000, function () {
                console.log('Listening on port %d', server.address().port);
            });

            function handleSessionRequest(request, response) {
                console.log('session id: ' + request.params.sessionId);
                var session = sessionFactory.create(request.params.sessionId);
                session.writeConfig(request.body)
                    .then(function (result) {
                        //                        console.log(util.inspect(result));
                        session.config = configFactory.create(request.body);
                        response.write(JSON.stringify(result));
                        response.end();
                    });
            }

            function handleQuickDiffRequest(request, response) {
                var session = sessionFactory.create(request.params.sessionId);
                //                debugLogger.log('quick diff');
                var filePath = path.join(session.config.destination.path, request.params.file);
                //                debugLogger.log(filePath);
                quickDiffFactory.create(filePath).diff({size: request.query.size})
                    .then(function (diffResult) {
                        response.write(JSON.stringify(diffResult));
                    })
                    .catch(function (err) {
                        response.write(JSON.stringify(err));
                    })
                    .done(function () {
                        response.end();
                    });
            }

            function handleHashDiffRequest(request, response) {
                var session = sessionFactory.create(request.params.sessionId);
                var filePath = path.join(session.config.destination.path, request.params.file);
                //var filePath = './sessions/' + request.params.sessionId + '/' + request.params.file;
                hashDiffFactory.create(filePath).diff({hash: request.query.hash})
                    .then(function (diffResult) {
                        response.write(JSON.stringify(diffResult));
                    })
                    .catch(function (err) {
                        response.write(JSON.stringify(err));
                    })
                    .done(function () {
                        response.end();
                    });
            }

            function handleUploadRequest(request, response) {
                var session = sessionFactory.create(request.params.sessionId);
                var filePath = path.join(session.uploadPath(), request.params.file);

                when(fileUploadFactory.create(filePath, request).process())
                    .done(function () {
                        response.end();
                    });
            }

            function handlePublishRequest(request, response) {
                var session = sessionFactory.create(request.params.sessionId);
                session.publish(request.body)
                    .then(function (result) {

                        response.write(JSON.stringify(result));
                        response.end();
                    });
            }

        }
    }
});