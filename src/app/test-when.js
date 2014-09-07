var when = require('when');


when(doSomethings())
    .then(keepGoing)
    .catch(displayError);

function doSomethings() {
    var deferreds = [];
    for (var i = 0; i < 10; i++) {
        deferreds.push(doSomething(i % 2 === 0));
    }
    return when.all(deferreds);
}


function doSomething(succeed) {
    var deferred = when.defer();
    setTimeout(function () {
        if (succeed)
            deferred.reject();
        else
            deferred.resolve();
    }, 100);
    return deferred.promise;
}

function keepGoing() {
    console.log('keep going');
}

function displayError(err) {
    console.log('Error: ' + err);
}