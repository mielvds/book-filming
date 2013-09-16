var files = require('./files.js'), 
parser = require('./parser.js'),
dataAccess = require('./dataAccess.js');

exports.addBook = function(req, res) {
  var parse = function(dir, file){
    var targetPath = dir + file.name;
    dataAccess.addDocument('books', function(document){
      parser.parseEPUB(targetPath, 
        function(chapter){
        /*dataAccess.updateDocument('books', function(result){

        },
          document._id.toString()
          ,{
            $push: {
              'entries': chapter
            }
          })*/
        },
        function(paragraph){
          dataAccess.updateDocument('books', function(result){

            },
            document._id.toString()
            ,{
              $push: {
                'paragraphs': paragraph
              }
            });
        },
        function(){
          res.header('Location', '/books/' + file.name);
          res.send(201,'Book created');
        });
    }, 
    {
      name: file.name, 
      path: targetPath,
      entries: []
    });
  }
  files.upload(req, res, parse);
};

exports.getBooks = function(req, res){
  dataAccess.findAll('books',function(items){
    res.send(items);
  });
}


exports.getBookById = function(req, res) {
  var id = req.params.id;
  dataAccess.findById('books',function(item){
    res.send(item);
  },id);
}

