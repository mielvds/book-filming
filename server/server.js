var express = require('express'),
mongodb = require('mongodb'),
files = require('./files.js'),
subtitles = require('./subtitles.js'),
books = require('./books.js'),
syncer = require('./syncer.js');

var app = express();

app.configure(function() {
  app.use(express.static(__dirname+'client/'));
  app.use(express.bodyParser({
    uploadDir: './server/tmp'
  }));
});

app.get('/', function(req, res){
  res.sendfile('client/index.html');
});

app.get(/^(\/(js|css)\/.+)$/, function(req, res) {
  res.sendfile('client/' + req.params[0]);
});

//assets
//app.get(/^(.+)$/, function(req, res) {
//  res.sendfile(req.params[0]);
//});

app.get('/files/:filename',files.getFile);
//app.post('/files',files.upload);

//app.get('/jobs',dataAccess.findAll);
//app.get('/jobs/:id',dataAccess.findJobById);
//
//app.post('/jobs',dataAccess.addJob);
//app.put('/jobs/:id',dataAccess.updateJob);
//app.delete('/jobs/:id',dataAccess.deleteJob);

app.get('/subtitles',subtitles.getSubtitles);
app.get('/subtitles/:id',subtitles.getSubtitleById);
//app.get('/subtitles/:id/entries',subtitles.findAllEntries);
//app.get('/subtitles/:id/entries/:entry_id',findEntryById);
//
app.post('/subtitles',subtitles.addSubtitle);
//app.put('/subtitles/:id',dataAccess.updateSubtitle)
//app.put('/subtitles/:id/raw',dataAccess.addRaw);

app.get('/books',books.getBooks);
app.get('/books/:id',books.getBookById);
//app.get('/books/:id/entries',books.findAllEntries);
//app.get('/books/:id/entries/:entry_id',books.findEntryById);
//
app.post('/books',books.addBook);
//app.put('/books/:id',books.updateBook);
//app.put('/books/:id/raw',function(req, res){
//  upload.handle(req,res);
//});

app.get('/syncs/:book,:subtitle',syncer.synchronize)


app.listen(3000);
console.log('Listening on port 3000');