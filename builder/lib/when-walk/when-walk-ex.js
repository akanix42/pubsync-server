// Original source from http://stackoverflow.com/a/18926200/1090626.
// Thanks, Trevor!
var fs = require('fs')
    , path = require('path')
    , when = require('when')
    , nodefn = require('when/node/function')
    , extend = require('../extend/extend.js');

module.exports = walk;

var defaultOptions = {
    directory: '',
    includeDir: false,
    filterCallback: null
};

function walk(options) {
    if (typeof options === 'string')
        options = {directory: options};
    var options = extend({}, defaultOptions, options);
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
