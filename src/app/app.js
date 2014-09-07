define(function(require){
    var isObject = require('helpers/is-object');

    return App;
    function App() {
        process.on('uncaughtException', function (err) {
            console.error(isObject(err) ? err.stack : err);
        });
    }

});