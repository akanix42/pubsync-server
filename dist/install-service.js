var Service = require('node-windows').Service,
    uuid = require('uuid-lib'),
    stringformat = require('stringformat');

var svc = new Service({
    name:'Pubsync - Server',
    script: require('path').join(__dirname,'pubsync-server.js')
});

//svc.user.domain = 'mydomain.local';
svc.user.account = 'pubsync';
svc.user.password = uuid.raw();

console.log(stringformat('Domain: {domain}', svc.user ));
console.log(stringformat('Username: {account}', svc.user ));
console.log(stringformat('Password: {password}', svc.user ));

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
    svc.start();
});

svc.install();