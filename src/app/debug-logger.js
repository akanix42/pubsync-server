define(function (require) {
    return DebugLogger;

    function DebugLogger() {
        this.isEnabled = false;
        this.log = function () {
            console.log.apply(this, arguments);
        };
    }
});