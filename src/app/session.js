define(function (require) {
    var makeDirectory = require('helpers/when-makeDirectory'),
        when = require('when'),
        fs = require('fs-extra'),
        path = require('path');

    return Constructor;

    function Constructor(sessionId) {
        var self = this;
        var dirPath = ('./sessions/' + sessionId).replace(/\\/, '/');
        var filesToNotDelete;
        var filesToDelete = [];
        var publishResults = [];
        self.writeConfig = writeConfig;

        self.tempPath = function () {
            return dirPath;
        };

        self.publish = publish;
        self.restore = restore;

        self.uploadPath = function () {
            return path.join(dirPath, 'uploaded');
        };
        self.backupPath = function () {
            return path.join(dirPath, 'backup');
        };

        function writeConfig(config) {
            return makeDirectory(dirPath)
                .then(function () {
                    var deferred = when.defer();
                    fs.writeFile(dirPath + "/.config", JSON.stringify(config), function (err) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({wasSuccessful: false, err: err});
                        } else {
                            deferred.resolve({wasSuccessful: true});
                        }
                    });
                    return deferred.promise;
                });
        }

        function publish(files) {
            filesToNotDelete = {};
            for (var i = 0; i < files.length; i++)
                filesToNotDelete[files[i].replace(/\\/, '/')] = '';
            return backupFilesThatWillBeOverwrittenOrDeleted()
                .then(deleteMissingFiles)
                .then(publishFiles)
                .catch(function (err) {
                    return when(restore());
                })
                .then(function () {
                    return publishResults;
                });
        }

        function backupFilesThatWillBeOverwrittenOrDeleted() {
            var result = {step: 'backup', wasSuccessful: false};
            publishResults.push(result);
            var deferred = when.defer();
            console.log('backing up files that will be overwritten');

            fs.copy(self.config.destination.path, self.backupPath(), needsBackedUp, function (err) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                console.log('backup complete');
                result.wasSuccessful = true;
                deferred.resolve(true);
            });
            return deferred.promise;
        }

        function needsBackedUp(filename) {
            var relativePath = path.relative(self.config.destination.path, filename).replace(/\\/, '/');
            if (relativePath === '')
                return true;
            var stat = fs.statSync(filename);
            if (stat.isDirectory())
                relativePath += '/';
            //            console.log('nbu: ' + relativePath);
            if (stat.isFile() && willBeOverwritten(relativePath))
                return true;
            if (willBeDeleted(relativePath)) {
                if (stat.isFile())
                    filesToDelete.push(filename);
                return true;
            }
            return false;
        }

        function willBeOverwritten(relativePath) {
            var uploadPath = path.join(self.uploadPath(), relativePath);
            return fs.existsSync(uploadPath);
        }

        function willBeDeleted(relativePath) {
            if (relativePath in filesToNotDelete)
                return false;

            return !excludesFile(relativePath);
        }

        function excludesFile(file) {
            for (var i = 0; i < self.config.filters.length; i++) {
                var filter = self.config.filters[i];
                if (filter.excludesFile(file))
                    return true;
            }
            return false;
        }

        function deleteMissingFiles() {
            var result = {step: 'delete', wasSuccessful: false};
            publishResults.push(result);

            var deferreds = [];
            for (var i = 0; i < filesToDelete.length; i++) {
                deferreds.push(deleteMissingFile(filesToDelete[i]));
            }
            return when.all(deferreds)
                .then(function () {
                    result.wasSuccessful = true;
                });

        }

        function deleteMissingFile(file) {
            var deferred = when.defer();
            fs.unlink(file, function (err) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                deferred.resolve();
            });
            return deferred.promise;
        }

        function publishFiles() {
            var result = {step: 'publish', wasSuccessful: false};
            publishResults.push(result);

            var deferred = when.defer();
            console.log('publishing');
            if (!fs.existsSync(self.uploadPath())) {
                console.log('published');
                deferred.resolve(true);
            } else
                fs.copy(self.uploadPath(), self.config.destination.path, function (err) {
                    if (err) {
                        deferred.resolve(false);
                    }
                    console.log('published');
                    result.wasSuccessful = true;
                    deferred.resolve(true);
                });

            return deferred.promise;
        }

        function restore() {
            return when(restoreFiles());
        }

        function restoreFiles() {
            var result = {step: 'restore', wasSuccessful: false};
            publishResults.push(result);

            console.log('restore');
            var deferred = when.defer();
            fs.copy(self.backupPath(), self.config.destination.path, function (err) {
                if (err) {
                    deferred.resolve(false);
                    return;
                }
                console.log('restored!');
                result.wasSuccessful = true;
                deferred.resolve(true);
            });

            return deferred.promise;
        }
    }
})
;