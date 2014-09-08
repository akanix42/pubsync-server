(function() {
var requirejs = require('requirejs');
var define = requirejs.define;

define('extend',['require'],function(require){
    return extend;

    function extend() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false,
            toString = Object.prototype.toString,
            hasOwn = Object.prototype.hasOwnProperty,
            push = Array.prototype.push,
            slice = Array.prototype.slice,
            trim = String.prototype.trim,
            indexOf = Array.prototype.indexOf,
            class2type = {
                "[object Boolean]": "boolean",
                "[object Number]": "number",
                "[object String]": "string",
                "[object Function]": "function",
                "[object Array]": "array",
                "[object Date]": "date",
                "[object RegExp]": "regexp",
                "[object Object]": "object"
            },
            jQuery = {
                isFunction: function (obj) {
                    return jQuery.type(obj) === "function"
                },
                isArray: Array.isArray ||
                    function (obj) {
                        return jQuery.type(obj) === "array"
                    },
                isWindow: function (obj) {
                    return obj != null && obj == obj.window
                },
                isNumeric: function (obj) {
                    return !isNaN(parseFloat(obj)) && isFinite(obj)
                },
                type: function (obj) {
                    return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
                },
                isPlainObject: function (obj) {
                    if (!obj || jQuery.type(obj) !== "object" || obj.nodeType) {
                        return false
                    }
                    try {
                        if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                            return false
                        }
                    } catch (e) {
                        return false
                    }
                    var key;
                    for (key in obj) {}
                    return key === undefined || hasOwn.call(obj, key)
                }
            };
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {}
        }
        if (length === i) {
            target = this;
            --i;
        }
        for (i; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue
                    }
                    if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : []
                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }
                        // WARNING: RECURSION
                        target[name] = extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    }
});
define('truthy',[],function () {
    return truthy;

    function truthy(value) {
        return typeof value !== 'undefined' && value;
    }
})
;
define('injector',['require','extend','truthy'],function (require) {
    var extend = require('extend'),
        truthy = require('truthy');
    return Injector;

    function Injector() {
        var self = this;
        this.fixDependencyCasing = firstLetterUpperCase;

        function resolve(name, dependencyAbove, dependencyTree) {
            name = self.fixDependencyCasing(name);
            if (!(name in self.dependencies)) {
                debugger;
                throw name + ' not registered';
            }
            if (truthy(dependencyAbove) && name in dependencyTree)
                throw dependencyAbove + ' has a circular dependency on ' + name;
            dependencyTree = extend({}, dependencyTree);
            dependencyTree[name] = '';

            return self.dependencies[name].initializer.initialize(dependencyTree);
        }

        var injector = {

            dependencies: {},

            getDependencies: function (name, dependencies, dependencyTree) {
                return dependencies.length === 1 && dependencies[0] === '' ? []
                    : dependencies.map(function (value) {
                        return resolve(value, name, dependencyTree);
                    }
                );
            },

            register: function (name, item, isSingleton) {
                self.dependencies[name] = {item: item, initializer: new Initializer(self, name, item, isSingleton)};
            },

            resolve: function (name) {
                return resolve(name, undefined, {});
            }

        };
        extend(self, injector);

        function allUpperCase(name) {
            return name.toUpperCase();
        }

        function firstLetterUpperCase(value) {
            return value[0].toUpperCase() + value.substring(1);
        }
    }

    function Initializer(injector, name, item, isSingleton) {
        var self = this;
        createInitializationSteps();

        function createInitializationSteps() {
            if (isFunction(item))
                createFunctionInitializationSteps();
            else
                createObjectInitializationSteps();
        }

        function isFunction(functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
        }

        function createFunctionInitializationSteps() {
            var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
            var text = item.toString();
            var dependencies = text.match(FN_ARGS)[1].split(',');
            dependencies = dependencies.map(function (dependency) {
                return dependency.replace(/\s+/g, '');
            });

            self.initialize = function (dependencyTree) {
                var initializedItem = construct(item, injector.getDependencies(name, dependencies, dependencyTree));
                if (isSingleton) {
                    item = initializedItem;
                    createObjectInitializationSteps();
                }

                return initializedItem;
            };
        }

        function construct(constructor, args) {
            function F() {
                return constructor.apply(this, args);
            }

            F.prototype = constructor.prototype;
            return new F();
        }

        function createObjectInitializationSteps() {
            self.initialize = function () {
                return item;
            };
        }
    }

});
// Original source from http://stackoverflow.com/a/18926200/1090626.
// Thanks, Trevor!
define('when-walk',['require','fs','path','when','when/node/function'],function (require) {
    var fs = require('fs')
        , path = require('path')
        , when = require('when')
        , nodefn = require('when/node/function');

    return walk;
    
    function walk(options) {
        var directory = options.directory, includeDir = options.includeDirectories, filterCallback = options.filterCallback;
        var results = [];
        return when.map(nodefn.call(fs.readdir, directory), function (file) {
            file = path.join(directory, file);
            return nodefn.call(fs.stat, file).then(function (stat) {
                var name = stat.isFile() ? file : file + '/';
                if (options.filterCallback && !options.filterCallback(name, stat))
                    return;
                if (stat.isFile())
                    return results.push(name);
                if (includeDir) results.push(file);

                return walk({directory: file, includeDirectories: includeDir, filterCallback: filterCallback}).then(function (filesInDir) {
                    results = results.concat(filesInDir);
                });
            });
        }).then(function () {
            return results;
        });
    }
});
define('server',['require','when','when-walk','fs','util','express','body-parser','path'],function (require) {
    var when = require('when'),
        walk = require('when-walk'),
        fs = require('fs'),
        util = require('util'),
        express = require('express'),
        bodyParser = require('body-parser'),
        path = require('path');

    return Server;

    function Server(debugLogger, sessionFactory, configFactory, quickDiffFactory, hashDiffFactory, fileUploadFactory, directoryUploadFactory) {

        var self = this;
        self.start = start;

        function start() {
            var app = express();
            app.use(bodyParser.json());
            app.post('/sessions/:sessionId', handleSessionRequest);
            app.post('/sessions/:sessionId/files/:file', handleUploadRequest);
            app.post('/sessions/:sessionId/directories', handleDirectoryUploadRequest);
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

            function handleDirectoryUploadRequest(request, response) {
                var session = sessionFactory.create(request.params.sessionId);
                var directory = path.join(session.uploadPath(), request.body.path);

                when(directoryUploadFactory.create(directory).process())
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
define('file-hasher',['require','when','fs','crypto'],function (require) {
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
define('helpers/when-makeDirectory',['require','when','mkdirp'],function (require) {
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
define('session',['require','helpers/when-makeDirectory','when','fs-extra','path'],function (require) {
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
                filesToNotDelete[files[i].replace(/\\/g, '/')] = '';
            return backupFilesThatWillBeOverwrittenOrDeleted()
                .then(deleteMissingFiles)
                .then(publishFiles)
                .catch(function (err) {
                    publishResults[publishResults.length - 1].error = err;
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
                //                if (stat.isFile())
                filesToDelete.push(filename.replace(/\/$/,''));
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

            fs.remove(file, function (err) {
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
                result.wasSuccessful = true;
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
define('session-factory',['require','session'],function (require) {
    var Session = require('session');
    return Constructor;

    function Constructor() {
        var self = this;
        var sessions = {};

        self.create = create;

        function create(sessionId) {
            return getSession(sessionId) || (sessions[sessionId] = new Session(sessionId));
        }

        function getSession(sessionId) {
            if (sessionId in sessions)
                return sessions[sessionId];
            return null;
        }
    }
});
define('quick-diff',['require','fs','when'],function (require) {
    var fs = require('fs'),
        when = require('when');
    return Constructor;

    function Constructor(debugLogger, filePath) {
        var self = this;

        self.diff = function diff(otherFile) {
            var deferred = when.defer();
            fs.stat(filePath, function (err, stats) {
//                debugLogger.log('stats');
                var diffResult = !!err || stats.size != parseInt(otherFile.size);
//                debugLogger.log(diffResult);
                deferred.resolve(diffResult);

            });
            return deferred.promise;
        };

    }
});
define('quick-diff-factory',['require','fs','when','quick-diff'],function (require) {
var fs = require('fs'),
    when = require('when'),
    QuickDiff = require('quick-diff');
    return Constructor;

    function Constructor(debugLogger) {
        var self = this;

        self.create = function create(filePath){
            return new QuickDiff(debugLogger, filePath);
        };

    }
});
define('hash-diff',['require','when','util'],function (require) {
    var when = require('when'),
        util = require('util');
    return HashDiff;

    function HashDiff(filePath, debugLogger, fileHasher) {
        var self = this;

        self.diff = function diff(otherFile) {
            var deferred = when.defer();
            fileHasher.hash(filePath)
                .then(function (file) {
                    deferred.resolve(otherFile.hash !== file.hash);
                });

            return deferred.promise;
        };
    }
});



define('hash-diff-factory',['require','fs','when','hash-diff'],function (require) {
var fs = require('fs'),
    when = require('when'),
    HashDiff = require('hash-diff');
    return Constructor;

    function Constructor(debugLogger, fileHasher) {
        var self = this;

        self.create = function create(filePath){
            return new HashDiff(filePath, debugLogger, fileHasher);
        };

    }
});
define('file-upload',['require','when','helpers/when-makeDirectory','path','fs','zlib','util'],function (require) {
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



define('file-upload-factory',['require','fs','when','file-upload'],function (require) {
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
define('directory-upload',['require','when','helpers/when-makeDirectory'],function (require) {
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



define('directory-upload-factory',['require','directory-upload'],function (require) {
    var DirectoryUpload = require('directory-upload');
    return DirectoryUploadFactory;

    function DirectoryUploadFactory() {
        var self = this;

        self.create = function create(DirectoryPath) {
            return new DirectoryUpload(DirectoryPath);
        };

    }
});
define('filter',['require','path'],function (require) {
    var path = require('path');

    return Filter;


    function Filter(options) {
        var self = this;
        var regex = new RegExp(options.expression.replace(/\\\\/g, '/'));

        self.allowsFile = allowsFile;
        self.excludesFile = excludesFile;

        function allowsFile(file, stat) {
            var fileMatches = file.match(regex);
            return options.type === 'include'
                ? fileMatches : !fileMatches;
        }


        function excludesFile(file, stat) {
            var fileMatches = file.match(regex);
            return options.type === 'exclude' && fileMatches;
        }
    }
});
define('helpers/is-object',['require'],function(require){
    return isObject;


    function isObject(val) {
        if (val === null) { return false;}
        return ( (typeof val === 'function') || (typeof val === 'object') );
    }
});

define('helpers/async-constructor',['require','extend','when'],function (require) {
    var extend = require('extend'),
        when = require('when');
    return Constructor;

    function Constructor() {
        var self = this;

        self.constructorPromise = when.defer();
    }
});
define('helpers/inherit',['require','extend'],function (require) {
    var extend = require('extend');
    return inherit;

    function inherit(base, self) {
        var args = Array.prototype.slice.call(arguments, 2);
        base.apply(self, args);

        self.base = extend({base: self.base}, self);
    }
});
define('config',['require','filter','uuid-lib','extend','path','helpers/is-object','helpers/async-constructor','helpers/inherit','fs'],function (require) {
    var Filter = require('filter'),
        Uuid = require('uuid-lib'),
        extend = require('extend'),
        path = require('path'),
        isObject = require('helpers/is-object'),
        AsyncConstructor = require('helpers/async-constructor'),
        inherit = require('helpers/inherit'),
        fs = require('fs');

    return Constructor;

    function Constructor(config, debugLogger) {
        var self = this;

        inherit(AsyncConstructor, self);

        config.debugLogger = debugLogger;
//        config.sessionId = Uuid.raw();
//        debugLogger.log(config);

        config.sourcePath = path.resolve(config.sourcePath);
        fs.exists(config.sourcePath, function (exists) {
            if (!exists)
                debugLogger.log('The source path must exist!');
            self.constructorPromise.resolve();
        });
        parseFilters(config.filters);

        extend(self, config);

        function parseFilters() {
            if (!('filters' in config) || !isObject(config.filters))
                return;
            var filters = config.filters;

            for (var filterIndex = 0; filterIndex < filters.length; filterIndex++)
                filters[filterIndex] = new Filter(filters[filterIndex]);
        }
    }
});
define('config-factory',['require','fs','when','config'],function (require) {
    var fs = require('fs'),
        when = require('when'),
        Config = require('config');
    return ConfigFactory;

    function ConfigFactory(debugLogger) {
        var self = this;

        self.create = function create(config) {
            return new Config(config, debugLogger);
        };

    }
});
define('debug-logger',['require'],function (require) {
    return DebugLogger;

    function DebugLogger() {
        this.isEnabled = false;
        this.log = function () {
            console.log.apply(this, arguments);
        };
    }
});
define('composition-root',['require','injector','server','file-hasher','session-factory','quick-diff-factory','hash-diff-factory','file-upload-factory','directory-upload-factory','config-factory','debug-logger'],function (require) {
    var Injector = require('injector'),
        Server = require('server'),
        FileHasher = require('file-hasher'),
        SessionFactory = require('session-factory'),
        QuickDiffFactory = require('quick-diff-factory'),
        HashDiffFactory = require('hash-diff-factory'),
        FileUploadFactory = require('file-upload-factory'),
        DirectoryUploadFactory = require('directory-upload-factory'),
        ConfigFactory = require('config-factory'),
        DebugLogger = require('debug-logger');

    return CompositionRoot;

    function CompositionRoot() {
        var self = this;
        var injector = self.injector = new Injector();

        injector.register('Server', Server);
        injector.register('SessionFactory', SessionFactory, true);
        injector.register('QuickDiffFactory', QuickDiffFactory, true);
        injector.register('HashDiffFactory', HashDiffFactory, true);
        injector.register('FileUploadFactory', FileUploadFactory, true);
        injector.register('DirectoryUploadFactory', DirectoryUploadFactory, true);
        injector.register('ConfigFactory', ConfigFactory, true);
        injector.register('FileHasher', FileHasher, true);
        injector.register('Debug', DebugLogger);
        injector.register('DebugLogger', DebugLogger);
    }
});
var util = require('util');

var requirejs;
if (requirejs === undefined)
    requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require,
    baseUrl: 'app',
    paths: {
        'injector': '../lib/injector/injector',
        'extend': '../lib/extend/extend',
        'when-walk': '../lib/when-walk/when-walk-ex',
        'truthy': '../lib/truthy-falsy/truthy',
    }
});
process.on('uncaughtException', function(err) {
    console.error(util.inspect(err));
});
requirejs(['composition-root'], function(CompositionRoot) {
    var compositionRoot = new CompositionRoot();
    var server = compositionRoot.injector.resolve('Server');
    server.start();
});

define("main", function(){});

}());