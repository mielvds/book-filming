/* 
 * This file handles file uploads
 */
var fs = require('fs');

var dir = './server/uploads/';

exports.upload = function(req, res, callback){
  //console.log(req.body);
  //console.log(req.files);
 
  var uploadedFile = req.files.uploadingFile;
  var tmpPath = uploadedFile.path;
  var targetPath = dir + uploadedFile.name;

  fs.rename(tmpPath, targetPath, function(err) {
    if (err) throw err
    
    fs.unlink(tmpPath, function() {
      process.nextTick(function(){
        callback(dir, uploadedFile);
      });
    });
  });
}

exports.getFile = function (req, res){
  res.sendfile(dir + req.params.filename);
}




