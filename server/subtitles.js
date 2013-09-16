var files = require('./files.js'), 
parser = require('./parser.js'),
dataAccess = require('./dataAccess.js');

exports.addSubtitle = function (req, res) {
  var parse = function(dir, file){
    var targetPath = dir + file.name;
    dataAccess.addDocument('subtitles', function(document){
      parser.parseSRT(targetPath, 
        function(sub){
          dataAccess.updateDocument('subtitles', function(result){},
            document._id.toString()
            ,{
              $push: {
                'entries': sub
              }
            });
        },
        function(){
          res.header('Location', '/subtitles/' + file.name);
          res.send(201,'Subtitle created');
        });
    }, 
    {
      name: file.name, 
      path: targetPath,
      entries: []
    });
  }
  files.upload(req, res, parse);
}

exports.getSubtitles = function(req, res){
  dataAccess.findAll('subtitles',function(items){
    res.send(items);
  });
}

exports.getSubtitleById = function(req, res) {
  var id = req.params.id;
  dataAccess.findById('subtitles',function(item){
    res.send(item);
  },id);
}