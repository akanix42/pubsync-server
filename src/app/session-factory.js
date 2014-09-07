define(function (require) {
    var Session = require('Session');
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