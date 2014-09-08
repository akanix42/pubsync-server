var Service = require('node-windows').Service,
    uuid = require('uuid-lib'),
    stringformat = require('stringformat');

var svc = new Service({
    name:'Pubsync - Server',
    script: require('path').join(__dirname,'pubsync-server.js')
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
    console.log('Uninstall complete.');
});

// Uninstall the service.
svc.uninstall();