define(function (require) {
    var when = require('when'),
        makeDirectory = require('helpers/when-makeDirectory');

    return DirectoryUpload;

    function DirectoryUpload(directoryPath) {
        var self = this;

        self.process = function process() {
            return when(makeDirectory(directoryPath));
        };
    }
});


