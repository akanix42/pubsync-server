define(function (require) {
var fs = require('fs'),
    when = require('when'),
    FileUpload = require('file-upload');
    return FileUploadFactory;

    function FileUploadFactory(debugLogger) {
        var self = this;

        self.create = function create(filePath, request){
            return new FileUpload(filePath, request, debugLogger);
        };

    }
});