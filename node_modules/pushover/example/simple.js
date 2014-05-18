var pushover = require('pushover');
var repos = pushover(__dirname + '/repos');

repos.on('push', function (repo, commit, branch) {
    console.log(
        'received a push to ' + repo + '/' + commit
        + ' (' + branch + ')'
    );
});

repos.listen(7005);
