define(function (require) {
    var Injector = require('injector'),
        Server = require('server'),
        Publisher = require('publisher'),
        FileHasher = require('file-hasher'),
        SessionFactory = require('session-factory'),
        QuickDiffFactory = require('quick-diff-factory'),
        HashDiffFactory = require('hash-diff-factory'),
        FileUploadFactory = require('file-upload-factory'),
        ConfigFactory = require('config-factory'),
        DebugLogger = require('debug-logger');

    return CompositionRoot;

    function CompositionRoot() {
        var self = this;
        var injector = self.injector = new Injector();

        injector.register('Server', Server);
        injector.register('Publisher', Publisher);
        injector.register('SessionFactory', SessionFactory, true);
        injector.register('QuickDiffFactory', QuickDiffFactory, true);
        injector.register('HashDiffFactory', HashDiffFactory, true);
        injector.register('FileUploadFactory', FileUploadFactory, true);
        injector.register('ConfigFactory', ConfigFactory, true);
        injector.register('FileHasher', FileHasher, true);
        injector.register('Debug', DebugLogger);
        injector.register('DebugLogger', DebugLogger);
    }
});