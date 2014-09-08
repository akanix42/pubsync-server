define(function (require) {
    var DirectoryUpload = require('directory-upload');
    return DirectoryUploadFactory;

    function DirectoryUploadFactory() {
        var self = this;

        self.create = function create(DirectoryPath) {
            return new DirectoryUpload(DirectoryPath);
        };

    }
});