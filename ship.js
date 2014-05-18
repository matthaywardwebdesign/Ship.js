var pushover = require('pushover');
var connect = require('connect');
var repos = pushover('/tmp/pushover/repos');
var mkdirp = require('mkdirp');
var sys = require('sys');
var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
mkdirp('/tmp/pushover/working', function (err){

});
var app = connect();

//app.use(connect.basicAuth("username", "password"));
app.use(function(req, res, next) {
  if (req.headers["user-agent"].indexOf("git") != -1){
    repos.handle(req, res, next, true);
  }
  else{
    next();
  }
});

repos.on('push', function (repo, commit, branch, res) {
         var gitclone = spawn('git',['clone','../repos/' + repo],{ cwd: '/tmp/pushover/working/'});
         gitclone.stdout.on('data', function(data){logStdOut(data,res)});
         gitclone.stderr.on('data', function(data){logStdErr(data,res)});
         gitclone.on('close', function (code) {
            var gitpull = spawn('git',['pull','../../repos/' + repo],{ cwd: '/tmp/pushover/working/' + repo});
            gitpull.stdout.on('data', function(data){logStdOut(data,res)});
            gitpull.stderr.on('data', function(data){logStdErr(data,res)});
            gitpull.on('close', function (code) {
                       
                var dockerbuild = spawn('docker',['build','-t',commit,'./'], { cwd: '/tmp/pushover/working/' + repo });
                       dockerbuild.stdout.on('data', function(data){logStdOut(data,res)});
                       dockerbuild.stderr.on('data', function(data){logStdErr(data,res)});
                       dockerbuild.on('close', function (code) {
                            
                                      dockerstop = spawn('docker',['stop',repo],{cwd : '/'});
                                      dockerstop.stdout.on('data', function(data){logStdOut(data,res)});
                                      dockerstop.stderr.on('data', function(data){logStdErr(data,res)});
                                      dockerstop.on('close', function (code) {
                                                    
                                                    dockerrm = spawn('docker',['rm',repo],{cwd : '/'});
                                                    dockerrm.stdout.on('data', function(data){logStdOut(data,res)});
                                                    dockerrm.stderr.on('data', function(data){logStdErr(data,res)});
                                                    dockerrm.on('close', function (code) {
                                                                  fs.readFile('/tmp/pushover/working/' + repo + '/ship.config', function (err,data){
                                                                              if (!err){
                                                                              var config = JSON.parse(data);
                                                                              var output = [];
                                                                              Object.keys(config.ports).forEach(function(key) {
                                                                                                                var val = config.ports[key];
                                                                                                                output[output.length] = val + ":" + key;
                                                                                                                });
                                                                              var dockerrunargs = [];
                                                                              dockerrunargs[0] = 'run';
                                                                              dockerrunargs[1] = '-d';
                                                                              dockerrunargs[2] = '--name';
                                                                              dockerrunargs[3] = repo;
                                                                              var pos = 4;
                                                                              for (i = 0; i < output.length;i++){
                                                                              dockerrunargs[pos] = '-p';
                                                                              pos++;
                                                                              dockerrunargs[pos] = output[i];
                                                                              pos++;
                                                                              }
                                                                              dockerrunargs[pos] = commit;
                                                                              var dockerrun = spawn('docker',dockerrunargs,{ cwd: '/'});
                                                                              dockerrun.stdout.on('data', function(data){logStdOut(data,res)});
                                                                              dockerrun.stderr.on('data', function(data){logStdErr(data,res)});
                                                                              dockerrun.on('close', function (code) {
                                                                                           repos.closeStream(res);
                                                                                           });
                                                                              }
                                                                              });

                                                                  });
                                                    
                                                    
                                                    
                                                    });
                                      
                                      

                                      });

                       });
                     
                       
        });

         
         
});

function logStdOut(data,res){
    console.log('stdout: ' + data);
    if (data != ""){
        repos.writeMessage("==> " + data,res);
    }

}

function logStdErr(data,res){
    console.log('stderr: ' + data);
    if (data != ""){
        repos.writeMessage("==> " + data,res);
    }
    
}

app.listen(7000);

