var winston = require('winston'),
  express = require('express'),
  path = require('path'),
  formidable = require('formidable'),
  fs = require('fs');

var port = 3333,
  dir = __dirname,
  app = express(),
  staticPath = path.join(dir, 'public'),
  indexPath = path.join(dir, 'views/index.html'),
  uploadPath = path.join(dir, '/uploads'),
  info = winston.info,
  error = winston.error,
  level = process.env.LOG_LEVEL;

console.log('log level', level);

winston.level = level;

app.use(express.static(staticPath));

app.get('/', function(req, res){
  res.sendFile(indexPath);
});

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();
  var files = {},
    todo = 0,
    done = 0;

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = false;

  // store all uploads in the /uploads directory
  form.uploadDir = uploadPath;

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    //console.log('file', todo);
    info('file', {  
      'todo': todo
    });
    todo += 1;
    var fileName = path.join(form.uploadDir, file.name);
    fs.rename(file.path, fileName);
    fs.readFile(fileName, 'utf8', function(err, data) {  
        //console.log('fs.fileRead', todo);
        info('fs.fileRead', {  
          'todo': todo
        });
        if (err) throw err;
        //console.log(fileName, data);
        info(fileName, {  
          'data': data
        });
        files[file.name] = data;
        todo -= 1;
    });
  });

  // log any errors that occur
  form.on('error', function(err) {
    //console.log('An error has occured: \n' + err);
    error('An error has occured:', {  
      'err': err
    });
  });

  function finishedWithFiles() {
    //console.log("finishedWithFiles...");
    info('finishedWithFiles...');
    res.send({
      'result': 'success',
      'files': files
    });
  }

  function checkForDone() {
    //console.log("checkForDone");
    info('checkForDone...');
    setTimeout(function() {
        if (!todo) {
          finishedWithFiles();
        } else {
          checkForDone();
        }
      }, 100);
  }

  // once all the files have been uploaded, send a response to the client
  form.on('end', checkForDone);

  // parse the incoming request containing the form data
  form.parse(req);

});

var server = app.listen(port, function(){
  //console.log('Server listening on port ' + port);
  info('Server listening on port', {  
    'port': port
  });
});